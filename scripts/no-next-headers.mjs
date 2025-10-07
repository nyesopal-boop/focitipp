#!/usr/bin/env node

/**
 * Preflight Guard v2.0
 *
 * Scans codebase for FORBIDDEN Next.js patterns that cause runtime errors:
 * - import { headers } from "next/headers"
 * - import { headers as h } from "next/headers" (aliases)
 * - import { cookies } from "next/headers"
 * - import { cookies as c } from "next/headers" (aliases)
 * - import { draftMode } from "next/headers"
 * - import { draftMode as dm } from "next/headers" (aliases)
 * - headers() calls
 * - cookies() calls
 * - draftMode() calls
 *
 * This prevents the error:
 * "Invariant: headers() expects to have requestAsyncStorage, none available"
 *
 * Usage: node scripts/no-next-headers.mjs
 * Runs automatically via predev/prebuild hooks in package.json
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'coverage'];
const INCLUDED_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

// Patterns to detect
const PATTERNS = [
  // Import patterns (with and without aliases)
  {
    regex: /import\s*\{[^}]*\bheaders\b(?:\s+as\s+\w+)?[^}]*\}\s*from\s*['"]next\/headers['"]/g,
    name: 'import { headers } from "next/headers"',
    severity: 'CRITICAL'
  },
  {
    regex: /import\s*\{[^}]*\bcookies\b(?:\s+as\s+\w+)?[^}]*\}\s*from\s*['"]next\/headers['"]/g,
    name: 'import { cookies } from "next/headers"',
    severity: 'CRITICAL'
  },
  {
    regex: /import\s*\{[^}]*\bdraftMode\b(?:\s+as\s+\w+)?[^}]*\}\s*from\s*['"]next\/headers['"]/g,
    name: 'import { draftMode } from "next/headers"',
    severity: 'CRITICAL'
  },
  // Direct calls (common aliases included)
  {
    regex: /\b(?:headers|h|hdrs|hdr)\s*\(\s*\)/g,
    name: 'headers() call (or alias)',
    severity: 'HIGH'
  },
  {
    regex: /\b(?:cookies|c|cookie)\s*\(\s*\)/g,
    name: 'cookies() call (or alias)',
    severity: 'HIGH'
  },
  {
    regex: /\bdraftMode\s*\(\s*\)/g,
    name: 'draftMode() call',
    severity: 'HIGH'
  },
  // Any import from next/headers (catch-all)
  {
    regex: /from\s*['"]next\/headers['"]/g,
    name: 'ANY import from "next/headers"',
    severity: 'CRITICAL'
  }
];

function shouldScanFile(filePath) {
  const ext = extname(filePath);
  return INCLUDED_EXTS.includes(ext);
}

function shouldScanDir(dirName) {
  return !EXCLUDED_DIRS.includes(dirName);
}

function* walkFiles(dir) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (shouldScanDir(entry)) {
        yield* walkFiles(fullPath);
      }
    } else if (stat.isFile() && shouldScanFile(fullPath)) {
      yield fullPath;
    }
  }
}

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const violations = [];

    for (const pattern of PATTERNS) {
      const matches = [...content.matchAll(pattern.regex)];

      for (const match of matches) {
        // Calculate line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;

        // Get the line content
        const lines = content.split('\n');
        const lineContent = lines[lineNumber - 1] || '';

        // Skip false positives
        if (lineContent.trim().startsWith('//') || lineContent.trim().startsWith('*')) {
          continue;
        }

        // Skip if it's part of req.headers() or response.headers()
        if (pattern.name.includes('headers() call') &&
            (lineContent.includes('req.headers') ||
             lineContent.includes('request.headers') ||
             lineContent.includes('response.headers') ||
             lineContent.includes('.headers()') ||
             lineContent.includes('corsHeaders'))) {
          continue;
        }

        // Skip if it's part of response.cookies()
        if (pattern.name.includes('cookies() call') &&
            (lineContent.includes('response.cookies') ||
             lineContent.includes('.cookies()'))) {
          continue;
        }

        violations.push({
          file: filePath,
          line: lineNumber,
          pattern: pattern.name,
          severity: pattern.severity,
          snippet: match[0]
        });
      }
    }

    return violations;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not scan ${filePath}: ${error.message}`);
    return [];
  }
}

function formatViolations(violations) {
  if (violations.length === 0) {
    return null;
  }

  let output = '\n';
  output += '╔════════════════════════════════════════════════════════════════════╗\n';
  output += '║              ⛔ PREFLIGHT CHECK FAILED ⛔                          ║\n';
  output += '╚════════════════════════════════════════════════════════════════════╝\n\n';

  output += `Found ${violations.length} violation(s) of forbidden patterns:\n\n`;

  const groupedByFile = violations.reduce((acc, v) => {
    if (!acc[v.file]) acc[v.file] = [];
    acc[v.file].push(v);
    return acc;
  }, {});

  for (const [file, viols] of Object.entries(groupedByFile)) {
    output += `📁 ${file}\n`;

    for (const v of viols) {
      output += `   Line ${v.line}: [${v.severity}] ${v.pattern}\n`;
      output += `   Code: ${v.snippet}\n`;
    }

    output += '\n';
  }

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += '❌ FORBIDDEN PATTERNS DETECTED\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  output += 'These patterns cause runtime errors:\n';
  output += '  "Invariant: headers() expects to have requestAsyncStorage"\n\n';

  output += '✅ CORRECT APPROACH for API routes:\n';
  output += '  export const runtime = "nodejs";\n';
  output += '  export const dynamic = "force-dynamic";\n';
  output += '  export async function POST(req: Request) {\n';
  output += '    const cookie = req.headers.get("cookie") || "";\n';
  output += '    // Use native Request API only\n';
  output += '  }\n\n';

  output += '❌ DO NOT USE:\n';
  output += '  - import { headers } from "next/headers"\n';
  output += '  - import { cookies } from "next/headers"\n';
  output += '  - import { draftMode } from "next/headers"\n';
  output += '  - headers() or cookies() or draftMode() calls\n';
  output += '  - Aliases like: import { headers as h }\n\n';

  output += 'Fix these violations before proceeding.\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  return output;
}

function main() {
  console.log('🔍 Running Preflight Guard v2.0...');
  console.log('   Scanning for forbidden next/headers usage...\n');

  const startTime = Date.now();
  const allViolations = [];
  let fileCount = 0;

  // Scan key directories
  const dirsToScan = ['app', 'lib', 'components', 'src', 'pages'];

  for (const dir of dirsToScan) {
    try {
      statSync(dir);
      console.log(`   Scanning ${dir}/...`);

      for (const file of walkFiles(dir)) {
        fileCount++;
        const violations = scanFile(file);
        allViolations.push(...violations);
      }
    } catch (e) {
      // Directory doesn't exist, skip
    }
  }

  // Also scan middleware.ts if it exists
  try {
    statSync('middleware.ts');
    console.log('   Scanning middleware.ts...');
    allViolations.push(...scanFile('middleware.ts'));
    fileCount++;
  } catch (e) {
    // File doesn't exist, skip
  }

  const elapsed = Date.now() - startTime;

  if (allViolations.length > 0) {
    console.error(formatViolations(allViolations));
    console.error(`\n❌ Preflight check FAILED (${fileCount} files scanned in ${elapsed}ms)\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ Preflight check PASSED (${fileCount} files scanned in ${elapsed}ms)`);
    console.log('   No forbidden patterns detected.\n');
    process.exit(0);
  }
}

main();
