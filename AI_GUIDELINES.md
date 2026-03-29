# /AI_GUIDELINES.md

# Plant Management System — AI Agent Guidelines

## 1. Purpose

This document defines how AI agents, code assistants, and automated tooling should reason about, modify, and extend this codebase.

The goal is to ensure that all generated code remains:

* consistent
* secure
* scalable
* aligned with the product vision
* compatible with the existing architecture

This document must be treated as an operational ruleset, not as optional guidance.

---

## 2. Primary Objective

When generating or modifying code for this project, always optimize for:

* correctness
* maintainability
* security
* clear architecture
* minimal accidental complexity

Do not optimize for short-term speed if it creates architectural debt.

---

## 3. Product Context

This project is a private plant management platform with:

* shared collections
* equal-access members within a collection
* plant records
* care logs
* recurring reminders
* images
* AI diagnosis
* global and plant-specific AI chat
* realtime updates
* offline-first behavior
* strict RLS-based security

The system is collection-centric.

---

## 4. Required Mindset

When working on this project, act like a senior engineer contributing to a production application.

Always assume:

* multiple users may use the same collection
* data integrity matters
* access control matters
* offline and realtime may affect the same entity
* AI outputs must be traceable and bounded

Never assume the app is a simple single-user CRUD toy project.

---

## 5. Source of Truth Priority

When making decisions, follow this order:

1. security constraints
2. domain rules
3. system architecture
4. product requirements
5. UI convenience

If UI convenience conflicts with security or architecture, security and architecture win.

---

## 6. Non-Negotiable Rules

## 6.1 Do Not Bypass Authorization

Never create code that assumes frontend visibility equals access permission.

All protected data access must respect:

* authentication
* collection membership
* ownership where required
* RLS

---

## 6.2 Do Not Trust Client Input

Every write must:

* validate input with Zod or equivalent
* verify the authenticated user
* confirm collection membership or ownership
* enforce allowed transitions

---

## 6.3 Do Not Collapse Reference Data and User Data

Keep these separate:

* canonical plant reference data
* user-specific plant instance data
* AI snapshot data
* mutable care setup

Never overwrite reference truth with user customization.

---

## 6.4 Do Not Hard Delete Important Entities

Use archive or soft delete patterns for:

* collections
* plants
* logs where appropriate
* images where appropriate

Preserve history unless explicitly designed otherwise.

---

## 6.5 Do Not Expose Private Storage

Never use public storage for plant images or diagnosis images.

Always use:

* private bucket
* metadata in database
* signed URL access after authorization

---

## 6.6 Do Not Place Business Logic in UI Components

UI components should render and delegate.

Business logic belongs in:

* server actions
* route handlers
* service helpers
* domain/application modules

---

## 7. How to Add Features

When implementing a feature, always think through these questions:

1. what collection or ownership boundary applies?
2. what tables/entities are affected?
3. what validation is required?
4. what audit/activity records should be created?
5. what realtime subscriptions need refresh?
6. what offline queue behavior is needed?
7. what query invalidation is required?
8. what part of the feature is plant-reference data vs user-instance data?

Do not implement features without answering those questions.

---

## 8. Entity-Specific Rules

## 8.1 Collections

* collections are the primary security boundary
* all collection-scoped entities must be reachable through a collection relation
* membership must be checked consistently

## 8.2 Plants

* plants belong to one collection
* plants have one current area
* plant location history must be preserved when moved
* plant reference is optional
* plant reference snapshot must remain historically stable after creation unless explicitly refreshed by a controlled flow

## 8.3 Care Logs

* logs are event-based
* logs are editable only by their creator
* metadata is flexible but should remain structured where possible
* logging a care event may trigger reminder completion/rescheduling

## 8.4 Reminders

* reminders are plant-linked
* reminders are recurring
* reminders auto-reset on related completion
* reminders may originate from AI, user customization, diagnosis adjustment, or seasonal adjustment
* reminder scheduling should remain deterministic and explainable

## 8.5 Diagnoses

* diagnoses should be both conversational and structured
* diagnosis history must be preserved
* only one diagnosis should be current/active at a time for the same problem thread if the business flow requires it
* confidence and uncertainty should be explicit

## 8.6 AI Threads

* global threads are app-wide or collection-aware
* plant threads must automatically include plant context
* context should be assembled, not guessed
* important AI outputs should be persistable

---

## 9. AI Output Requirements

When generating AI-related code or features:

* persist context snapshots where useful
* separate conversational text from structured result fields
* preserve uncertainty
* support future explainability
* keep room for human override

Never build AI features that act like infallible truth.

---

## 10. UI/UX Guardrails

The product style is:

* calm
* mindful
* premium
* minimal
* nature-inspired

When generating UI:

* avoid clutter
* prefer soft hierarchy
* use clear spacing
* use expressive but restrained microcopy
* preserve responsive behavior for mobile and desktop

Do not generate noisy enterprise-looking UI or overly playful consumer UI.

---

## 11. State Management Rules

## Use TanStack Query for:

* fetched entities
* cache and invalidation
* optimistic server-state updates

## Use Zustand for:

* UI panel state
* selected filters
* selected collection
* sync indicators
* assistant drawer state

Do not put long-lived server entities into Zustand unless there is a specific reason.

---

## 12. Realtime Rules

When adding realtime behavior:

* keep updates silent by default
* update caches predictably
* avoid duplicate inserts in optimistic + realtime flows
* do not show excessive toast notifications

Realtime should feel smooth, not noisy.

---

## 13. Offline Rules

When adding offline-capable writes:

* store enough payload to replay deterministically
* mark sync state clearly
* avoid hidden destructive merges
* define conflict behavior explicitly

Do not assume offline writes can simply be retried without version awareness for shared mutable entities.

---

## 14. Query and Rendering Rules

* keep expensive reads off the client when possible
* paginate large histories
* do not fetch full image timelines by default
* load heavy AI thread histories lazily
* use Server Components for initial data where it improves performance and security

---

## 15. Naming Rules

Prefer clear domain names.

Examples:

* `collections`
* `collection_members`
* `plants`
* `care_logs`
* `plant_images`
* `diagnoses`

Do not invent vague names like:

* `items`
* `records`
* `entries`
* `stuff`

Function names should reflect domain intent.

Good:

* `createCareLog`
* `archivePlant`
* `completeReminder`
* `createDiagnosisRecord`

Bad:

* `saveThing`
* `handleData`
* `updateItem`

---

## 16. Validation Rules

Every server write must have:

* explicit input schema
* narrow accepted fields
* enum validation where applicable
* safe defaults where appropriate

Never accept raw request payloads directly into DB writes.

---

## 17. Error Handling Rules

Errors should be:

* user-safe
* specific
* non-leaky
* actionable where possible

Avoid:

* exposing internal SQL details
* exposing raw provider errors to end users
* silently swallowing failures

---

## 18. Testing Expectations

When generating code, prefer code that is testable.

Good patterns:

* pure helper functions for scheduling
* isolated context assembly functions
* separated validation schemas
* minimal side effects in UI components

Hard-to-test monolithic page files should be avoided.

---

## 19. Migration Rules

When changing schema-related code:

* preserve backward compatibility where possible
* do not casually rename core fields without a migration strategy
* document new required relations
* consider existing data integrity

---

## 20. What to Do Before Major Changes

Before implementing a major feature, reason through:

* affected entities
* security implications
* offline implications
* realtime implications
* AI context implications
* migration implications
* audit/activity implications

If a change touches many of those, it likely belongs in a service layer and not directly in page-level code.

---

## 21. Preferred Output Style for AI Code Generation

When producing code:

* use clear naming
* keep functions focused
* include comments only where useful
* do not over-abstract prematurely
* favor explicitness over cleverness
* preserve consistency with existing patterns

---

## 22. Final Instruction

Every feature must fit the existing architecture unless there is a deliberate documented architecture change.

If uncertain, choose the safer, clearer, more maintainable implementation.
