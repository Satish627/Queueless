export const PROFILE_ROLES = ['customer', 'staff', 'owner'] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];

export const QUEUE_STATUSES = ['open', 'closed'] as const;
export type QueueStatus = (typeof QUEUE_STATUSES)[number];

export const QUEUE_ENTRY_SOURCES = ['app', 'walk_in'] as const;
export type QueueEntrySource = (typeof QUEUE_ENTRY_SOURCES)[number];

export const QUEUE_ENTRY_STATUSES = [
  'waiting',
  'called',
  'served',
  'cancelled',
  'no_show',
] as const;
export type QueueEntryStatus = (typeof QUEUE_ENTRY_STATUSES)[number];

export interface Profile extends Record<string, unknown> {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: ProfileRole;
  created_at: string;
}

export interface Business extends Record<string, unknown> {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string;
  address: string;
  city: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BusinessStaff extends Record<string, unknown> {
  id: string;
  business_id: string;
  profile_id: string;
  role: ProfileRole;
  created_at: string;
}

export interface Queue extends Record<string, unknown> {
  id: string;
  business_id: string;
  name: string;
  status: QueueStatus;
  avg_service_minutes: number;
  created_at: string;
}

export interface QueueEntry extends Record<string, unknown> {
  id: string;
  queue_id: string;
  customer_id: string | null;
  display_name: string;
  source: QueueEntrySource;
  status: QueueEntryStatus;
  position: number;
  joined_at: string;
  called_at: string | null;
  served_at: string | null;
  cancelled_at: string | null;
}

export interface Database {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: unknown[];
      }
    > & {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Business, 'id' | 'owner_id'>>;
        Relationships: [];
      };
      business_staff: {
        Row: BusinessStaff;
        Insert: Omit<BusinessStaff, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<BusinessStaff, 'id' | 'business_id' | 'profile_id'>>;
        Relationships: [];
      };
      queues: {
        Row: Queue;
        Insert: Omit<Queue, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Queue, 'id' | 'business_id'>>;
        Relationships: [];
      };
      queue_entries: {
        Row: QueueEntry;
        Insert: Omit<QueueEntry, 'id' | 'joined_at'> & { id?: string; joined_at?: string };
        Update: Partial<
          Omit<QueueEntry, 'id' | 'queue_id' | 'customer_id' | 'source' | 'joined_at'>
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
      queue_status: QueueStatus;
      queue_entry_source: QueueEntrySource;
      queue_entry_status: QueueEntryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
