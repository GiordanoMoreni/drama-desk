// Configuration file for environment variables
// This ensures Next.js can access configuration even during build time
// Values are read from environment variables (.env.local)

if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables loaded from .env.local');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const config = {
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceRoleKey,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    defaultLocale: 'it', // Default language: Italian
    supportedLocales: ['it', 'en'] as const,
  },
} as const;

export type Config = typeof config;
