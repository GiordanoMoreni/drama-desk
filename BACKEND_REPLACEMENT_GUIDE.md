# Backend Replacement Guide

This guide explains how to replace Supabase in Drama Desk while preserving current behavior.

## Current Backend Shape (Real Implementation)

- Framework: Next.js App Router (`src/app/**`)
- Route handlers: `src/app/api/**`
- Auth/session:
  - server: `src/infrastructure/db/supabase/server-client.ts`
  - browser: `src/infrastructure/db/supabase/client.ts`
  - app auth facade: `src/lib/auth.ts`
- DI and wiring: `src/lib/di.ts`
- Data layer:
  - interfaces: `src/domain/repositories/**`
  - implementations: `src/infrastructure/db/supabase/*-repository.ts`
- SQL source of truth: `database/schema.sql`, `database/rls-policies.sql`

## What Must Stay Stable

If you swap backend, keep these contracts unchanged for app code:

1. Repository interfaces in `src/domain/repositories/**`
2. Service public methods in `src/application/services/**`
3. Auth facade functions in `src/lib/auth.ts`:
   - `getCurrentUser`
   - `getUserOrganizations`
   - `getCurrentOrganization`
   - `requireAuth`
   - `requireOrganization`
   - `signOut`
4. Tenant context cookie behavior (`current-organization`)

## Replacement Plan

## 1) Implement new repositories

Create a new provider folder, for example:

```text
src/infrastructure/db/postgres/
```

Implement all repository interfaces currently implemented in Supabase files:

- student repository
- class and enrollment repositories
- show/role/casting repositories
- staff and show-staff-assignment repositories
- organization repository

## 2) Replace DI wiring

Update `src/lib/di.ts` imports and constructors from Supabase implementations to your new implementations.

Keep function signatures stable:

- `getRepositories()`
- `getServices()`
- `getAdminRepositories()`
- `getAdminServices()`

## 3) Replace auth provider integration

Current app assumes Supabase session semantics.

If replacing auth:

- keep same return shape in `AuthUser` and `OrganizationContext`
- preserve redirects/error behavior in `requireAuth`/`requireOrganization`
- preserve cookie handling for `current-organization`

## 4) Keep multi-tenant isolation

Current model relies on `organization_id` in domain tables and RLS policies.

In a new backend you must enforce the same isolation:

- always filter by `organizationId` in reads/writes
- enforce role checks (`admin|teacher|staff`)
- preserve uniqueness constraints across tenant boundaries

## 5) Data migration

Migrate schema from `database/schema.sql` and profile helpers:

- `database/add_user_profiles.sql`
- `database/populate_user_profiles.sql`

If moving away from Supabase Auth, define a replacement for `auth.users` linkage currently used by `user_profiles.id`.

## Known Current Caveats to Account For

- `admin-session` test cookie exists in auth flow (`src/lib/auth.ts`).
- `organization_members` RLS policies currently include temporary broad policies.
- SQL migrations are file-based and manually applied (no migration runner configured).

## Validation Checklist After Replacement

- `npm run lint` passes
- `npm run build` passes
- Login/logout works
- Organization selection cookie works
- Dashboard pages load tenant-scoped data
- Admin pages return real data
- No cross-tenant data leakage

## Missing / Assumptions

- Assumes equivalent server-side auth session API exists in replacement backend.
- Assumes replacement can provide both user-scoped client and elevated admin client modes.
- TODO: Introduce migration/version tooling before major backend swap.

