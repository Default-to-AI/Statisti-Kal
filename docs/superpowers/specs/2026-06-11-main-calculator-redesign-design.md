# Main Calculator Redesign Design

**Goal**
Turn the main normal-distribution calculator into a premium academic instrument: calmer controls, stronger hierarchy, chart-first presentation, and a less dashboard-like visual system.

## Subject and audience
- **Subject:** Hebrew-first statistics calculator for students doing academic probability/statistics work.
- **Audience:** students who need both a correct answer and a credible visual / explanatory path.
- **Single job:** input distribution assumptions, get the result quickly, then inspect the visual and mathematical explanation.

## Design direction
**Chosen direction:** Academic Instrument

This screen should feel like a serious study tool, not a generic admin dashboard. The chart and result become the hero. Inputs become a disciplined left rail. The explanation becomes secondary by default instead of competing with the calculator.

## Visual system
### Color tokens
- `--app-bg`: deep ink background
- `--panel-bg`: raised instrument panel
- `--panel-alt`: secondary panel surface
- `--panel-border`: cool structural stroke
- `--text-strong`: primary foreground
- `--text-muted`: subdued academic copy
- `--accent`: restrained mineral teal accent
- `--accent-soft`: low-emphasis accent fill
- `--warning`: validation/error tone

### Typography
- Keep body readability high for Hebrew.
- Use one sans family for body/UI and one mono family for numeric precision only.
- Stronger weight contrast in headers and result bands.
- Remove global Tailwind class overrides as the main identity mechanism; use dedicated app tokens/classes instead.

## Layout
### Header
- Compact instrument header with title, one-line subtitle, and calmer mode switcher.
- Mode pills become cleaner tabs with less badge energy.

### Main grid
- **Left rail:** inputs only; grouped into distribution, calculation mode, and target values.
- **Main canvas:** result band first, chart second, quick interpretation beneath.
- **Derivation panel:** lower emphasis, collapsible/secondary panel after the chart.

## Interaction changes
- Add a summary/result band above the chart.
- Add short interpretation copy for the current result.
- Keep existing logic and controls, but restyle and regroup them.
- Add reduced-motion fallbacks for major transitions.

## Content decisions
- Keep Hebrew-first copy.
- Keep mathematical labels precise.
- Avoid mixed-mode flashy marketing language.
- Prefer concise academic phrasing over long decorative labels.

## Success criteria
1. The chart/result is visually the hero.
2. The input rail feels structured and less noisy.
3. The page no longer reads like a default dark Tailwind dashboard.
4. The explanation panel stops competing with the primary task.
5. Existing calculator functionality still works.
