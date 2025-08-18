import { createClient } from '@supabase/supabase-js'

// These variables are loaded from the .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This error will be shown if the .env.local file is not configured correctly
  throw new Error('Supabase URL and Anon Key must be provided in .env.local')
}

// This exports a Supabase client that can be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)