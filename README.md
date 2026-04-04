# Soilmates

Private, shared plant management: collections, care logs, reminders, images, AI assistance, offline-first and realtime collaboration. Product and engineering contracts live in the markdown files in this repository—**read them before implementing features.**

## Documentation (read first)

| Document | Purpose |
|----------|---------|
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | Scope, functional requirements, guardrails |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical stack, layering, security, build order |
| [DB_SCHEMA.md](./DB_SCHEMA.md) | Domain schema, relationships, indexing hints |
| [AI_GUIDELINES.md](./AI_GUIDELINES.md) | Rules for agents and human contributors |
| [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) | Vision, features, phases (overview) |
| [AGENTS.md](./AGENTS.md) | Next.js + agent pointers |

Cursor loads [`.cursor/rules/soilmates-project-context.mdc`](./.cursor/rules/soilmates-project-context.mdc) automatically so assistants keep this context.

## Reference projects (PWA, auth patterns, push)

Sibling repositories under the same parent folder as Soilmates (e.g. `coding/`) provide working patterns. Soilmates uses **NextAuth (Google)** for sign-in and **Supabase Postgres** for the database (via Prisma)—see `.env.example`.

- **conscious-spending-plan** (sibling: `../conscious-spending-plan/`) — `app/manifest.ts`, `app/components/PwaRegistration.tsx`, `public/sw.js`, NextAuth v5 in `lib/auth.ts`, `middleware.ts`, `app/providers.tsx`.
- **productivity** (sibling: `../productivity/`) — Web Push: `app/components/PushNotificationManager.tsx`, `app/actions/push-notifications.ts`, `web-push` + VAPID env vars, `app/api/cron/reminders/route.ts`, Prisma `PushSubscription` in `prisma/schema.prisma`, `public/sw.js`.

On this workspace the folders are `c:\Users\Tsering\Desktop\coding\conscious-spending-plan` and `c:\Users\Tsering\Desktop\coding\productivity`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Operations & subsystems

### Offline sync

IndexedDB (Dexie) holds a **mutation queue** and **image upload queue** when the device is offline. `processSyncQueueOnce` replays queued server actions when online. Items that fail repeatedly move to **`dead_letter`** status after `SYNC_QUEUE_MAX_RETRIES` (see `lib/sync/constants.ts`); users can **retry** from the in-app strip. A **watchdog** runs on an interval to reset stuck `syncing` rows and flush the queue. Shared **retry with backoff** for HTTP clients lives in `lib/retry.ts`. See `lib/sync/replay.ts`, `components/offline/sync-engine-provider.tsx`.

### AI (assistant & diagnosis)

Server-only NVIDIA Integrate calls use **timeouts** (`lib/ai/nvidia-integrate.ts`) and **limited retries** for transient 5xx/429 on the assistant path (`lib/ai/provider.ts`). Structured logs use `lib/logging/server.ts`. Feature flags: `NEXT_PUBLIC_FEATURE_AI_ASSISTANT`, `NEXT_PUBLIC_FEATURE_AI_DIAGNOSIS` (set to `false` to disable).

### Trefle (plant reference search)

`lib/integrations/trefle/client.ts` wraps the API with **timeouts**, **retry** for retryable errors, and Zod validation in `service.ts`. `TREFLE_API_KEY` is server-only.

### Push notifications

Web Push uses `lib/push/deliver-reminders.ts` (HTTP cron: `app/api/cron/reminder-push/route.ts`). Invalid subscriptions (410/404) are **revoked** in the database. Logs go through `serverLogger`. Feature flag: `NEXT_PUBLIC_FEATURE_PUSH`.

### Observability

JSON logs on the server (`service: "soilmates"`). Client logs (`service: "soilmates-client"`) can be forwarded via `window.__SOILMATES_LOG_HOOK__` for Sentry or similar.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
