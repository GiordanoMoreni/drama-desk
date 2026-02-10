# Architecture

## High-level Layers

```text
+------------------------------+
| UI / App Router Pages        |
| src/app/**, src/components/**|
+--------------+---------------+
               |
               v
+------------------------------+
| API Routes (Next Route Hand.)|
| src/app/api/**               |
+--------------+---------------+
               |
               v
+------------------------------+
| Application Services         |
| src/application/services/**  |
| + use-cases/**               |
+--------------+---------------+
               |
               v
+------------------------------+
| Repository Interfaces        |
| src/domain/repositories/**   |
+--------------+---------------+
               |
               v
+------------------------------+
| Supabase Repository Impl     |
| src/infrastructure/db/**     |
+--------------+---------------+
               |
               v
+------------------------------+
| PostgreSQL + Supabase Auth   |
| database/*.sql               |
+------------------------------+
```

## Entrypoint and Routing

- Framework: Next.js App Router
- Root layout: `src/app/layout.tsx`
- Main route groups:
  - Public: `/`, `/login`, `/register`, `/organizations/select`
  - Dashboard: `/dashboard`, `/dashboard/[organizationId]/**`
  - Admin: `/admin/**`
  - API: `/api/**`

## Middleware

File: `middleware.ts`

Current responsibilities:

- Redirect legacy dashboard routes:
  - `/dashboard/students` -> `/dashboard/[organizationId]/students`
  - Similar for classes/shows/organization/profile
- Uses `current-organization` cookie to resolve destination org id
- Logs request diagnostics (currently verbose)

TODO:

- Reduce/disable verbose middleware logs in production.

## Authentication and Session

Files:

- `src/lib/auth.ts`
- `src/infrastructure/db/supabase/server-client.ts`
- `src/infrastructure/db/supabase/client.ts`

Auth model:

- Supabase Auth session from cookies (SSR client)
- Browser Supabase client with token auto-refresh and stale-token sanitization
- Custom tenant cookie:
  - `current-organization` (httpOnly) selects active tenant context

Important note:

- `admin-session` cookie exists for admin test mode bypass (`getCurrentUser` branch). This is useful in local/dev but should be hardened or removed for strict production operation.

## Data Access and DI

Files:

- `src/lib/di.ts`
- `src/infrastructure/db/supabase/*-repository.ts`
- `src/application/services/*.ts`

Pattern:

- Route handlers/pages call service layer
- Services depend on repository interfaces
- DI container instantiates Supabase repository implementations
- Two client modes:
  - Regular server client (RLS applies)
  - Admin client (`service_role`) for privileged operations

Recent addition:

- `OrganizationService` now handles optional linking between `organization_members` and `staff_members` through dedicated APIs:
  - `PUT /api/organizations/members/[memberId]/staff-link`
  - `DELETE /api/organizations/members/[memberId]/staff-link`

## Multi-tenant Strategy

Isolation primitives:

1. Schema-level: most business tables contain `organization_id`
2. Query-level: services/repositories pass `organizationId` in filters/operations
3. RLS-level: policies in `database/rls-policies.sql` gate records by user membership
4. Request context: `requireOrganization()` resolves tenant from `current-organization` cookie
5. DB guard trigger: `validate_organization_member_staff_link()` blocks cross-tenant member-staff links

Policy note:

- `organization_members` policies are scoped so admins can manage members in their organization and non-admin users can only read their own membership row.

## Missing / Assumptions

- Assumption: Supabase Auth and `auth.users` are the source of truth for identities.
- Assumption: Database migrations are SQL-file driven manually (no migration tool currently configured).
- Missing: explicit background jobs/queues (none found in current codebase).
