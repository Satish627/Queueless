import { createClient, type SupabaseClient } from '@supabase/supabase-js';
export type QueueLessSupabaseClient = SupabaseClient<any, 'public'>;

interface SupabaseClientOptions {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const createQueueLessClient = ({
  supabaseUrl,
  supabaseAnonKey,
}: SupabaseClientOptions): QueueLessSupabaseClient => {
  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL.');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing Supabase anon key.');
  }

  return createClient<any, 'public'>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};
