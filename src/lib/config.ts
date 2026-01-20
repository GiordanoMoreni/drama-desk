// Configuration file for environment variables
// This ensures Next.js can access configuration even during build time

export const config = {
  supabase: {
    url: 'https://luvpdnfuhwnysnysrfrc.supabase.co',
    anonKey: 'sb_publishable_icQDewa5b0pz_NtR6zZfaw_LPnoVH9I',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
} as const;

export type Config = typeof config;