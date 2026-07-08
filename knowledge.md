# Statisti-Kal — Project Knowledge

Hebrew-first (RTL) academic statistics calculator web app for students. Provides hypothesis testing, normal distribution, point estimation, linear regression, and formula/tables reference — all with step-by-step guided workflows and interactive charts.

## Quickstart

All code lives in `web/`. Run from that directory:

```bash
cd web
npm install        # (pnpm also supported)
npm run dev        # Vite dev server on port 3000 (open network: 0.0.0.0)
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Vitest (jsdom)
npm run lint       # tsc --noEmit + color lint
npm run lint:tsc   # TypeScript type-check only
npm run lint:colors # Color token validation
```

## Architecture

- **Entry:** `web/src/main.tsx` → `web/src/App.tsx`
- **Pages:** `App.tsx` lazy-loads calculators via React.Suspense. Active page state (`landing`, `hypothesis`, `point-estimation`, `normal`, `summary`, `regression`) drives routing in-app (no React Router).
- **Calculators:** `HypothesisTestingCalculator`, `NormalDistributionCalculator`, `PointEstimationPage`, `LinearRegressionCalculator` — each is a top-level page component.
- **UI primitives:** `web/src/components/ui/` — shared design-system components (Button, Card, Input, Modal, Heading, Accordion, Tooltip, etc.). **All new UI must use these templates** (per DESIGN.md), never raw `<div>` for foundational elements.
- **Statistics logic:** `web/src/lib/statistics/` — pure functions for hypothesis testing, math helpers, and power calculations.
- **Charts:** `web/src/components/charts/` — D3.js + Recharts-based charts (NormalChart, HypothesisChart, ChartPrimitives).
- **Calc UI widgets:** `web/src/components/calc-ui/` — parameter inputs, mode switches, formula tokens specific to calculator pages.
- **Guided tours:** `web/src/config/tours.ts` + react-joyride for step-by-step Hebrew walkthroughs.
- **Data flow:** No global state library. Calculator state is local React state passed via props. `useLocalStorageState` hook for persistence. Tour state managed in `App.tsx`.

## Design & Styling

- **Theme:** Dark (black `#000000` background), brass (`#D4A843`) + teal (`#4ECDC4`) accents, crimson (`#E03E3E`) for errors/rejections.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`). Design tokens defined in `web/src/index.css` via CSS custom properties and `@theme` block.
- **Fonts:** Assistant (RTL body), Inter (headings), Geist Mono (code/math), Gveret Levin (handwriting annotations).
- **Motion:** Framer Motion (`motion` package) for page transitions, staggered entrances, and glow effects.
- **Math rendering:** KaTeX via `react-katex`. Formula display uses `FormulaBlock` component.
- **RTL:** Full Hebrew right-to-left interface. KaTeX blocks are force-isolated to LTR (critical — do not modify the `.katex` rules in `index.css`).

## Conventions

- **TypeScript strict(ish):** `strict: false` in tsconfig but `noEmit: true`, ESNext modules, ES2022 target.
- **Imports:** Path alias `@/*` maps to `web/*` root. Use it for absolute imports within `web/`.
- **File naming:** PascalCase for components, camelCase for hooks/utils/tests. Test files use `.test.ts(x)` suffix.
- **Testing:** Vitest + jsdom + Testing Library. Setup file: `web/src/test-setup.ts`. Test files colocated with source.
- **Package manager:** `npm` is primary (scripts reference npm). `pnpm` lockfile also present — use `pnpm` if preferred.
- **Components must use design tokens:** Colors via `var(--color-*)`, spacing via Tailwind utilities, rounded corners via `var(--rounded-*)`.

## Gotchas

- **KaTeX RTL isolation is sacred.** The `!important` LTR rules in `index.css` are essential for correct math rendering in an RTL page. Never remove or weaken these.
- **HMR disabled in AI Studio:** `vite.config.ts` checks `DISABLE_HMR` env var — file watching is turned off during agent edits to prevent flickering.
- **`npm run lint:colors`** validates color token usage against the DESIGN.md palette. Run it after adding new colored UI.
- **The `@theme` block and `:root` tokens in `index.css` serve different purposes.** `@theme` exposes tokens as Tailwind utilities (e.g., `bg-primary`), while `:root` tokens are consumed via `var()` directly. Don't conflate the two.
- **No React Router.** Navigation is managed through `activePage` state in `App.tsx` and callbacks passed down. Add new pages by extending the `ActivePage` type and `SitePage` type.
- **`stagger-in`, `curve-glow`, `pulse-brass`, etc.** are signature CSS classes defined in `index.css` — reuse these for consistent entrance animations and glow effects.
