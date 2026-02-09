import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr';
import { config } from '@/lib/config';

// Client-side Supabase client (safe for browser)
export function createBrowserClient() {
  // Read config at function call time, not module load time
  const supabaseUrl = config.supabase.url;
  const supabaseAnonKey = config.supabase.anonKey;

  // Validate configuration only when function is called
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n\n` +
      `Please check your .env.local file and ensure these variables are set.\n` +
      `If you just created .env.local, you need to restart your Next.js dev server.\n\n` +
      `Expected format in .env.local:\n` +
      `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n` +
      `Current values:\n` +
      `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || '(empty)'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? '(set)' : '(empty)'}`
    );
  }

  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Type-safe database types (to be generated from Supabase)
export type Database = {
  // This will be replaced with generated types from Supabase
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other table types here as needed
      [key: string]: any;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};