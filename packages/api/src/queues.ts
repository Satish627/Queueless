import type { Queue, QueueEntry } from '@queueless/types';

import { addWalkInSchema, joinQueueSchema } from '@queueless/validation';

import type { QueueLessSupabaseClient } from './supabase';

export const getOpenQueueForBusiness = async (
  client: QueueLessSupabaseClient,
  businessId: string,
): Promise<Queue | null> => {
  const { data, error } = await client
    .from('queues')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const listQueueEntries = async (
  client: QueueLessSupabaseClient,
  queueId: string,
): Promise<QueueEntry[]> => {
  const { data, error } = await client
    .from('queue_entries')
    .select('*')
    .eq('queue_id', queueId)
    .in('status', ['waiting', 'called'])
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};

const getNextQueuePosition = async (
  client: QueueLessSupabaseClient,
  queueId: string,
): Promise<number> => {
  const { data, error } = await client
    .from('queue_entries')
    .select('position')
    .eq('queue_id', queueId)
    .in('status', ['waiting', 'called'])
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.position ?? 0) + 1;
};

export const joinQueue = async (
  client: QueueLessSupabaseClient,
  input: { queue_id: string; display_name: string; customer_id: string },
): Promise<QueueEntry> => {
  const parsed = joinQueueSchema.parse(input);
  const nextPosition = await getNextQueuePosition(client, parsed.queue_id);

  const { data, error } = await client
    .from('queue_entries')
    .insert({
      queue_id: parsed.queue_id,
      display_name: parsed.display_name,
      customer_id: input.customer_id,
      source: 'app',
      status: 'waiting',
      position: nextPosition,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const addWalkIn = async (
  client: QueueLessSupabaseClient,
  input: { queue_id: string; display_name: string },
): Promise<QueueEntry> => {
  const parsed = addWalkInSchema.parse(input);
  const nextPosition = await getNextQueuePosition(client, parsed.queue_id);

  const { data, error } = await client
    .from('queue_entries')
    .insert({
      queue_id: parsed.queue_id,
      display_name: parsed.display_name,
      customer_id: null,
      source: 'walk_in',
      status: 'waiting',
      position: nextPosition,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateQueueEntryStatus = async (
  client: QueueLessSupabaseClient,
  entryId: string,
  status: 'called' | 'served' | 'cancelled' | 'no_show',
): Promise<QueueEntry> => {
  const { data, error } = await client
    .from('queue_entries')
    .update({ status })
    .eq('id', entryId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};
