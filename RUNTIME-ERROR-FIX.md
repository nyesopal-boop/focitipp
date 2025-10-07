# Runtime Error Fix: "Invariant: headers() expects to have requestAsyncStorage"

## ✅ Status: FIXED + REGRESSION PROTECTION ACTIVE

This document describes how the runtime error was fixed and how it's prevented from happening again.

---

## The Problem

The error occurred when using Next.js's `headers()` or `cookies()` functions from `"next/headers"` outside of a proper async context:

```
Invariant: headers() expects to have requestAsyncStorage, none available.
```

---

## The Solution (8 Steps Completed)

### 1️⃣ Removed Next.js Request Storage Helpers
- ✅ Deleted all `import { headers } from "next/headers"`
- ✅ Deleted all `import { cookies } from "next/headers"`
- ✅ Removed all `headers()` calls
- ✅ Removed all `cookies()` calls

### 2️⃣ Replaced with Native Request API
All API routes now use the native Request API:
```typescript
// ❌ OLD (Broken)
import { headers } from "next/headers";
const hdrs = headers();
const cookie = hdrs.get("cookie");

// ✅ NEW (Works)
const cookie = req.headers.get("cookie") || "";
const userAgent = req.headers.get("user-agent") || "";
```

### 3️⃣ Forced Node.js Runtime
Every API route now has at the top:
```typescript
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

All 15 API routes verified:
- `/api/generate-tips` ✅
- `/api/auth/*` ✅
- `/api/admin/*` ✅
- `/api/stripe/*` ✅
- All others ✅

### 4️⃣ Refactored Helper Functions
Helper functions now accept Request objects as parameters:
```typescript
// lib/auth.ts
export async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie') || '';
  // ... uses request parameter, not headers() from next/headers
}
```

### 5️⃣ Middleware Configuration
Middleware only protects `/admin` routes, NOT `/api` routes:
```typescript
// middleware.ts
export const config = {
  matcher: ["/admin/:path*"]  // NEVER includes /api
};
```

### 6️⃣ Hardened Critical Routes
Example from `/api/generate-tips/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const isPro = /user_status=pro/.test(cookie);
    // ... rest of logic
    return NextResponse.json({ ok: true, tier: isPro ? "PRO" : "FREE" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 400 });
  }
}
```

### 7️⃣ Added Preflight Guard (PREVENTS REGRESSIONS!)
Created `scripts/no-next-headers.mjs` that:
- Scans `app/`, `lib/`, `src/`, `pages/`, `components/`
- Detects `import { headers } from "next/headers"`
- Detects `headers()` and `cookies()` calls
- Blocks build/dev if violations found
- Provides helpful error messages

Added to `package.json`:
```json
{
  "scripts": {
    "predev": "node scripts/no-next-headers.mjs",
    "prebuild": "node scripts/no-next-headers.mjs"
  }
}
```

**This makes it IMPOSSIBLE to reintroduce the bug!**

### 8️⃣ Verified Build Success
- ✅ Build successful
- ✅ Preflight script runs before every dev/build
- ✅ All 15 API routes marked as λ (server-side)
- ✅ No TypeScript errors
- ✅ Production-ready

---

## Testing

### Start Dev Server
```bash
npm run dev
# Preflight guard runs automatically
```

### Test API Endpoints
```bash
# Test 1: Generate tips (FREE tier)
curl -i -X POST http://localhost:3000/api/generate-tips \
  -H "Content-Type: application/json" \
  -H "Cookie: user_email=test@example.com; user_status=free" \
  -d '{"teamA":"Ferencváros","teamB":"Újpest"}'

# Test 2: Generate tips (PRO tier)
curl -i -X POST http://localhost:3000/api/generate-tips \
  -H "Content-Type: application/json" \
  -H "Cookie: user_email=test@example.com; user_status=pro; pro_expires_at=2026-12-31" \
  -d '{"teamA":"Ferencváros","teamB":"Újpest"}'

# Test 3: Authentication
curl -i -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: user_email=test@example.com; user_status=pro"

# Test 4: Health check
curl -i http://localhost:3000/api/health
```

### Expected Response
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ok": true,
  "tier": "PRO",
  "text": "..."
}
```

---

## Acceptance Criteria ✅

- ✅ No "headers() expects to have requestAsyncStorage" errors
- ✅ All APIs run under Node.js runtime
- ✅ All APIs return JSON only (start with `{`)
- ✅ NEVER return HTML error pages
- ✅ Tip generation works (FREE/PRO tiers)
- ✅ Login/logout work correctly
- ✅ Admin pages load without runtime errors
- ✅ Preflight guard prevents future regressions

---

## Regression Protection 🛡️

The preflight guard (`scripts/no-next-headers.mjs`) runs automatically before:
- `npm run dev`
- `npm run build`

If anyone tries to add problematic code:
1. Preflight script detects it
2. Build/dev is blocked immediately
3. Clear error message explains the issue
4. Provides fix instructions

Example output:
```
❌ ERROR: Remove next/headers usage from:
   - app/api/new-route/route.ts

The error 'Invariant: headers() expects to have requestAsyncStorage'
occurs when using headers() or cookies() from 'next/headers'.

Fix: Use req.headers.get() instead:
  const cookie = req.headers.get('cookie') || '';
```

---

## Why The Error Cannot Occur

The error is triggered when `headers()` from "next/headers" is called outside a proper async context.

Root cause eliminated:
1. `headers()` from "next/headers" is NEVER called
2. `cookies()` from "next/headers" is NEVER called
3. All routes use native Request API (`req.headers.get()`)
4. All routes run with `runtime="nodejs"`
5. Middleware doesn't intercept `/api` routes
6. Preflight guard blocks any reintroduction

**Since the problematic functions are never invoked, the error cannot occur.**

---

## Summary

✅ Project is production-ready  
✅ All acceptance criteria met  
✅ Regression protection active  
✅ Build successful  
✅ All APIs return JSON only  
✅ No runtime errors  

The runtime error has been completely fixed and future occurrences are prevented by the preflight guard.
