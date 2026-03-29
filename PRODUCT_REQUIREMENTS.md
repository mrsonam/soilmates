# /PRODUCT_REQUIREMENTS.md

# Plant Management System — Product Requirements

## 1. Product Summary

The Plant Management System is a private app for managing home plants and herbs. It helps users organize shared plant collections, log care actions, upload plant images, receive reminders, and use an AI-powered plant assistant for diagnosis and guidance.

The product is intended to feel calm, premium, and practical.

---

## 2. Product Goals

The app must help users:

* track their plants in an organized way
* maintain care history over time
* understand plant health and changes
* collaborate with household/family members
* receive timely reminders
* use AI assistance grounded in their actual plant data

---

## 3. Primary Users

### Primary User

A user who wants a personal plant care tracker for indoor plants and herbs.

### Secondary Users

Family members or shared household users participating in the same collection.

---

## 4. Core Use Cases

* create and manage shared collections
* invite family members to collections
* create areas inside a collection
* add plants manually, by reference selection, or AI-assisted identification
* upload cover and progress images
* log care actions
* review care history
* receive reminders
* ask AI plant questions
* get AI diagnosis from plant history and images
* search across plant-related data

---

## 5. Product Scope

## Included in Scope

* Google sign-in only
* shared private collections
* equal-control collection members
* multiple collections per user
* plant records
* areas
* logs
* reminders
* images
* AI diagnosis and chat
* realtime sync
* offline-first behavior
* push and in-app notifications
* expressive but calm UI

## Out of Scope for V1

* public sharing
* social/community features
* marketplace
* non-Google auth providers
* advanced role systems
* per-plant notification settings
* deep analytics dashboards
* native mobile app in first delivery

---

## 6. Functional Requirements

## 6.1 Authentication

* user must sign in with Google
* no email/password registration flow
* first sign-in must bootstrap a profile automatically

## 6.2 Collections

* user can create multiple collections
* user can invite others by email
* invited users can join a collection
* active collection members have equal control
* collections can be archived

## 6.3 Areas

* user can create areas within a collection
* areas can be edited and archived
* plants belong to one current area at a time
* plant area history must be stored

## 6.4 Plants

* user can add a plant manually
* user can select a plant from plant reference data
* user can upload a photo and use AI-assisted identification
* plant can exist without a matched reference record
* plant stores both reference-based information and user-specific setup
* plant can have a primary image
* plant can be archived, not hard deleted

## 6.5 Plant Reference

* system has an internal canonical plant database
* reference data may be enriched by AI or external sources
* selecting a reference plant should populate a reference snapshot on the plant record
* user-customized care setup must remain separate from reference data

## 6.6 Care Logs

* user can log care actions quickly
* user can also log detailed care actions with notes, metadata, images, and tags
* supported actions include watering, fertilizing, pruning, repotting, soil changes, propagation, harvesting, plant death, and observations
* only the creator of a care log can edit or delete that log
* deleted logs should be soft deleted, not hard deleted

## 6.7 Reminders

* reminders are plant-linked
* reminders are recurring
* reminders are initially recommended by AI but editable by user
* reminders should auto-reset after related care completion
* reminders should support future seasonal adjustment
* reminders may later adapt based on diagnosis and image updates

## 6.8 Images

* plant supports one primary cover image
* logs may contain image attachments
* diagnosis workflows may contain diagnosis images
* multiple images per update must be supported
* image history should be date-based
* images are used for documentation, growth tracking, and diagnosis

## 6.9 AI Assistant

* there is a global assistant
* there are plant-specific chat threads
* if chat starts from a plant, it must automatically use that plant’s context
* plant-specific AI should use as much relevant plant context as possible
* AI should support plant identification, care advice, diagnosis, follow-up questions, and suggestion of safest next steps
* AI must preserve uncertainty and not pretend certainty where it does not exist

## 6.10 Diagnoses

* diagnoses must be stored both conversationally and structurally
* diagnosis history must be preserved
* one diagnosis may be marked as the active/current assessment
* diagnoses should store suspected issues, confidence, recommendations, and follow-up questions

## 6.11 Dashboard

* dashboard should show due and overdue care tasks
* dashboard should show plant summary stats
* dashboard should show plant collection overview
* AI assistant must be accessible from anywhere in the app

## 6.12 Search

* global search should support plants, collections, areas, logs, tags, reminders, image updates, and diagnoses
* app should support simple keyword search and advanced filtering

## 6.13 Activity and Audit

* app should provide a collection activity feed
* app should maintain audit logs for important changes
* realtime shared updates should be visible silently

## 6.14 Notifications

* app should support in-app notifications
* app should support push notifications
* notification delivery should be smart-grouped
* notification timing should use flexible windows
* controls should be global, not per plant in V1

## 6.15 Settings

The app should support:

* theme
* reminder window
* quiet hours
* units
* AI personality level
* care sensitivity
* default collection
* notification toggles

---

## 7. Non-Functional Requirements

## Security

* strict Row Level Security
* no public plant image access
* server-side validation on writes
* no trust in client auth state alone

## Performance

* responsive across mobile and desktop
* moderate-to-high usage support
* scalable history handling
* lazy loading for heavy sections

## Reliability

* offline-first queue for writes
* deterministic sync replay
* conflict handling for shared mutable data

## Privacy

* all data is private by default
* no social sharing in scope
* AI uses private context only
* no training on user data

## Maintainability

* clear domain naming
* architectural separation
* reusable domain logic
* explicit validation

---

## 8. UX Requirements

The UI should feel:

* calm
* mindful
* premium
* minimal
* nature-inspired

The UI must support:

* mobile bottom navigation
* desktop sidebar navigation
* responsive layouts
* expressive microcopy
* quiet realtime updates

---

## 9. Success Criteria

The first release is successful if a user can:

* sign in
* create a collection
* add plants
* upload images
* log care
* see history
* receive reminders
* use AI assistance grounded in real plant context
* collaborate with another member in realtime
* use the app in unreliable connectivity conditions

---

## 10. Product Guardrails

* do not add social features to V1
* do not add complex roles to V1
* do not merge plant reference data with user setup data
* do not make AI the final authority over user control
* do not optimize aesthetics at the cost of clarity
* do not reduce security for convenience

---

## 11. Final Note

This product is not a generic CRUD app. It is a structured, shared, AI-enhanced care system. Product decisions should preserve that identity.
