import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqyrwdvrukgwhiwkpabp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeXJ3ZHZydWtnd2hpd2twYWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzIzMjksImV4cCI6MjA2MzQ0ODMyOX0.XpOzpxdzqkDYEKsuf_BKoaS7B8XBSmlOcLIFOj4oanI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);