---
version: 2.0
name: Statisti-Kal
description: Academic-grade statistics instrument for Hebrew-speaking students. Editorial Academic aesthetic — clean, down-to-earth, and impressive, with a narrative-first approach to complex math.
---

# DESIGN.md

This document defines the **Editorial Academic** design system and the **Global Templating Architecture** that powers Statisti-Kal. 

> [!IMPORTANT]
> **Strict Adherence Rule**: All UI must be constructed using the templates defined in `web/src/components/ui`. Use the `Heading` / `SectionHeader` components for page/section titles, not raw `<h1>`/`<h2>` tags. No inline hex colors — always reference tokens via `var(--color-*)`.

## 1. Product Context
- **What this is:** A statistics calculator and learning tool that treats math as an interactive, beautifully typeset article rather than a cold, technical dashboard.
- **Who it's for:** Hebrew-speaking academic students.
- **Project type:** Academic Web Application.

## 2. Aesthetic Direction
- **Direction:** Editorial Academic
- **Decoration level:** Intentional — Subtle structural lines and elegant borders that feel like a high-end printed textbook.
- **Mood:** Professional and clean, yet not patronizing. Delivers elaborate topics with an eye-level, down-to-earth approach. Sophisticated and impressive.

## 3. Typography
- **Display/Hero (Hebrew):** `Assistant` (Weights 600-800) — Robust, clean, and modern.
- **Serif Accents (Hebrew):** `Frank Ruhl Libre` — Used sparingly for editorial flair (quotes, specific headers).
- **Body:** `Assistant` (Weights 400-500) — Highly legible for long narrative explanations.
- **Math/Formulas:** **KaTeX** is strictly used for all mathematical rendering. 
- **Data/Tabular:** `Geist Mono` — Used *only* for raw statistical outputs in tables where tabular-nums are required, not for equations.
- **Handwriting:** `Gveret Levin` — For the signature `HandwrittenNote` component, adding a human, down-to-earth touch.

## 4. Color Palette
- **Approach:** Restrained (Warm Paper & Ink)
- **Background (Paper):** `--color-background` (`#F9F9F6`) — Warm off-white, reducing eye strain.
- **Surface (Cards):** `--color-surface` (`#FFFFFF`) — Pure white for calculation blocks and interactive panels.
- **Primary Text (Ink):** `--color-text-primary` (`#1A1A1A`) — Deep ink.
- **Secondary Text:** `--color-text-secondary` (`#4A4A4A`) — Darkened gray to ensure high contrast and readability.
- **Accent (Indigo):** `--color-accent-primary` (`#4361EE`) — Vibrant, academic indigo for active states, primary buttons, and H₁ references.
- **Semantic / Charting:** 
  - **Success / Acceptance:** `#10B981` (Teal/Green)
  - **Error / Rejection:** `#EF4444` (Crimson)
  - **Warning / H₀:** `#D4A843` (Retained Brass from previous system for continuity)

## 5. Spacing & Layout
- **Approach:** Creative-editorial. Asymmetric layouts where narrative explanations sit side-by-side with math panels.
- **Base unit:** 8px.
- **Density:** Spacious. Generous whitespace prevents the interface from feeling overwhelming.
- **Border Radius:** Minimal. `--radius-sm` (4px) and `--radius-md` (8px) to maintain a crisp, printed feel.

## 6. Signature Elements & Components
To prevent visual drift, **ALL calculators** must construct their interfaces using global wrappers. The following existing signature elements have been mapped to the new aesthetic:

### `FormulaBlock` & `CalcBlock`
- **Purpose:** Standard wrappers for KaTeX display.
- **Style:** Rendered on `--color-surface` with a subtle `--color-accent-light` border or background to separate math from the narrative text.

### `HandwrittenNote`
- **Purpose:** Human-touch annotations.
- **Style:** Retains `Gveret Levin` font but uses the new `--color-accent-primary` (Indigo) to look like blue pen ink on the warm paper background.

### `Card` (with Watermarks)
- **Purpose:** Customized cards with background watermarks for different distributions (e.g., Normal curve icon in the background).
- **Style:** White surface (`#FFFFFF`) with watermarks rendered in very light gray (`#E5E5E5`) so they don't fight with the high-contrast text.

### `Exam2023` Components
- **Purpose:** Specific styling for exam pages.
- **Style:** Employs the "Printed Book" theme heavily. Sections are divided by crisp 1px borders, mimicking an elegant exam paper. 

### `ResultBlock`
- **Purpose:** Conclusion panel.
- **Style:** Distinct border-left accent (Green for acceptance, Red for rejection), ensuring the final statistical conclusion is unmistakably clear.

## 7. Motion
- **Approach:** Intentional.
- **Usage:** Smooth, choreographed entrances that guide the eye from the explanation text down to the math results. No bouncy or overly playful animations.

## 8. KaTeX RTL Isolation
**Critical constraint**: KaTeX math rendering is force-isolated to LTR inside the RTL page. The `!important` rules on `.katex`, `.katex-display`, `.katex-html`, and `.katex .base` in `index.css` must not be modified.