# Statisti-Kal — The Academic Statistics Instrument

A Hebrew-first web instrument that turns abstract statistical concepts into interactive, step-by-step decision-making visualizations — so students don't just compute answers, they *see* the reasoning.

- Walk students through hypothesis testing with a live bell curve that highlights rejection regions and acceptance zones as they adjust parameters, complete with p-value calculation and a plain-Hebrew verdict
- Let them explore the normal distribution from both directions: given a value, show the probability; given a probability, find the critical value — all on a draggable, zoomable Gaussian canvas
- Teach point estimation with maximum likelihood estimators, showing how different samples lead to different estimates and why unbiasedness matters
- Run linear regression with instant scatter plots, residuals, and confidence bands so the relationship between variables becomes visually obvious before the numbers even register
- Provide a fully navigable formula sheet (grouped by topic) and a searchable Z-table — the digital equivalent of the battered reference pages every statistics student keeps in their binder
- Guide newcomers through the interface with Hebrew-language interactive tours (react-joyride) that highlight each tool, parameter, and result step-by-step, so even a first-semester student knows where to click
- Render every equation in KaTeX with strict LTR isolation inside the RTL page, because math notation should never be compromised by right-to-left text flow
- Build every component from a shared design system of dark brass-and-teal primitives, with staggered entrance animations, glow effects on active calculations, and breathing pulse indicators on live results — making statistics feel less like a spreadsheet and more like a cockpit
- Lazy-load each calculator as its own self-contained module, keeping the initial payload light and the navigation snappy even on slow campus Wi-Fi
- Serve as both a learning companion and an exam-prep tool: students can test their own hypotheses, verify homework answers, or just explore what happens when they tweak alpha, sample size, or effect size in real time
