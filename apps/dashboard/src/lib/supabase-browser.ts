'use client';

import { createQueueLessClient } from '@queueless/api';

import { env } from './env';

export const supabaseBrowserClient = createQueueLessClient({
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
});
