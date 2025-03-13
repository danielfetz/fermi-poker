// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// To use in your .env file:
// REACT_APP_SUPABASE_URL=your-supabase-url
// REACT_APP_SUPABASE_ANON_KEY=your-anon-key
