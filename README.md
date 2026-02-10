# Drama Desk

Drama Desk is a multi-tenant theatre management platform built with Next.js and Supabase. It lets theatre organizations manage students, classes, shows, staff, enrollments, casting, and admin operations with tenant isolation by organization.

## Main Features

- Multi-tenant organization model (`organizations` + `organization_members`)
- Student management (contacts, medical notes, lifecycle status)
- Class management (schedule JSON, teacher assignment, enrollment tracking)
- Show and production management (status, dates, venue, budget)
- Staff management (`staff_members`) and per-show staff assignments
- Casting workflow (`roles` + `castings`)
- Dashboard metrics and calendar events
- Admin panel with real counters and recent activity from database
- Italian-first UI translations (`src/lib/translations/it.json`)

## Tech Stack

- Framework: Next.js 16 (App Router), React 19, TypeScript
- UI: Tailwind CSS 4, Radix UI, Lucide icons, Sonner
- Validation: Zod + React Hook Form
- Data/Auth: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Architecture: Clean-ish layered approach (domain -> services -> repositories -> Supabase)

## Local Setup (5 minutes)

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (or equivalent PostgreSQL + Supabase Auth setup)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 3. Apply database SQL

Run SQL files in this order in Supabase SQL editor:

1. `database/schema.sql`
2. `database/rls-policies.sql`
3. `database/add_user_profiles.sql`
4. `database/populate_user_profiles.sql`

### 4. Start app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - run development server
- `npm run build` - production build
- `npm run start` - start built app
- `npm run lint` - run ESLint
- `npm test` - run unit + integration tests (Vitest)
- `npm run test:watch` - watch mode for Vitest
- `npm run test:coverage` - coverage report (V8 provider)
- `npm run e2e` - run Playwright end-to-end tests
- `npm run e2e:ui` - run Playwright in UI mode

## Testing Strategy

- Unit/Integration: Vitest + React Testing Library
- E2E: Playwright
- Test policy: tests must not rely on external network/services
  - Vitest setup blocks network by default (`vitest.setup.ts`)
  - E2E test example aborts non-localhost requests
- DB strategy:
  - Unit tests: validate pure functions and UI behavior in isolation
  - Integration tests: route handlers tested with mocked dependencies (repository/service/auth mocks)
  - Contract tests for repository layer are recommended before introducing real test DB infra

### Run tests locally

```bash
# unit + integration
npm test

# coverage
npm run test:coverage

# e2e (requires Playwright browsers)
npx playwright install
npm run e2e
```

## Deployment (Vercel)

Deploy as a standard Next.js app on Vercel:

1. Import repository in Vercel
2. Set environment variables (same as `.env.local`)
3. Ensure database schema + RLS SQL are already applied
4. Deploy

Required environment variables in production:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- App stores PII (student contact and health-related notes). Treat data as sensitive.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never expose to client code.
- `admin-session` cookie is currently used for admin testing bypass in parts of auth flow. Remove or harden for strict production use.
- Current RLS policies include broad temporary allowances in `organization_members` (see `database/rls-policies.sql`). Review and tighten before production.
- Use HTTPS in production and rotate secrets regularly.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/RUNBOOK.md`
- `BACKEND_REPLACEMENT_GUIDE.md`
