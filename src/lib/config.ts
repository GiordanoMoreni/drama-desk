// Configuration file for environment variables
// This ensures Next.js can access configuration even during build time
// Values are read from environment variables (.env.local)

// Environment variables are now loaded correctly from .env.local (UTF-8)
// Keeping minimal logging for production
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Environment variables loaded from .env.local');
}

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
let supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Note: Removed fallback file reading due to Edge Runtime compatibility issues
// Next.js should now load environment variables correctly from .env.local

// Note: Validation moved to runtime in individual functions
// This allows Next.js to build even if env vars aren't loaded yet

export const config = {
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceRoleKey,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
} as const;

export type Config = typeof config;