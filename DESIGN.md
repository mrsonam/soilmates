```markdown
# Design System Strategy: The Living Canvas

## 1. Overview & Creative North Star
The Creative North Star for this system is **"The Digital Greenhouse."** 

Unlike traditional utility apps that feel cold and mechanical, this system treats the interface as a living, breathing ecosystem. We move beyond "template" design by embracing **Organic Minimalism**. We achieve this through intentional asymmetry—where images might slightly overlap container boundaries—and a high-contrast typography scale that feels more like a premium editorial magazine than a settings menu. This system prioritizes breathing room (whitespace) as a functional element, reducing cognitive load to mirror the calm of a physical garden.

---

## 2. Colors & Surface Philosophy
The palette is rooted in botanical authenticity. We avoid "pure" blacks and vibrant neons in favor of pigments found in nature.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be created exclusively through:
*   **Background Shifts:** e.g., A `surface-container-low` (#f5f3f0) card sitting on a `surface` (#fbf9f6) background.
*   **Tonal Transitions:** Using subtle shifts in the neutral scale to imply a change in context.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, like stacked sheets of fine, heavy-weight paper.
*   **Base:** `surface` (#fbf9f6) is your ground.
*   **Layer 1:** Use `surface-container-low` (#f5f3f0) for large grouping areas.
*   **Layer 2 (The Interactive Layer):** Use `surface-container-lowest` (#ffffff) for primary cards or interactive modules to make them "pop" forward naturally.

### The Glass & Gradient Rule
To achieve a "Linear/Stripe" premium finish, use **Glassmorphism** for floating elements (like bottom navigation bars or modal headers). 
*   **Token:** Use `surface` at 80% opacity with a 20px-32px `backdrop-blur`.
*   **Signature Textures:** For main CTAs or Hero backgrounds, use a subtle linear gradient from `primary` (#516447) to `primary-container` (#95a987) at a 135° angle. This adds "visual soul" that flat color cannot replicate.

---

## 3. Typography
We use a dual-sans approach to balance authority with readability.

*   **Display & Headlines (Manrope):** Large, airy, and confident. Use `display-lg` (3.5rem) for high-impact moments (e.g., "Your monstera is thriving."). The tracking should be slightly tightened (-2%) for a premium, custom-type feel.
*   **Body & UI (Inter):** Chosen for its exceptional legibility at small sizes. Use `body-md` (0.875rem) for the majority of text. 
*   **Tonal Hierarchy:** Primary information uses `on-surface` (#1b1c1a). Secondary metadata uses `on-surface-variant` (#424842). Never use pure black.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Stack `surface-container-lowest` on `surface-container-low` to create a soft, natural lift. This mimics how leaves overlap in nature.
*   **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 24px 48px -12px rgba(27, 28, 26, 0.06)`. Note the low 6% opacity; it should be felt, not seen.
*   **The Ghost Border Fallback:** If a divider is essential for accessibility, use a "Ghost Border": `outline-variant` (#c2c8c0) at **15% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
*   **Primary:** `primary` (#516447) background with `on-primary` (#ffffff) text. Use `md` (1.5rem) corner radius.
*   **Secondary:** `surface-container-high` (#eae8e5) background. No border.
*   **Interaction:** On hover, shift background to `primary-fixed-dim` (#b8cda9).

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Implementation:** Separate list items using the `3` (1rem) spacing token. Use a `surface-container-low` background on the parent container and `surface-container-lowest` for the individual items to create "tiled" separation.
*   **Radius:** Always use `lg` (2rem) for main dashboard cards and `DEFAULT` (1rem) for inner nested elements.

### Input Fields
*   **Style:** Minimalist plates. Use `surface-container-highest` (#e4e2df) as the fill. 
*   **Focus State:** Do not change the border color. Instead, use a 2px `outline` (#737972) with a soft outer glow of the same color at 10% opacity.

### Plant Growth Indicators (Custom Component)
*   **Style:** Use a thick, horizontal bar with `primary-fixed` (#d4e9c4) as the track and `primary` (#516447) as the progress. Ensure the ends are `full` (9999px) rounded.

---

## 6. Do’s and Don’ts

### Do
*   **Use Asymmetry:** Place a plant image 24px off-center to create a dynamic, organic feel.
*   **Embrace Whitespace:** If a screen feels "busy," increase the vertical spacing to the `16` (5.5rem) or `20` (7rem) token.
*   **Use Tonal Shifts:** Define content areas by switching from `#fbf9f6` to `#f5f3f0`.

### Don’t
*   **Don't use 1px lines:** Avoid the "table" look. Use space and color to group items.
*   **Don't use sharp corners:** Nothing in nature is a perfect 90-degree angle. Stick to the `16px-24px` (DEFAULT to md) range.
*   **Don't crowd the edges:** Maintain a minimum "safe zone" of `8` (2.75rem) from the screen edges for all primary content.

---

## 7. Spacing & Rhythm
Rhythm should feel unhurried. 
*   **Vertical Rhythm:** Use `12` (4rem) between major sections.
*   **Component Padding:** Use `5` (1.7rem) for internal card padding to ensure text has room to "breathe" against the edges.
*   **Micro-spacing:** Use `2` (0.7rem) for label-to-input relationships.```