import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqyrwdvrukgwhiwkpabp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeXJ3ZHZydWtnd2hpd2twYWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzIzMjksImV4cCI6MjA2MzQ0ODMyOX0.XpOzpxdzqkDYEKsuf_BKoaS7B8XBSmlOcLIFOj4oanI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to log Supabase errors with more context
export const logSupabaseError = (error, operation) => {
  console.error(`Supabase error during ${operation}:`, error);
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  });
};