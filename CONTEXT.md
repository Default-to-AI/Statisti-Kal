## Global Templating Architecture
The application has recently undergone a major architectural UI revamp to enforce the **Modern Minimal** design system.

### Template Hierarchy
All user-facing calculators are built using these templates (verified against `web/src/components/ui/`):

1. **Layout Primitives (`web/src/components/ui/`)**
   - `PageLayout`: The outermost page container (sticky header, TOC, scroll-to-top).
   - `Card` / `CardHeader` / `CardBody`: Semantic surface panels (default / raised / transparent).
   - `Heading` / `SectionHeader`: Standardized page/section titles with optional brass→teal accent bar. **Raw `<h1>-<h3>` in calculators are a DESIGN.md §3 violation** — always use `Heading`.
   - `InputGroup` / `Input` / `CalculatorSidebar`: Labeled input blocks, RTL-aware, and the sidebar parameter panel.
   - `ChartWrapper`: The standardized container for Recharts visualizers (in `CustomComponents.tsx`).
   - `Disclosure` / `Accordion`: Collapsible sections (hypothesis steps, derivations).
   - `ResultBlock` / `FormulaBlock` / `HandwrittenNote`: Conclusion, math, and annotation blocks.
   - `Button` / `Badge` / `Modal` / `Table` / `Tooltip`: Shared interaction primitives.

2. **Domain Calculators (`web/src/components/`)**
   - `HypothesisTestingCalculator.tsx`
   - `NormalDistributionCalculator.tsx`
   - `LinearRegressionCalculator.tsx`
   These components handle math and state, delegating all rendering to the UI templates above. They **do not** define their own raw HTML structures.

### Design System Integration
The project uses Tailwind v4 with a custom `@theme` mapped to the Modern Minimal palette defined in `web/src/index.css` (e.g., `--color-primary`, `--chart-1`). All template components use these CSS custom properties.
