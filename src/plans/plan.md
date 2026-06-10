# CSS Audit & Dark Theme Refactor — Normal Distribution Calculator

## Your Mission

Perform a full CSS audit and refactor of this project. The goal is:
1. **Remove all light theme code** — dark theme is the only theme going forward.
2. **Set dark as default** — no system preference detection, no toggle, no fallback.
3. **Audit and consolidate the color system** — consistent, professional, minimal palette.
4. **Fix accent color inconsistency** — one accent color, used deliberately.
5. **Ensure the result looks intentional** — not like a default dark mode afterthought.

---

## Step 1 — Inventory First

Before changing anything:

1. List every file that contains CSS: `.css` files, `<style>` blocks in `.html`/`.jsx`/`.tsx`, and `style={}` inline props in components.
2. Extract every unique color value used in the codebase (hex, rgb, hsl, CSS variable, named color). Group them by role: backgrounds, text, borders, accents, shadows, chart colors.
3. Flag every place where `prefers-color-scheme`, `[data-theme="light"]`, `.light-mode`, or any light-theme class/variable appears.
4. Flag every hardcoded color that is **not** referenced via a CSS variable.
5. Report your findings before writing a single line of new CSS.

---

## Step 2 — Define the Design System

After the inventory, propose a token system using this palette direction:

**Palette: Dark, analytical, minimal. Think Bloomberg terminal meets modern SaaS.**

```
Background layers (deepest → surface):
  --color-bg-base:        #0d0f14   (near-black, canvas)
  --color-bg-surface:     #151820   (cards, panels)
  --color-bg-elevated:    #1c2030   (inputs, hover states, modals)
  --color-bg-subtle:      #252a3a   (dividers, inactive tabs)

Text:
  --color-text-primary:   #e8eaf0   (main readable text)
  --color-text-secondary: #8b90a0   (labels, captions, metadata)
  --color-text-muted:     #555b6e   (disabled, placeholders)

Accent (ONE accent — pick one of the below, commit to it):
  Option A — Electric blue:  #4f8ef7  (clinical, data-focused)
  Option B — Cyan-teal:      #3ecfcf  (sharp, scientific)
  Option C — Amber:          #f5a623  (warm, readable on dark)

  --color-accent:         [chosen value]
  --color-accent-hover:   [10% lighter variant]
  --color-accent-dim:     [20% opacity version for backgrounds]

Semantic:
  --color-success:        #3dd68c
  --color-warning:        #f5a623
  --color-error:          #f06060
  --color-info:           var(--color-accent)

Borders:
  --color-border:         #252a3a
  --color-border-focus:   var(--color-accent)

Chart colors (if data viz exists):
  --chart-1: var(--color-accent)
  --chart-2: #a78bfa
  --chart-3: #3dd68c
  --chart-4: #f5a623
  --chart-5: #f06060
```

**Pick the accent based on what's already used most** — don't introduce a new color, formalize the dominant one. If there's no clear dominant, go with Option A (electric blue — most appropriate for a statistics tool).

Present this token table and your accent choice reasoning, then wait for approval before proceeding.

---

## Step 3 — Refactor Rules

Once the token system is confirmed, apply these rules strictly:

### Remove light theme entirely
- Delete any `@media (prefers-color-scheme: light)` block.
- Delete any `[data-theme="light"]`, `.light`, `.light-mode` selectors.
- Delete any theme toggle button/logic in JS/TS.
- If a CSS variable is defined in both `:root` and a `[data-theme="dark"]` override — collapse them into `:root` only.
- Remove any `localStorage.getItem('theme')` or `document.documentElement.setAttribute('data-theme', ...)` logic.

### Enforce the token system
- Replace **every** hardcoded color with the appropriate CSS variable.
- No exceptions — not in components, not in inline styles, not in chart configs.
- If a color is used only once and doesn't fit any token, either map it to the nearest token or create a new scoped token with a clear name.

### Consistency rules
- All interactive elements (buttons, inputs, selects, sliders) must use the same focus ring style: `outline: 2px solid var(--color-accent)` with a 2px offset.
- All cards/panels use `--color-bg-surface` background and `--color-border` border.
- All body text uses `--color-text-primary`. Labels/captions use `--color-text-secondary`.
- Border radius: pick one value and use it everywhere for the same element type. Suggestion: `4px` for inputs/buttons, `8px` for cards, `12px` for modals.

### Typography check
- Confirm font is legible on dark: avoid pure white (`#ffffff`) text on near-black — use `--color-text-primary` (`#e8eaf0`) instead.
- Minimum contrast ratio 4.5:1 for body text, 3:1 for large/bold text (WCAG AA). Flag any failing pairs.

---

## Step 4 — Chart/Graph Audit (if applicable)

If the site uses Chart.js, D3, or any canvas/SVG-based visualization:
- Set canvas/SVG backgrounds to transparent (inherits `--color-bg-surface`).
- Replace all hardcoded chart colors with CSS variable values pulled from the token system.
- Grid lines: `--color-border` at 40% opacity.
- Axis labels: `--color-text-secondary`.
- Tooltips: `--color-bg-elevated` background, `--color-text-primary` text, `--color-border` border.

---

## Step 5 — Deliver a Diff Summary

After all changes, produce:
1. A before/after color inventory — what was removed, what was added, what was consolidated.
2. A list of any components where you couldn't apply a variable cleanly (inline styles in dynamic JSX, third-party component overrides, etc.) and your recommendation for each.
3. Confirm: zero light theme code remains. Zero hardcoded colors remain outside the token definition block.

---

## Constraints

- Do **not** redesign the layout, change component structure, or alter any logic.
- Do **not** introduce new dependencies or icon libraries.
- Do **not** change font families unless they're currently broken on dark (e.g., invisible).
- This is a CSS/style audit only — preserve all functionality exactly.
- Hebrew RTL layout must remain intact if present.