export const APP_NAME = 'QueueLess';

export const SUPABASE_ENV_KEYS = {
  dashboard: {
    url: 'NEXT_PUBLIC_SUPABASE_URL',
    anonKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  },
  mobile: {
    url: 'EXPO_PUBLIC_SUPABASE_URL',
    anonKey: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  },
} as const;
