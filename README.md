# HotelCheckIn

Pre-check-in SaaS platform for Canadian independent hotels. Connects to any PMS, sends a 48-hour pre-arrival digital check-in, reduces front-desk queues, and increases ancillary revenue through personalized upsells.

**Built for Canada** — Canadian data residency (Azure Canada Central), PIPEDA/Law 25 compliant, CASL-compliant communications, bilingual EN/FR.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm |
| Backend API | NestJS 10, TypeScript, Vitest |
| Frontend | Next.js 14 (App Router), Tailwind CSS, next-intl |
| Database | PostgreSQL 16, Prisma ORM |
| Cache/Queue | Redis 7 |
| Payments | Stripe (hosted checkout, no card data on our servers) |
| Email | SendGrid |
| SMS | Twilio |
| PMS | Cloudbeds, Mews (adapter pattern for extensibility) |
| CI/CD | GitHub Actions |
| Deployment | Docker, Azure Container Apps |

## Monorepo Structure

```
apps/
  api/          NestJS backend API (port 3001)
  web/          Next.js frontend (port 3000)
packages/
  shared/       Shared types, constants, utilities
  database/     Prisma schema, client, migrations, seed
  pms-middleware/ PMS adapter pattern (Cloudbeds, Mews)
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for containerized development)

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd Hopitality-CA

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start infrastructure (PostgreSQL + Redis)
cd apps/api && docker-compose up -d postgres redis && cd ../..

# Run database migrations and seed
cd packages/database
pnpm migrate:dev
pnpm seed
cd ../..

# Start all services in development mode
pnpm dev
```

The API will be available at `http://localhost:3001` and the web app at `http://localhost:3000`.

## Environment Variables

See [.env.example](.env.example) for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `SENDGRID_API_KEY` | SendGrid email API key |
| `TWILIO_ACCOUNT_SID` | Twilio SMS account SID |
| `TWILIO_AUTH_TOKEN` | Twilio SMS auth token |
| `CLOUDBEDS_API_KEY` | Cloudbeds PMS API key |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend |

## API Documentation

Swagger UI is available at `http://localhost:3001/api/docs` when the API is running.

### Key API Modules

| Module | Prefix | Description |
|--------|--------|-------------|
| Auth | `/api/auth` | JWT login, registration, guest token validation |
| Organizations | `/api/organizations` | Tenant management (admin only) |
| Properties | `/api/properties` | Hotel property CRUD |
| Reservations | `/api/reservations` | Arrivals queue, manual check-in, stats |
| Upsells | `/api/upsells` | Offer catalog, rule engine, selections, analytics |
| Payments | `/api/payments` | Stripe checkout sessions, pre-auth, refunds |
| Billing | `/api/billing` | Subscriptions, usage metering, invoices, tier management |
| Communications | `/api/communications` | Email/SMS templates, delivery stats, scheduling |
| PMS | `/api/pms` | PMS sync triggers, connection status, webhook handlers |
| Reports | `/api/reports` | KPI dashboards, funnel analysis, benchmarks, audit logs |
| Health | `/api/health` | Health check endpoint |

## Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/checkin/[token]` | Public (guest) | Guest pre-check-in multi-step form |
| `/dashboard` | Hotel staff | Operations dashboard with stats |
| `/dashboard/arrivals` | Hotel staff | Arrivals queue and check-in management |
| `/dashboard/upsells` | Hotel staff | Upsell catalog and rule builder |
| `/dashboard/templates` | Hotel staff | Communication template editor |
| `/dashboard/reports` | Hotel staff | KPI reporting with benchmarks |
| `/dashboard/billing` | Property owner | Subscription, usage, invoices |
| `/admin` | Platform admin | System overview and tenant management |

## Available Scripts

```bash
pnpm dev          # Start all services in dev mode
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm clean        # Clean all build artifacts
```

## Architecture

- **Multi-tenant** — Row-level tenant isolation via organizationId on all models
- **API-first** — All frontend features backed by versioned REST API
- **Event-driven** — Cron-scheduled email/SMS for pre-check invites and reminders
- **PMS adapter pattern** — Pluggable connectors for any PMS vendor
- **RBAC** — 6 roles from Platform Admin to Front Desk Agent with property-level access control
- **Billing** — Stripe-integrated subscription with usage metering and overage tracking

## Security

- JWT + refresh token authentication with bcrypt password hashing
- RBAC with property-level access control
- Rate limiting (global + per-endpoint)
- Helmet security headers + custom CSP
- Structured audit logging for all sensitive actions
- Stripe hosted checkout (PCI DSS scope: SAQ-A)
- CASL-compliant email footer on all communications
- PIPEDA/Law 25 consent tracking per guest

## License

UNLICENSED — Proprietary software. All rights reserved.
