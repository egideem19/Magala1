import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ces variables d'environnement seront disponibles après la connexion Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);