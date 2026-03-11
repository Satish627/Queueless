import type { Business } from '@queueless/types';

import type { QueueLessSupabaseClient } from './supabase';

export const listActiveBusinesses = async (
  client: QueueLessSupabaseClient,
): Promise<Business[]> => {
  const { data, error } = await client
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getBusinessById = async (
  client: QueueLessSupabaseClient,
  businessId: string,
): Promise<Business | null> => {
  const { data, error } = await client
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};
