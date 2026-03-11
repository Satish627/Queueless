import { createQueueLessClient } from '@queueless/api';

import { env, hasSupabaseEnv } from './env';

export const supabase = hasSupabaseEnv
  ? createQueueLessClient({
      supabaseUrl: env.supabaseUrl as string,
      supabaseAnonKey: env.supabaseAnonKey as string,
    })
  : null;
