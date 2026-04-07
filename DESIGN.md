# Design System Strategy: The Digital Greenhouse

## 1. Overview & Dual Aesthetics
We embrace a premium, highly responsive UI spanning two distinct themes. The system aims for clarity, speed, and deep emotional resonance, prioritizing "Action and Care." The design acts as a living Canvas that adapts to the time of day and user connectivity.

### Light Mode: Botanical Solarium
- **Vibe:** A bright, sunlit, modern architectural greenhouse. Sharp structure, soft interactions.
- **Backgrounds:** Ultra-clean architectural white (#FFFFFF) and soft pearl (#F8FAFC) for elevation. No warm beiges.
- **Accents:** Terracotta (`#E07A5F`) for warmth/alerts and Emerald Green (`#128260`) for primary positive actions.

### Dark Mode: Midnight Conservatory
- **Vibe:** Intimate, focused, and cinematic. Like walking into a high-end greenhouse at night.
- **Backgrounds:** Deep obsidian green/black (`#07110C`) to (`#0D1F17`).
- **Accents:** Bioluminescent cyan/green (`#A3E635`) for active states and soft moonlight blues for secondary text.

---

## 2. Colors & Surface Philosophy
Both themes operate on a semantic token system mapped to CSS variables.

### The "No-Line" Rule
Designers are prohibited from using hard 1px solid borders for standard structure or grouping. Visual structure must be defined by:
*   **Background Shifts:** e.g., moving from Base to Elevated.
*   **Tonal Transitions & Diffused Shadows:** Using an alpha-channel shadow to lift cards naturally.

### Surface Hierarchy & Nesting
*   **Base:** The core background.
*   **Elevated:** Used for structural panels (sidebars, major task cards).
*   **Interactive (Highest):** Used for distinct floating items and primary components.

---

## 3. Typography
A dual-sans approach to balance authority with readable minimalism.

*   **Display & Headlines (Manrope):** Large, airy, and confident. Use tightened tracking (-2%) for a premium, editorial feel. 
*   **Body & UI (Inter):** Highly legible at small sizes. Used for all core data, metadata, and lists.
*   **Tonal Hierarchy:** Pure black/white is avoided for text. Use deep slate (`#1E293B`) or soft moon (`#F1F5F9`) for primary readable info to reduce eye strain.

---

## 4. "Alive" Performance Animations
The interface should feel organic without compromising performance. All primary interactive states are CSS-driven.

*   **Sunlight & Breathe (Micro-interactions):** Elements like buttons or active cards use a custom organic easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) to slightly "spring" or breathe on hover/interaction, mimicking physical, natural weight.
*   **Satisfying Action States:** Staggered list animations and smooth height-transitions when marking tasks as complete, reinforcing the "Action and Care" dopamine cycle.
*   **Subtle Sweeps:** Gentle gradient passes on loaders or "active" sync states to mimic sunlight across glass.

---

## 5. Components

### The Care Queue (Dashboard Focus)
Prioritizes immediate action. Uses the Elevated surface and distinct checklist rows to drive interaction. Large, satisfying touch targets for checkboxes provide immediate feedback.

### Buttons & Inputs
*   **Primary:** Pill-shaped (`rounded-full`) for a softer, welcoming feel.
*   **Secondary/Ghost:** Translucent surface mixes with no definitive outline borders, highlighting the text natively against the elevated surface.
*   **Focus State:** Instead of color changing, utilize a subtle inner/outer glow or scale shift combined with a ghost-border fallback for accessibility.

---

## 6. Offline State: Resting/Hibernating
When the PWA is disconnected or the cache is syncing:
*   The UI enters a visual state of "Resting."
*   Slight desaturation of imagery and UI.
*   An elegant overlay or status indicator that clearly communicates the offline sync-queue status, avoiding aggressive red warning banners, treating offline as a natural rhythm (a plant sleeping) rather than a hard failure.