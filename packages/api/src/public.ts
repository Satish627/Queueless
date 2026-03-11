import type { QueueEntrySource, QueueEntryStatus, QueueStatus } from '@queueless/types';

import type { QueueLessSupabaseClient } from './supabase';

export interface PublicBusinessSnapshot {
  business_id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string;
  address: string;
  city: string;
  description: string | null;
  is_active: boolean;
  business_created_at: string;
  queue_id: string | null;
  queue_name: string | null;
  queue_status: QueueStatus | null;
  avg_service_minutes: number | null;
  queue_created_at: string | null;
  waiting_count: number;
}

export interface GuestQueueEntrySnapshot {
  entry_id: string;
  guest_token: string;
  queue_id: string;
  business_id: string;
  display_name: string;
  status: QueueEntryStatus;
  position: number;
  queue_name: string;
  business_name: string;
  avg_service_minutes: number;
  joined_at: string;
  called_at: string | null;
  served_at: string | null;
  cancelled_at: string | null;
  estimated_wait_minutes: number;
}

export interface DashboardQueueEntrySnapshot {
  entry_id: string;
  queue_id: string;
  display_name: string;
  source: QueueEntrySource;
  status: QueueEntryStatus;
  position: number;
  joined_at: string;
  called_at: string | null;
  served_at: string | null;
  cancelled_at: string | null;
}

export const listPublicBusinesses = async (
  client: QueueLessSupabaseClient,
): Promise<PublicBusinessSnapshot[]> => {
  const { data, error } = await client.rpc('list_public_businesses');

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicBusinessSnapshot[];
};

export const getPublicBusiness = async (
  client: QueueLessSupabaseClient,
  businessId: string,
): Promise<PublicBusinessSnapshot | null> => {
  const { data, error } = await client.rpc('get_public_business', {
    p_business_id: businessId,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as PublicBusinessSnapshot[];
  return rows[0] ?? null;
};

export const joinQueueGuest = async (
  client: QueueLessSupabaseClient,
  input: { queueId: string; displayName: string },
): Promise<GuestQueueEntrySnapshot> => {
  const { data, error } = await client.rpc('join_queue_guest', {
    p_queue_id: input.queueId,
    p_display_name: input.displayName,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as GuestQueueEntrySnapshot[];
  const entry = rows[0];

  if (!entry) {
    throw new Error('Queue join failed. Please try again.');
  }

  return entry;
};

export const getQueueEntryGuest = async (
  client: QueueLessSupabaseClient,
  input: { entryId: string; guestToken: string },
): Promise<GuestQueueEntrySnapshot | null> => {
  const { data, error } = await client.rpc('get_queue_entry_guest', {
    p_entry_id: input.entryId,
    p_guest_token: input.guestToken,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as GuestQueueEntrySnapshot[];
  return rows[0] ?? null;
};

export const leaveQueueGuest = async (
  client: QueueLessSupabaseClient,
  input: { entryId: string; guestToken: string },
): Promise<boolean> => {
  const { data, error } = await client.rpc('leave_queue_guest', {
    p_entry_id: input.entryId,
    p_guest_token: input.guestToken,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const listQueueEntriesForQueue = async (
  client: QueueLessSupabaseClient,
  queueId: string,
): Promise<DashboardQueueEntrySnapshot[]> => {
  const { data, error } = await client.rpc('list_queue_entries_for_queue', {
    p_queue_id: queueId,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as DashboardQueueEntrySnapshot[];
};

export const addWalkInEntry = async (
  client: QueueLessSupabaseClient,
  input: { queueId: string; displayName: string },
): Promise<DashboardQueueEntrySnapshot> => {
  const { data, error } = await client.rpc('add_walk_in_entry', {
    p_queue_id: input.queueId,
    p_display_name: input.displayName,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as DashboardQueueEntrySnapshot[];
  const entry = rows[0];

  if (!entry) {
    throw new Error('Unable to add walk-in entry.');
  }

  return entry;
};

export const callNextEntryForQueue = async (
  client: QueueLessSupabaseClient,
  queueId: string,
): Promise<DashboardQueueEntrySnapshot | null> => {
  const { data, error } = await client.rpc('call_next_entry_for_queue', {
    p_queue_id: queueId,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as DashboardQueueEntrySnapshot[];
  return rows[0] ?? null;
};

export const setQueueEntryStatus = async (
  client: QueueLessSupabaseClient,
  input: { entryId: string; status: QueueEntryStatus },
): Promise<boolean> => {
  const { data, error } = await client.rpc('set_queue_entry_status', {
    p_entry_id: input.entryId,
    p_status: input.status,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const updateQueueSettings = async (
  client: QueueLessSupabaseClient,
  input: {
    queueId: string;
    status: QueueStatus;
    avgServiceMinutes: number;
  },
): Promise<boolean> => {
  const { data, error } = await client.rpc('update_queue_settings', {
    p_queue_id: input.queueId,
    p_status: input.status,
    p_avg_service_minutes: input.avgServiceMinutes,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const updateBusinessPreviewDetails = async (
  client: QueueLessSupabaseClient,
  input: {
    businessId: string;
    name: string;
    category: string;
    city: string;
    address: string;
    description: string | null;
  },
): Promise<boolean> => {
  const { data, error } = await client.rpc('update_business_preview_details', {
    p_business_id: input.businessId,
    p_name: input.name,
    p_category: input.category,
    p_city: input.city,
    p_address: input.address,
    p_description: input.description,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
};
