# Runbook

Operational guide for local development and common incidents.

## Quick Commands

```bash
# install
npm install

# dev
npm run dev

# quality
npm run lint

# production build check
npm run build
npm run start
```

## Local DB Bootstrap

Apply SQL in this order:

1. `database/schema.sql`
2. `database/rls-policies.sql`
3. `database/add_user_profiles.sql`
4. `database/populate_user_profiles.sql`

## Common Troubleshooting

## 1) Login/session errors (invalid refresh token)

Symptoms:

- browser console shows invalid refresh token errors
- auth appears stuck after token expiry

Actions:

1. Sign out from app
2. Clear site storage/cookies for localhost
3. Reload and sign in again

Code context:

- browser token sanitization in `src/infrastructure/db/supabase/client.ts`

## 2) "Organization selection required"

Symptoms:

- redirects to `/organizations/select`
- dashboard routes fail to resolve tenant

Actions:

1. Ensure user has an `organization_members` row with `is_active=true`
2. Set current tenant cookie by selecting an organization
3. Verify `/api/organization/set-current` works

Cookie:

- `current-organization`

## 3) Admin pages show empty/partial data

Symptoms:

- users/invitations lists are empty unexpectedly

Actions:

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Ensure `user_profiles` table exists and is populated
3. Re-run:
   - `database/add_user_profiles.sql`
   - `database/populate_user_profiles.sql`

## 4) RLS access denied

Symptoms:

- API returns unauthorized/forbidden on tenant data

Actions:

1. Check user membership in `organization_members`
2. Confirm role (`admin|teacher|staff`) and `is_active=true`
3. Validate policies from `database/rls-policies.sql` are applied

## 5) Build passes locally but runtime fails in deploy

Actions:

1. Verify all env vars exist in deployment:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
2. Confirm DB schema and RLS scripts are applied in target environment

## Missing / Assumptions

- No automated migration runner configured (manual SQL apply expected).
- No official seed script for full demo dataset found.
- No automated `test`/`e2e` scripts currently configured in `package.json`.

