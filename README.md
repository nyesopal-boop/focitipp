# Sports Betting Tips Platform

![CI Status](https://github.com/<username>/<repo-name>/actions/workflows/ci.yml/badge.svg)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/<username>/<repo-name>/releases/tag/v1.0.0)

A production-ready Next.js application for generating AI-powered sports betting tips with subscription management.

## Features

- ✅ **Runtime Error Fixed**: No "headers() expects requestAsyncStorage" errors
- ✅ **Preflight Guard**: Automatic protection against code regressions
- ✅ **AI-Powered Tips**: OpenAI integration for intelligent betting insights
- ✅ **Subscription Tiers**: FREE and PRO tiers with Stripe integration
- ✅ **Admin Dashboard**: User and coupon management
- ✅ **Type-Safe**: Full TypeScript support with type checking
- ✅ **Automated CI/CD**: GitHub Actions workflow with security checks
- ✅ **Supabase Integration**: Database and authentication

## Tech Stack

- **Framework**: Next.js 13.5.1 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Payments**: Stripe
- **AI**: OpenAI
- **UI**: shadcn/ui + Tailwind CSS
- **Authentication**: JWT + Cookie-based sessions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/<repo-name>.git
cd <repo-name>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Required environment variables:

```env
# App
APP_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-...

# Auth
JWT_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY_HUF=price_...
STRIPE_PRICE_ID_QUARTERLY_HUF=price_...

# Admin
ADMIN_ACCESS_CODE=your-admin-code

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Scripts

```bash
# Development
npm run dev          # Start dev server (preflight runs automatically)

# Building
npm run build        # Build for production (preflight runs automatically)

# Type Checking
npm run typecheck    # Run TypeScript type checker

# Linting
npm run lint         # Run ESLint

# Security
node scripts/no-next-headers.mjs  # Run preflight guard manually
```

## Security Features

### Preflight Guard

The project includes an automated preflight guard (`scripts/no-next-headers.mjs`) that:

- Scans codebase for problematic Next.js patterns
- Prevents runtime errors before they happen
- Runs automatically before dev and build
- Blocks deployments with security issues

### Row Level Security (RLS)

All database tables use Supabase RLS policies to ensure:

- Users can only access their own data
- Admin operations are properly restricted
- No unauthorized data access

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

1. **Preflight Guard**: Blocks problematic code patterns
2. **Type Check**: Ensures type safety
3. **Build**: Verifies production build works
4. **Automated**: Runs on every push and PR

## API Routes

### Public Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/email-login` - Email/password login
- `GET /api/health` - Health check

### Protected Routes
- `POST /api/generate-tips` - Generate betting tips (FREE/PRO)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/coupons/redeem` - Redeem coupon code

### Admin Routes
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Manage users
- `GET /api/admin/coupons` - List coupons
- `POST /api/admin/coupons` - Create coupons

## Subscription Tiers

### FREE Tier
- Basic AI-generated tips
- Limited features
- No payment required

### PRO Tier
- Advanced AI analysis
- Head-to-head comparisons
- Detailed statistics
- Priority support

## Architecture

```
project/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   └── auth/              # Authentication pages
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database client
│   └── sports/           # Sports data providers
├── scripts/               # Build and utility scripts
│   └── no-next-headers.mjs  # Preflight guard
├── prisma/                # Database schema
└── .github/workflows/     # CI/CD configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Note: The preflight guard will automatically check your code before builds.

## License

This project is proprietary and confidential.

## Support

For support, email support@example.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies**
