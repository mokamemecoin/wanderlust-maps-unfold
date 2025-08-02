import { createClient } from '@supabase/supabase-js'

// For Lovable projects with Supabase integration, these variables should be automatically set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not found. Please ensure Supabase is properly connected to your Lovable project.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)