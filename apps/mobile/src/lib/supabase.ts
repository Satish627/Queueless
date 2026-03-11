import { createQueueLessClient } from '@queueless/api';

import { env } from './env';

export const supabase = createQueueLessClient({
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
});
