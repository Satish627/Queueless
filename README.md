# QueueLess Monorepo

QueueLess is a mobile-first queue management MVP built with Bun workspaces + Turborepo.

## Apps
- `apps/mobile`: Expo + React Native + Expo Router customer app
- `apps/dashboard`: Next.js + Tailwind business dashboard

## Packages
- `@queueless/types`: Shared domain types
- `@queueless/validation`: Shared Zod schemas
- `@queueless/api`: Shared Supabase service helpers
- `@queueless/config`: Shared constants/config utilities

## Quick start
1. Install dependencies: `bun install`
2. Copy env file: `cp .env.example .env`
3. Start all apps: `bun run dev`
