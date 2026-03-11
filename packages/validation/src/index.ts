import { z } from 'zod';

import {
  PROFILE_ROLES,
  QUEUE_ENTRY_SOURCES,
  QUEUE_ENTRY_STATUSES,
  QUEUE_STATUSES,
} from '@queueless/types';

export const emailSchema = z.string().email().max(255);
export const phoneSchema = z.string().trim().min(7).max(20).nullable();

export const authSignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export const authSignUpSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: z.string().min(8).max(128),
  phone: phoneSchema,
});

export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  role: z.enum(PROFILE_ROLES),
  created_at: z.string().datetime(),
});

export const businessSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(2).max(80),
  address: z.string().trim().min(3).max(180),
  city: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
});

export const queueSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  status: z.enum(QUEUE_STATUSES),
  avg_service_minutes: z.number().int().min(1).max(120),
  created_at: z.string().datetime(),
});

export const queueEntrySchema = z.object({
  id: z.string().uuid(),
  queue_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable(),
  display_name: z.string().trim().min(1).max(120),
  source: z.enum(QUEUE_ENTRY_SOURCES),
  status: z.enum(QUEUE_ENTRY_STATUSES),
  position: z.number().int().min(1),
  joined_at: z.string().datetime(),
  called_at: z.string().datetime().nullable(),
  served_at: z.string().datetime().nullable(),
  cancelled_at: z.string().datetime().nullable(),
});

export const joinQueueSchema = z.object({
  queue_id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
});

export const addWalkInSchema = z.object({
  queue_id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
});

export type AuthSignInInput = z.infer<typeof authSignInSchema>;
export type AuthSignUpInput = z.infer<typeof authSignUpSchema>;
export type JoinQueueInput = z.infer<typeof joinQueueSchema>;
export type AddWalkInInput = z.infer<typeof addWalkInSchema>;
