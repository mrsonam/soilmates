<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Soilmates — agent instructions

## Mandatory project docs (before edits or new features)

1. `PRODUCT_REQUIREMENTS.md`
2. `ARCHITECTURE.md`
3. `DB_SCHEMA.md`
4. `AI_GUIDELINES.md`
5. `SYSTEM_OVERVIEW.md` (supporting narrative)
6. `DESIGN.md` 

Project rule: `.cursor/rules/soilmates-project-context.mdc` (`alwaysApply`).

## Reference codebases (PWA, NextAuth-style patterns, web push)

Siblings under the same parent directory as Soilmates:

- **conscious-spending-plan** — PWA (`app/manifest.ts`, `PwaRegistration.tsx`, `public/sw.js`), NextAuth v5 + Google patterns (`lib/auth.ts`, `middleware.ts`, `app/providers.tsx`).
- **productivity** — Web push end-to-end (`PushNotificationManager.tsx`, `app/actions/push-notifications.ts`, `web-push`, VAPID keys, cron sender in `app/api/cron/reminders/route.ts`, Prisma `PushSubscription`).

**Soilmates auth:** **NextAuth v5** with **Google** (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `SessionProvider` in `app/providers.tsx`). Database remains Prisma + Supabase Postgres. If `ARCHITECTURE.md` still says Supabase Auth, prefer this repo’s implementation until docs are aligned.

Absolute paths (this machine): `c:\Users\Tsering\Desktop\coding\conscious-spending-plan\`, `c:\Users\Tsering\Desktop\coding\productivity\`.
