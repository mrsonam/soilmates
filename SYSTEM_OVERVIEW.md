# 🌿 Plant Management System — Architecture & Product Overview

## 1. Vision

This application is a **private, shared plant management system** designed to help users track, care for, and understand their plants through structured data, intelligent reminders, and AI-assisted insights.

The system combines:

* plant tracking
* care logging
* intelligent reminders
* AI-based plant diagnosis and assistance
* real-time collaboration
* offline-first functionality

The app is built as a **PWA-first system** with a **mobile-ready architecture**.

---

## 2. Core Principles

* **Collection-centric architecture**
* **Private-first design (no social features)**
* **AI-enhanced but user-controlled**
* **Offline-first with sync**
* **Real-time collaboration**
* **Strict security via RLS**
* **Extensible data model**

---

## 3. Technology Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* TanStack Query (server state)
* Zustand (UI state)
* PWA (service worker)
* IndexedDB (offline queue via Dexie)

### Backend

* Supabase (Postgres, Auth, Storage, Realtime)
* Prisma (ORM and schema management)
* Server Actions + Route Handlers

### AI Layer

* Plant identification (image-based)
* Diagnosis engine
* Context-aware assistant (global + plant-specific)
* Structured diagnosis storage

---

## 4. High-Level Architecture

### Root Model

The system is **collection-centric**:

Collection
→ Members
→ Areas
→ Plants
→ Logs / Images / Reminders / Diagnoses

---

### Entity Relationships

* A user can belong to multiple collections
* A collection has multiple members (equal control)
* A collection contains:

  * areas
  * plants
* A plant:

  * belongs to one current area
  * maintains area history
  * has logs, images, reminders, diagnoses
* AI threads can be global or plant-specific

---

## 5. Core Features

### 5.1 Collections & Collaboration

* Shared collections with equal access
* Email-based invite system
* Real-time updates across members
* Activity feed and audit logs

---

### 5.2 Plant Management

Each plant includes:

#### Identity

* nickname
* reference plant (optional)
* reference snapshot
* primary image

#### Care Setup

* light, water, humidity (AI + editable)
* pot, soil, drainage
* location (area)

#### Lifecycle

* life stage (AI suggested + editable)
* health status (AI + manual)

#### History

* logs
* images
* diagnoses
* reminders

---

### 5.3 Plant Reference System

* Internal canonical database
* Optional AI enrichment
* Soft linking with snapshot storage
* Independent plant support (unknown plants allowed)

---

### 5.4 Care Logs (Event-Based)

Logs are flexible events:

Examples:

* watered
* fertilized
* repotted
* pruned
* harvested

Each log includes:

* timestamp
* metadata (JSON)
* optional images
* tags

Logs are:

* editable only by creator
* never hard-deleted (soft delete)

---

### 5.5 Reminders System

* Plant-linked reminders
* AI-generated defaults
* Editable by user

Features:

* recurring rules
* auto-reset on completion
* flexible time windows
* grace periods
* overdue tracking
* future seasonal adaptation

---

### 5.6 Image System

Images are categorized:

* cover image
* progress image
* diagnosis image
* log attachment

Images can belong to:

* plants
* logs
* diagnoses

Features:

* multiple images per update
* timeline-based history
* AI diagnosis input

---

### 5.7 AI System

#### Modes

* Global assistant
* Plant-specific assistant

#### Context Sources

* plant reference
* care logs
* reminders
* images
* diagnoses
* notes

#### Capabilities

* plant identification
* care recommendations
* health diagnosis
* adaptive reminders
* conversational interaction

#### Diagnosis Model

* structured records
* history preserved
* one active diagnosis
* confidence + reasoning + recommendations

#### Behavior

* shows uncertainty
* asks follow-up questions
* suggests safe actions first

---

### 5.8 Notifications

Types:

* in-app notifications
* push notifications

Features:

* smart grouping
* flexible timing
* global controls
* quiet hours

---

### 5.9 Dashboard

Hybrid dashboard:

Top:

* due today
* overdue tasks

Middle:

* stats (plants, health)

Bottom:

* plant grid

Global:

* AI assistant access

---

### 5.10 Search System

* global search across:

  * plants
  * collections
  * logs
  * reminders
  * images
  * diagnoses

* supports:

  * keyword search
  * advanced filters

---

## 6. Offline-First Architecture

### Capabilities

* log care actions offline
* queue image uploads
* view cached data
* sync when online

### Sync Model

* IndexedDB queue
* optimistic UI updates
* background sync
* conflict detection

### Conflict Strategy

* logs: creator-controlled
* plants/reminders: last-write-wins + warning
* images: independent

---

## 7. Real-Time System

Powered by Supabase Realtime:

* plant updates
* care logs
* reminders
* activity feed
* notifications

Behavior:

* silent UI updates
* no disruptive alerts

---

## 8. Security & Compliance

### Access Control

* strict Supabase RLS policies
* collection-based authorization

### Data Ownership

* user owns all data
* export supported (future)

### Privacy

* images are private
* signed URLs only

### AI Data

* no training on user data
* context-only usage

### Audit Logs

* immutable records of all key actions

---

## 9. Deletion Strategy

* plants → archived
* collections → archived
* logs → soft delete
* images → soft delete

No destructive hard deletes for core entities.

---

## 10. State Management

### TanStack Query

* server data
* caching
* sync
* optimistic updates

### Zustand

* UI state
* filters
* assistant panel
* selected collection
* offline indicators

---

## 11. Routing Structure

Nested routing:

/collections/[collection]
→ /areas/[area]
→ /plants/[plant]

Plant detail:

* overview
* history
* photos
* reminders
* AI
* diagnosis
* activity

---

## 12. Settings

Includes:

* reminder window
* quiet hours
* units
* theme
* AI tone
* notification controls
* default collection

---

## 13. UI/UX Design System

Style:

* minimal + premium + nature-inspired

Characteristics:

* soft rounded cards
* subtle shadows
* expressive microcopy
* calm tone
* responsive (mobile + desktop)

---

## 14. Naming Conventions

Use clean domain naming:

* collections
* plants
* care_logs
* reminders
* plant_images
* diagnoses
* ai_threads
* notifications

Avoid prefixes.

---

## 15. Development Phases

### Phase 1

* auth
* collections
* plants
* logs
* basic UI

### Phase 2

* reminders
* notifications
* activity feed
* realtime

### Phase 3

* offline system
* sync queue

### Phase 4

* AI system
* diagnosis
* adaptive reminders

---

## 16. Key Rules for Development

* never bypass RLS
* validate all inputs (Zod)
* separate reference vs user data
* use server actions for writes
* no public storage buckets
* archive instead of delete
* log important changes

---

## 17. Future Expansion (Planned but not in V1)

* seasonal AI adjustments
* advanced analytics
* per-plant notification controls
* mobile app (React Native)
* plant marketplace integrations

---

## 18. Summary

This system is designed to be:

* scalable
* secure
* AI-driven
* user-friendly
* production-ready

It combines structured data, real-time collaboration, and intelligent automation to create a complete plant care ecosystem.
