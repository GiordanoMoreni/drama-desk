import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr';
import { config } from '@/lib/config';

// Use configuration from config file
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;
const supabaseServiceRoleKey = config.supabase.serviceRoleKey;

// Client-side Supabase client (safe for browser)
export function createBrowserClient() {
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