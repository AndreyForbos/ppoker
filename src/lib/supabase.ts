import { createClient } from '@supabase/supabase-js'

// Using hardcoded values for the preview environment
const supabaseUrl = 'https://utqbgetlcsnzlkxelvrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cWJnZXRsY3NuemxreGVsdnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mzg3ODIsImV4cCI6MjA3MTExNDc4Mn0.sniUKgX7XBhY0BVcRhvPIT5CgGTdb83iQGRQsPfrFm8'

if (!supabaseUrl || !supabaseAnonKey) {
  // This error will be shown if the .env.local file is not configured correctly
  throw new Error('Supabase URL and Anon Key must be provided.')
}

// This exports a Supabase client that can be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)