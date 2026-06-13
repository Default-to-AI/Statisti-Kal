# Main Calculator Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a visible redesign prototype for the main normal-distribution calculator screen with stronger hierarchy, a chart-first layout, and a calmer academic visual system.

**Architecture:** Keep all calculator logic in `src/NormalDistributionCalculator.tsx`, but redesign the rendered shell for the main calculator modes and move the visual system into reusable CSS tokens/classes in `src/index.css`. Do not rewrite calculation logic; surgically replace the layout and styling surface around it.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4 utilities, Recharts, Motion.

---

### Task 1: Establish the redesign token system

**Files:**
- Modify: `src/index.css`

- [ ] Add semantic academic-instrument color, spacing, and motion tokens under `:root`
- [ ] Add app-level utility classes for shell, panels, tabs, stat bands, field groups, and result cards
- [ ] Add a `prefers-reduced-motion` rule that suppresses non-essential transitions/animations

### Task 2: Redesign the main calculator shell

**Files:**
- Modify: `src/NormalDistributionCalculator.tsx`

- [ ] Restyle the top header into a compact instrument header
- [ ] Restyle the mode navigation into calmer academic tabs
- [ ] Replace the current calculator grid with a left parameter rail and a right chart/result canvas
- [ ] Keep all existing input controls and logic, but regroup them under clearer section labels
- [ ] Introduce a result summary band and a short interpretation block above/below the chart
- [ ] Convert the derivation panel into a visually secondary panel

### Task 3: Upgrade the chart container to match the new shell

**Files:**
- Modify: `src/NormalDistributionCalculator.tsx`

- [ ] Restyle the `NormalChart` wrapper so it fits the new surface system
- [ ] Keep chart behavior unchanged, but improve heading, result chip, and panel framing
- [ ] Ensure all new colors use CSS variables instead of raw component hexes where practical

### Task 4: Verify the prototype

**Files:**
- Modify: none

- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Run the app locally and inspect the redesigned page in the browser
- [ ] Capture visual verification with screenshots before declaring completion
