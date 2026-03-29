# /DB_SCHEMA.md

# Plant Management System — Database Schema Reference

## 1. Purpose

This document defines the domain-level database schema for the Plant Management System.

It is intended to guide:

* schema implementation
* Prisma modeling
* Supabase table design
* feature development
* query design
* RLS planning

This is a schema reference, not raw SQL.

---

## 2. Schema Principles

* all core entities use UUID primary keys
* slugs are used for URL-safe identifiers where needed
* collection is the main authorization boundary
* important entities are archived, not hard deleted
* mutable user data is separate from canonical plant reference data
* image metadata is stored in database, files in storage
* flexible fields use JSONB only where structured variability is required

---

## 3. Core Tables

## 3.1 profiles

Purpose:
Stores app-level profile data for authenticated users.

Key fields:

* id
* email
* full_name
* avatar_url
* created_at
* updated_at
* deleted_at

Notes:

* `id` matches Supabase auth user id
* one profile per auth user

---

## 3.2 collections

Purpose:
Primary shared workspace for plants and related data.

Key fields:

* id
* slug
* name
* description
* created_by
* created_at
* updated_at
* archived_at

Rules:

* collections are archived, not hard deleted
* slug must be unique

---

## 3.3 collection_members

Purpose:
Links users to collections.

Key fields:

* id
* collection_id
* user_id
* invited_by
* joined_at
* last_active_at
* status

Rules:

* unique on collection_id + user_id
* all active members currently have equal control
* status should support active, invited, removed

---

## 3.4 collection_invites

Purpose:
Tracks invitation flow for joining collections by email.

Key fields:

* id
* collection_id
* email
* invited_by
* token
* status
* expires_at
* created_at
* accepted_at

Rules:

* token must be unique
* invite status must be tracked explicitly

---

## 3.5 areas

Purpose:
Represents locations inside a collection such as living room, balcony, kitchen, bedroom, herb shelf.

Key fields:

* id
* collection_id
* slug
* name
* description
* sort_order
* created_at
* updated_at
* archived_at

Rules:

* unique on collection_id + slug
* area names are collection-scoped

---

## 3.6 plant_reference

Purpose:
Stores canonical plant reference data.

Key fields:

* id
* slug
* common_name
* botanical_name
* family
* plant_type
* care_difficulty
* light_profile
* watering_profile
* humidity_profile
* soil_profile
* fertilizer_profile
* repotting_profile
* toxicity_profile
* temperature_profile
* common_problems
* pet_safe
* edible
* source_type
* source_metadata
* confidence_score
* created_at
* updated_at

Rules:

* canonical data should not be overwritten by user-specific edits
* may be curated or AI/external enriched

---

## 3.7 plants

Purpose:
Stores actual plant instances owned within a collection.

Key fields:

* id
* collection_id
* current_area_id
* slug
* nickname
* reference_id
* reference_snapshot
* primary_image_id
* plant_type
* acquisition_type
* acquired_at
* seeded_at
* current_life_stage
* current_health_status
* ai_health_status
* user_notes
* pot_size_value
* pot_size_unit
* pot_type
* soil_mix
* drainage_status
* is_favorite
* created_by
* created_at
* updated_at
* archived_at

Rules:

* unique on collection_id + slug
* a plant may exist without a canonical reference
* reference snapshot preserves historical factual context
* current area is mutable
* archived plants remain queryable for history

---

## 3.8 plant_area_history

Purpose:
Tracks plant movement between areas.

Key fields:

* id
* plant_id
* from_area_id
* to_area_id
* moved_at
* moved_by
* reason
* notes

Rules:

* every meaningful area move should be recorded
* supports diagnostics and timeline reconstruction

---

## 3.9 care_logs

Purpose:
Stores event-based plant care history.

Key fields:

* id
* collection_id
* plant_id
* created_by
* action_type
* action_timestamp
* notes
* metadata
* deleted_at
* created_at
* updated_at

Rules:

* logs are flexible events
* metadata stores action-specific structured details
* logs are soft deletable
* only creator may edit or delete their own log

Common action types:

* watered
* fertilized
* misted
* pruned
* repotted
* soil_changed
* rotated
* moved_location
* pest_treatment
* cleaned_leaves
* propagated
* seeded
* germinated
* harvested
* plant_died
* observation
* custom

---

## 3.10 care_log_tags

Purpose:
Stores structured tags for logs.

Key fields:

* id
* care_log_id
* tag
* is_system

Rules:

* tags may be user-defined or system-defined
* useful for search and AI context enrichment

---

## 3.11 reminders

Purpose:
Stores recurring plant-linked reminders.

Key fields:

* id
* collection_id
* plant_id
* reminder_type
* title
* description
* source
* recurrence_rule
* preferred_window
* grace_period_hours
* overdue_after_hours
* last_completed_at
* next_due_at
* is_paused
* paused_until
* is_active
* created_by
* created_at
* updated_at
* archived_at

Rules:

* reminders are tied to a specific plant
* reminders usually auto-reset after matching care completion
* source indicates whether reminder came from AI, user, diagnosis, or seasonal adjustment

---

## 3.12 reminder_events

Purpose:
Stores lifecycle and state changes for reminders.

Key fields:

* id
* reminder_id
* event_type
* event_at
* actor_user_id
* details

Event examples:

* generated
* rescheduled
* completed
* snoozed
* paused
* resumed
* overdue

---

## 3.13 plant_images

Purpose:
Stores metadata for uploaded images.

Key fields:

* id
* collection_id
* plant_id
* care_log_id
* diagnosis_id
* image_type
* storage_path
* mime_type
* file_size
* width
* height
* captured_at
* uploaded_by
* created_at
* deleted_at
* metadata

Image types:

* cover
* diagnosis
* progress
* log_attachment

Rules:

* files live in private storage
* metadata is stored in database
* images may belong to plants, logs, and/or diagnoses depending on flow

---

## 3.14 diagnoses

Purpose:
Stores structured AI diagnosis records.

Key fields:

* id
* collection_id
* plant_id
* based_on_thread_id
* status
* summary
* suspected_issues
* confidence
* recommendations
* safest_next_steps
* follow_up_questions
* reasoning_notes
* diagnosed_at
* created_by_type
* created_by
* supersedes_diagnosis_id
* resolved_at
* created_at
* updated_at

Rules:

* diagnosis history is preserved
* one diagnosis may supersede another
* active diagnosis should be explicitly identifiable
* conversational AI output and structured diagnosis must remain linkable

---

## 3.15 ai_threads

Purpose:
Stores assistant conversation containers.

Key fields:

* id
* collection_id
* plant_id
* created_by
* thread_type
* title
* last_message_at
* created_at
* updated_at
* archived_at

Thread types:

* global
* plant

Rules:

* plant threads are plant-scoped
* global threads may still be collection-aware depending on UX

---

## 3.16 ai_messages

Purpose:
Stores individual AI conversation messages.

Key fields:

* id
* thread_id
* role
* content
* context_snapshot
* related_diagnosis_id
* created_by
* created_at

Roles:

* user
* assistant
* system
* tool

Rules:

* context snapshots should be stored when useful for future explainability
* important structured outputs should not live only as plain chat content

---

## 3.17 notifications

Purpose:
Stores user-facing notifications.

Key fields:

* id
* user_id
* collection_id
* plant_id
* type
* channel
* grouping_key
* title
* body
* payload
* scheduled_for
* delivered_at
* read_at
* dismissed_at
* created_at

Types:

* reminder_due
* reminder_overdue
* diagnosis_alert
* collection_activity
* system

Channels:

* in_app
* push

Rules:

* notifications are user-specific
* push and in-app may share the same logical event with different delivery state

---

## 3.18 activity_events

Purpose:
Stores human-readable feed entries for collections.

Key fields:

* id
* collection_id
* plant_id
* actor_user_id
* event_type
* summary
* payload
* created_at

Rules:

* meant for feed display
* separate from immutable audit logs

---

## 3.19 audit_logs

Purpose:
Stores immutable compliance-oriented records.

Key fields:

* id
* collection_id
* entity_type
* entity_id
* action
* actor_user_id
* before_state
* after_state
* metadata
* created_at

Rules:

* should capture key sensitive changes
* not intended for general user-facing feed UI
* should be append-only

---

## 3.20 user_settings

Purpose:
Stores user personalization and preferences.

Key fields:

* id
* user_id
* theme
* reminder_window
* quiet_hours_start
* quiet_hours_end
* water_unit
* length_unit
* ai_personality_level
* care_sensitivity
* default_collection_id
* push_enabled
* in_app_enabled
* created_at
* updated_at

Rules:

* one row per user
* settings are global to user, not collection-specific in V1

---

## 4. Local-Only Offline Store

## 4.1 sync_queue_local

Purpose:
Local IndexedDB queue for offline-first mutations.

Key fields:

* local_id
* operation_type
* entity_type
* entity_id
* payload
* created_at
* retry_count
* status
* conflict_state

Rules:

* not stored in Supabase
* used for replay and sync coordination
* should be deterministic and debuggable

---

## 5. Relationships Summary

* profile has many collection memberships
* collection has many members
* collection has many areas
* collection has many plants
* plant belongs to one collection
* plant belongs to one current area
* plant may link to one reference plant
* plant has many care logs
* plant has many reminders
* plant has many diagnoses
* plant has many images
* plant has many area history records
* diagnosis may link to thread
* thread has many messages
* notification belongs to one user

---

## 6. Authorization Summary

Collection-scoped tables should generally be readable and writable only by active members of that collection.

Creator-owned restrictions:

* care log update/delete by creator only

User-owned restrictions:

* user settings readable/writable by owning user
* notifications readable by owning user

Storage access must follow collection membership checks.

---

## 7. Indexing Guidance

Likely indexes:

* collection_id on all collection-scoped tables
* plant_id on logs, reminders, diagnoses, images
* user_id on memberships, notifications, settings
* created_at / action_timestamp / diagnosed_at / next_due_at for timeline queries
* slug uniqueness where relevant
* status fields where filtering is common

---

## 8. Schema Evolution Guidelines

When changing schema:

* preserve history
* do not merge canonical and user-instance models
* prefer additive migrations
* document enum changes
* keep offline replay compatibility in mind

---

## 9. Final Note

This schema is designed for:

* collaboration
* historical tracking
* AI explainability
* offline support
* secure private storage
* future extensibility

It should be implemented faithfully unless there is a deliberate documented architectural change.
