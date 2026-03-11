# QueueLess MVP Architecture Notes

## Monorepo layout

- `apps/mobile`: customer-facing Expo app
- `apps/dashboard`: business/staff-facing Next.js app
- `packages/types`: shared domain types and DB typing
- `packages/validation`: shared zod input and entity schemas
- `packages/api`: shared Supabase clients + domain access functions
- `supabase/migrations`: SQL schema and RLS policies

## Architectural guardrails

- Keep route files thin and feature folders responsible for view logic.
- Keep all domain-level types and validation in shared packages.
- Use shared API package for DB access to avoid duplicate query logic across apps.
- Keep MVP scope to auth, business listing/details, queue flow, and queue operations.

## Next implementation phases

1. Implement auth state and guarded routes in both apps.
2. Implement business listing/details + queue join/leave flow.
3. Implement dashboard live queue actions and realtime updates.
