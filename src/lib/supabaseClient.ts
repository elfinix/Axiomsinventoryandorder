import { createClient } from '@supabase/supabase-js';
import { Database } from './supabaseTypes';

// Use environment variables if available, otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dsxjykbentygxvwnudnb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGp5a2JlbnR5Z3h2d251ZG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzE3MzUsImV4cCI6MjA4MTYwNzczNX0.PRDaaBGPO8DmN6bk68YQtNPGyVeEW1Km9uTrzDs6VJQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);