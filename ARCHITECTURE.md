# /ARCHITECTURE.md

# Plant Management System — Technical Architecture

## 1. Purpose

This document defines the technical architecture of the Plant Management System. It exists to guide implementation decisions, enforce consistency, and provide a stable reference for future development and AI-assisted code generation.

This system is a private, collection-centric, AI-enhanced plant care platform built as a PWA-first application with a mobile-ready architecture.

---

## 2. Architecture Goals

The architecture must support:

* shared private collections
* strict access control
* offline-first usage
* realtime collaboration
* AI-assisted plant care
* structured and extensible domain modeling
* stable long-term scalability

The architecture must prioritize correctness, security, and maintainability over speed of implementation.

---

## 3. System Style

This application uses a modern full-stack web architecture with the following characteristics:

* Next.js App Router
* server-first data reads
* validated server-side writes
* Supabase as backend platform
* Prisma as typed ORM
* TanStack Query for client server-state
* Zustand for client UI-state
* Dexie/IndexedDB for offline queue and local persistence
* Supabase Realtime for live updates

---

## 4. Core Architectural Decisions

## 4.1 Collection-Centric Domain

The root business entity is `collection`.

Everything operational belongs to a collection directly or indirectly:

* members
* areas
* plants
* logs
* reminders
* diagnoses
* activity
* audit events

This is the primary authorization boundary.

---

## 4.2 PWA First, Mobile-Ready

The first deliverable is a PWA. The architecture must remain portable enough for future mobile implementation.

This means:

* business rules should not be tightly coupled to page components
* validation logic should be reusable
* domain logic should live in shared application/service layers
* route-driven workflows should not contain irreplaceable logic

---

## 4.3 Read/Write Separation

### Reads

Reads should prefer:

* Server Components
* cached query helpers
* server-side aggregation for initial page payloads

### Writes

Writes must go through:

* Server Actions, or
* Route Handlers

All writes must:

* validate input
* verify auth
* enforce membership/ownership rules
* write audit/activity records where relevant

---

## 4.4 Security Boundary

Security must never depend on frontend logic.

The system enforces access through:

* Supabase Auth
* Row Level Security
* storage access checks
* server-side validation

Frontend checks are allowed for UX only, not for trust.

---

## 4.5 Offline First Model

The source of truth is Supabase.

Offline support uses:

* IndexedDB for cached state and queued writes
* optimistic UI updates
* sync replay on reconnect
* conflict detection for mutable shared entities

Offline capability must be additive, not a replacement for server truth.

---

## 5. Technology Stack

## Frontend

* Next.js App Router
* React
* Tailwind CSS
* TanStack Query
* Zustand
* Zod
* Dexie
* PWA service worker

## Backend

* Supabase Postgres
* Supabase Auth with Google provider
* Supabase Storage
* Supabase Realtime
* Prisma ORM

## AI

* structured AI context assembly
* image-based plant identification
* image-assisted diagnosis
* plant-specific conversational assistant
* structured diagnosis persistence

---

## 6. Project Layering

Recommended code layering:

### Presentation Layer

UI components, pages, layouts, forms, view logic

### Application Layer

Use cases, orchestration, write flows, query shaping

### Domain Layer

Business rules, domain types, entity-specific logic

### Infrastructure Layer

Supabase clients, Prisma access, storage helpers, realtime adapters, AI provider adapters

Business rules should not live directly inside page files.

---

## 7. Recommended Folder Structure

app/

* (auth)/
* (app)/
* api/
* manifest.ts

components/

* ui/
* collections/
* plants/
* reminders/
* assistant/
* activity/
* layout/
* forms/

lib/

* auth/
* db/
* prisma/
* supabase/
* validations/
* ai/
* images/
* notifications/
* sync/
* offline/
* activity/
* audit/
* reminders/
* plants/
* collections/

hooks/

* queries/
* mutations/
* realtime/
* offline/

stores/

* app-store.ts
* filters-store.ts
* assistant-store.ts
* sync-store.ts

types/

* domain/
* api/
* ai/

---

## 8. Routing Strategy

Nested routes are required.

Examples:

* `/collections/[collectionSlug]`
* `/collections/[collectionSlug]/areas/[areaSlug]`
* `/collections/[collectionSlug]/plants/[plantSlug]`

Plant routes may include:

* history
* photos
* reminders
* assistant
* diagnosis

Slugs are used for URLs. UUIDs are used internally for identity and relations.

---

## 9. State Management Strategy

## TanStack Query

Use for:

* collections
* plants
* plant detail data
* logs
* reminders
* diagnoses
* activity
* notifications

Responsibilities:

* fetching
* caching
* invalidation
* optimistic updates
* background refresh

## Zustand

Use for:

* selected collection
* selected area
* filters
* UI panels
* assistant open state
* sync indicators
* client-only preferences not worth server round-trips

Do not use Zustand as a replacement for server state.

---

## 10. Data Access Strategy

## Server Components

Use for initial page payloads and aggregated reads.

## Prisma

Use for:

* typed server-side querying
* relational reads/writes
* app-owned schema access
* service-layer operations

## Supabase Client

Use when needed for:

* auth session
* storage
* realtime subscriptions
* RLS-respecting direct access patterns

Avoid mixing many data access styles in the same feature without a reason.

---

## 11. Realtime Strategy

Supabase Realtime should be used for:

* plant updates
* care log creation
* reminders
* activity feed changes
* notification changes

Realtime updates should be silent and reconcile with TanStack Query caches.

Avoid noisy toast-based behavior by default.

---

## 12. Offline and Sync Architecture

## Local Persistence

Use IndexedDB for:

* pending writes
* offline cached entities
* sync metadata
* queued uploads metadata

## Sync Flow

1. User action occurs
2. optimistic UI updates immediately
3. offline queue stores mutation payload
4. on reconnect, queued mutations replay through server endpoints
5. result reconciles with canonical server data
6. conflicts are surfaced where needed

## Conflict Rules

* creator-owned logs: low conflict risk
* shared mutable plant fields: detect stale writes
* reminders: last-write-wins with warning if needed
* uploads: independent processing

---

## 13. Storage Architecture

Images must live in private Supabase Storage buckets.

Rules:

* never use public buckets
* store deterministic paths
* generate signed URLs server-side after authorization check
* store metadata in database separately from file storage

Suggested path style:

* `collections/{collectionId}/plants/{plantId}/...`
* `collections/{collectionId}/diagnoses/{diagnosisId}/...`

---

## 14. AI Architecture

There are two assistant modes:

## Global Assistant

Used for general plant help and app-wide questions.

## Plant-Specific Assistant

Used from a plant context and must automatically include:

* plant reference snapshot
* custom setup
* recent logs
* reminders
* recent images
* diagnosis history
* notes

AI output types:

* conversational response
* structured diagnosis
* reminder suggestions
* identification result
* care recommendations

AI interactions must be persisted where appropriate.

---

## 15. Activity and Audit Architecture

## Activity Events

Human-readable feed items for user visibility.

## Audit Logs

Immutable compliance-oriented records for sensitive and important changes.

A feature may write:

* only activity
* only audit
* both

Use both when the action is both user-visible and operationally important.

---

## 16. Notification Architecture

Channels:

* in-app
* push

Behavior:

* smart grouped
* flexible delivery windows
* globally configurable by user settings

Notification generation should be server-driven, not client-only.

---

## 17. Settings Architecture

Settings are per-user, not per-device.

Examples:

* theme
* quiet hours
* reminder window
* units
* AI tone
* default collection
* notification toggles

Do not overcomplicate settings in V1.

---

## 18. Performance Expectations

The system should be designed for moderate-to-high usage with unlimited history.

Requirements:

* index key foreign keys and date fields
* paginate large timelines
* avoid loading full history by default
* lazily load heavy data like image galleries and AI thread history
* use selective hydration where possible

---

## 19. Non-Negotiable Engineering Rules

* never bypass RLS for convenience
* never trust client authorization
* validate every write input
* archive instead of hard delete for core entities
* separate reference data from user-instance data
* keep AI context traceable
* never expose raw storage publicly
* preserve auditability

---

## 20. Build Order

Recommended implementation order:

1. auth and profile bootstrap
2. collections and membership
3. areas
4. plants
5. care logs
6. image metadata and upload flow
7. dashboard
8. reminders
9. notifications
10. activity feed
11. realtime
12. offline queue and sync
13. AI flows
14. diagnosis refinement
15. adaptive reminder evolution

---

## 21. Definition of Done for Features

A feature is not complete unless it includes:

* validated server write path
* auth and authorization handling
* loading/error states
* audit/activity integration where relevant
* responsive UI
* query invalidation/reconciliation
* testable domain boundaries
* no security shortcuts

---

## 22. Final Note

This architecture is designed to stay stable as features expand. New features must fit the existing principles unless there is a deliberate documented reason to change them.
