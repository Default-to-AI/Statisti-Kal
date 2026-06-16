# ============================================================================
# migrate-colors.sed — Tailwind utility colors → semantic CSS variables
# ----------------------------------------------------------------------------
# Consolidated, deduplicated 4-tier semantic color migration.
# Replaces the previous per-pass scripts (migrate-fourth.sed, -fifth.sed,
# -sixth.sed). All rules are organized by semantic family.
#
# Usage:
#   sed -i -E -f scripts/migrate-colors.sed <files...>
#
# Family map (DESIGN.md):
#   Cobalt    ← Indigo, Blue, Violet, Purple, Fuchsia, Pink
#   Crimson   ← Rose, Red
#   Teal      ← Emerald, Green, Teal, Cyan, Sky, Lime
#   Brass     ← Amber, Orange, Yellow
#   Neutrals  ← Zinc, Neutral, Stone → text-/border-/surface-
#   Slate     → surface-raised, surface, background, border
#   Gradients ← from-/to-/via- tokens
#   Typos     ← non-standard shades (850, 650, 450, 350, 150) — source bugs
#
# Note on shadows: the shadow-{palette}-{shade} rules map to the matching
# accent LINE token (e.g. var(--color-accent-cobalt-line) is rgba(...,0.40)).
# Combined with the original /{opacity} suffix, effective shadow opacity is
# ~40% of the original raw-palette value. This is a documented trade-off; if
# the fainter look is undesirable, introduce dedicated var(--color-shadow-*)
# tokens in src/index.css and update the shadow rules below to point at them.
# ============================================================================

# ============================================================================
# Family 1: Cobalt — Indigo / Blue / Violet / Purple / Fuchsia / Pink
# ============================================================================

# --- text-indigo ---
s/text-indigo-50(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-indigo-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-indigo-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-indigo-300(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-400(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-500(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-600(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-700(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-800(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-900(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-indigo-950(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g

# --- bg-indigo ---
s/bg-indigo-50(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg)]\1/g
s/bg-indigo-100(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg)]\1/g
s/bg-indigo-200(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg-hover)]\1/g
s/bg-indigo-500(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg)]\1/g
s/bg-indigo-600(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg-hover)]\1/g
s/bg-indigo-700(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g
s/bg-indigo-800(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g
s/bg-indigo-900(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g
s/bg-indigo-950(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g

# --- border-indigo ---
s/border-indigo-50(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-100(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-200(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-300(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-400(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-500(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-600(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-700(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-800(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-900(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-indigo-950(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g

# --- ring-indigo ---
s/ring-indigo-50(\/([0-9]+))?/ring-[var(--color-accent-cobalt-line)]\1/g
s/ring-indigo-100(\/([0-9]+))?/ring-[var(--color-accent-cobalt-line)]\1/g
s/ring-indigo-500(\/([0-9]+))?/ring-[var(--color-accent-cobalt-line)]\1/g

# --- text-blue ---
s/text-blue-50(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-blue-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-blue-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-blue-300(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-400(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-500(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-600(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-700(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-800(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-900(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g
s/text-blue-950(\/([0-9]+))?/text-[var(--color-accent-cobalt)]\1/g

# --- bg-blue ---
s/bg-blue-50(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg)]\1/g
s/bg-blue-100(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg)]\1/g
s/bg-blue-200(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg-hover)]\1/g
s/bg-blue-500(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg)]\1/g
s/bg-blue-600(\/([0-9]+))?/bg-[var(--color-accent-cobalt-bg-hover)]\1/g
s/bg-blue-700(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g
s/bg-blue-800(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g
s/bg-blue-900(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g
s/bg-blue-950(\/([0-9]+))?/bg-[var(--color-accent-cobalt-strong)]\1/g

# --- border-blue ---
s/border-blue-50(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-100(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-200(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-300(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-500(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-600(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-700(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-800(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-blue-900(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g

# --- ring-blue ---
s/ring-blue-50(\/([0-9]+))?/ring-[var(--color-accent-cobalt-line)]\1/g
s/ring-blue-100(\/([0-9]+))?/ring-[var(--color-accent-cobalt-line)]\1/g
s/ring-blue-400(\/([0-9]+))?/ring-[var(--color-accent-cobalt)]\1/g
s/ring-blue-500(\/([0-9]+))?/ring-[var(--color-accent-cobalt-line)]\1/g

# --- text-violet / text-purple / text-fuchsia / text-pink ---
s/text-violet-50(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-violet-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-violet-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-purple-50(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-purple-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-purple-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-fuchsia-50(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-fuchsia-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-fuchsia-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-pink-50(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-pink-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-pink-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g

# --- border-violet / border-purple / border-fuchsia / border-pink ---
s/border-violet-100(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-violet-200(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-purple-100(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-purple-200(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-fuchsia-100(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-fuchsia-200(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-pink-100(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g
s/border-pink-200(\/([0-9]+))?/border-[var(--color-accent-cobalt-line)]\1/g

# ============================================================================
# Family 2: Crimson — Rose / Red
# ============================================================================

# --- text-rose / text-red ---
s/text-rose-50(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-100(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-200(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-300(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-400(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-500(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-600(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-700(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-800(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-900(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-rose-950(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-50(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-100(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-200(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-300(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-400(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-500(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-600(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-700(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-800(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-900(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g
s/text-red-950(\/([0-9]+))?/text-[var(--color-accent-crimson)]\1/g

# --- bg-rose / bg-red ---
s/bg-rose-50(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-100(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-500(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-600(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-700(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-800(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-900(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-rose-950(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-50(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-100(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-500(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-600(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-700(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-800(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-900(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g
s/bg-red-950(\/([0-9]+))?/bg-[var(--color-accent-crimson)]\1/g

# --- border-rose / border-red ---
s/border-rose-50(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-rose-100(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-rose-500(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-rose-600(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-rose-700(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-rose-800(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-rose-900(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-50(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-100(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-400(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-500(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-600(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-700(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-800(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g
s/border-red-900(\/([0-9]+))?/border-[var(--color-accent-crimson)]\1/g

# --- ring-rose / ring-red ---
s/ring-rose-50(\/([0-9]+))?/ring-[var(--color-accent-crimson)]\1/g
s/ring-rose-100(\/([0-9]+))?/ring-[var(--color-accent-crimson)]\1/g
s/ring-rose-500(\/([0-9]+))?/ring-[var(--color-accent-crimson)]\1/g
s/ring-red-500(\/([0-9]+))?/ring-[var(--color-accent-crimson)]\1/g

# ============================================================================
# Family 3: Teal — Emerald / Green / Teal / Cyan / Sky / Lime
# ============================================================================

# --- text-emerald / text-green / text-teal / text-cyan / text-sky / text-lime ---
s/text-emerald-50(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-emerald-100(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-emerald-200(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-emerald-300(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-emerald-400(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-emerald-500(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-emerald-600(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-emerald-700(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-emerald-800(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-emerald-900(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-emerald-950(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-green-50(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-green-100(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-green-200(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-green-300(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-green-400(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-green-500(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-green-600(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-teal-50(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-teal-100(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-teal-200(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-teal-300(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-teal-400(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-teal-500(\/([0-9]+))?/text-[var(--color-success)]\1/g
s/text-cyan-50(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-cyan-100(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-sky-50(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-sky-100(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-lime-50(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g
s/text-lime-100(\/([0-9]+))?/text-[var(--color-accent-teal)]\1/g

# --- bg-emerald / bg-green / bg-teal ---
s/bg-emerald-50(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-100(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-500(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-600(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-700(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-800(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-900(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-emerald-950(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-green-50(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g
s/bg-teal-50(\/([0-9]+))?/bg-[var(--color-accent-teal)]\1/g

# --- border-emerald / border-green / border-teal ---
s/border-emerald-50(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-100(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-200(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-300(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-400(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-500(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-600(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-700(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-800(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-emerald-900(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-green-100(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-green-500(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g
s/border-teal-100(\/([0-9]+))?/border-[var(--color-accent-teal)]\1/g

# --- ring-emerald ---
s/ring-emerald-400(\/([0-9]+))?/ring-[var(--color-accent-teal)]\1/g
s/ring-emerald-500(\/([0-9]+))?/ring-[var(--color-accent-teal)]\1/g

# ============================================================================
# Family 4: Brass — Amber / Orange / Yellow
# ============================================================================

# --- text-amber / text-orange / text-yellow ---
s/text-amber-50(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-amber-100(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-amber-200(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-amber-300(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-amber-400(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-amber-500(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-amber-600(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-amber-700(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-amber-800(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-amber-900(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-amber-950(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-orange-50(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-orange-100(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-orange-200(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-orange-300(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-orange-400(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-orange-500(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-orange-600(\/([0-9]+))?/text-[var(--color-warning)]\1/g
s/text-yellow-50(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g
s/text-yellow-100(\/([0-9]+))?/text-[var(--color-accent-brass)]\1/g

# --- bg-amber / bg-orange ---
s/bg-amber-50(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-100(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-500(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-600(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-700(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-800(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-900(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-amber-950(\/([0-9]+))?/bg-[var(--color-warning)]\1/g
s/bg-orange-50(\/([0-9]+))?/bg-[var(--color-accent-brass)]\1/g
s/bg-orange-950(\/([0-9]+))?/bg-[var(--color-warning)]\1/g

# --- border-amber / border-orange ---
s/border-amber-50(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-amber-100(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-amber-500(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-amber-600(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-amber-700(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-amber-800(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-amber-900(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g
s/border-orange-100(\/([0-9]+))?/border-[var(--color-accent-brass)]\1/g

# --- ring-amber ---
s/ring-amber-500(\/([0-9]+))?/ring-[var(--color-accent-brass)]\1/g

# ============================================================================
# Family 5: Neutrals — Zinc / Neutral / Stone → text/border/surface
# ============================================================================

# --- text-zinc / text-neutral / text-stone ---
s/text-zinc-100(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-zinc-200(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-zinc-300(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-zinc-400(\/([0-9]+))?/text-[var(--color-text-secondary)]\1/g
s/text-zinc-500(\/([0-9]+))?/text-[var(--color-text-secondary)]\1/g
s/text-zinc-600(\/([0-9]+))?/text-[var(--color-text-secondary)]\1/g
s/text-zinc-700(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-zinc-800(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-zinc-900(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g
s/text-zinc-950(\/([0-9]+))?/text-[var(--color-text-primary)]\1/g

# --- bg-zinc / bg-neutral / bg-stone ---
s/bg-zinc-100(\/([0-9]+))?/bg-[var(--color-surface-raised)]\1/g
s/bg-zinc-800(\/([0-9]+))?/bg-[var(--color-surface-raised)]\1/g
s/bg-zinc-900(\/([0-9]+))?/bg-[var(--color-surface)]\1/g
s/bg-zinc-950(\/([0-9]+))?/bg-[var(--color-background)]\1/g

# --- border-zinc / border-neutral / border-stone ---
s/border-zinc-200(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-zinc-600(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-zinc-700(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-zinc-800(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-zinc-900(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-zinc-950(\/([0-9]+))?/border-[var(--color-border)]\1/g

# ============================================================================
# Shadows — tailwind shadow-{palette}-{shade} → shadow-[var(--...)]/{shade}
# Shadow color maps to the matching accent line token so shadows tint with
# the design system. The optional /{opacity} suffix is preserved verbatim.
# Pattern consumes the whole `shadow-{palette}-{shade}[/{opacity}]` and
# re-emits the opacity group unchanged. (A naive capture of the shade only
# would mis-insert the shade as the opacity, e.g. /600/10.)
# ============================================================================
s/shadow-indigo-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-cobalt-line)]\1/g
s/shadow-blue-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-cobalt-line)]\1/g
s/shadow-violet-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-cobalt-line)]\1/g
s/shadow-purple-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-cobalt-line)]\1/g
s/shadow-fuchsia-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-cobalt-line)]\1/g
s/shadow-pink-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-cobalt-line)]\1/g
s/shadow-emerald-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-teal)]\1/g
s/shadow-green-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-teal)]\1/g
s/shadow-teal-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-teal)]\1/g
s/shadow-cyan-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-teal)]\1/g
s/shadow-sky-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-teal)]\1/g
s/shadow-amber-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-brass)]\1/g
s/shadow-orange-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-brass)]\1/g
s/shadow-yellow-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-brass)]\1/g
s/shadow-rose-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-crimson)]\1/g
s/shadow-red-[0-9]+(\/[0-9]+)?/shadow-[var(--color-accent-crimson)]\1/g

# ============================================================================
# Slate — surface-raised / surface / background / border
# ============================================================================

# --- bg-slate ---
s/bg-slate-100\/5/bg-[var(--color-surface-raised)]\/5/g
s/bg-slate-200(\/([0-9]+))?/bg-[var(--color-surface-raised)]\1/g
s/bg-slate-500(\/([0-9]+))?/bg-[var(--color-surface-raised)]\1/g
s/bg-slate-600(\/([0-9]+))?/bg-[var(--color-surface-raised)]\1/g
s/bg-slate-700(\/([0-9]+))?/bg-[var(--color-surface-raised)]\1/g

# --- border-slate ---
s/border-slate-300(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-slate-400(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-slate-500(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-slate-600(\/([0-9]+))?/border-[var(--color-border)]\1/g
s/border-slate-700\/40/border-[var(--color-border)]\/40/g
s/border-slate-700\/60/border-[var(--color-border)]\/60/g

# ============================================================================
# Gradients — from- / to- / via-
# ============================================================================

s/from-slate-700(\/([0-9]+))?/from-[var(--color-surface-raised)]\1/g
s/from-slate-800(\/([0-9]+))?/from-[var(--color-surface-raised)]\1/g
s/from-slate-900(\/([0-9]+))?/from-[var(--color-surface)]\1/g
s/from-indigo-500(\/([0-9]+))?/from-[var(--color-accent-cobalt)]\1/g
s/from-indigo-600(\/([0-9]+))?/from-[var(--color-accent-cobalt)]\1/g
s/to-slate-800(\/([0-9]+))?/to-[var(--color-surface-raised)]\1/g
s/to-slate-900(\/([0-9]+))?/to-[var(--color-surface)]\1/g
s/to-indigo-500(\/([0-9]+))?/to-[var(--color-accent-cobalt)]\1/g
s/to-blue-500(\/([0-9]+))?/to-[var(--color-accent-cobalt)]\1/g
s/via-slate-900(\/([0-9]+))?/via-[var(--color-surface)]\1/g
s/via-indigo-500(\/([0-9]+))?/via-[var(--color-accent-cobalt)]\1/g

# ============================================================================
# Placeholder (Tailwind v3 utility syntax → v4 variant syntax)
# `placeholder-slate-400` is the v3 shorthand for `placeholder:text-slate-400`.
# In v4 the variant prefix is required, so the migration produces the v4 form.
# ============================================================================
s/placeholder-slate-400/placeholder:text-[var(--color-text-secondary)]/g

# ============================================================================
# Shadow fix-up — repair broken `shadow-[var(...)]/NNN/NN` artifacts
# Older shadow rules that captured the shade as opacity produced
# `shadow-[var(--color-accent-cobalt-line)]/600/10`. The intended output is
# `shadow-[var(--color-accent-cobalt-line)]/10`. This rule strips the
# intermediate shade number, keeping the actual opacity. Idempotent: it does
# not match already-correct `shadow-[var(...)]/NN` (single slash, no shade).
# (Note: plain `()` capture groups, not `(?:...)` — sed does not support
# non-capturing groups.)
# ============================================================================
s|(\[(var\(--color-accent-[a-z-]+\))\])/[0-9]+/([0-9]+)|\1/\3|g

# ============================================================================
# Non-standard shade typos — source-code bugs (850, 650, 450, 350, 150)
# Tailwind shades are 50/100/200/.../900/950. Any other number is a bug.
# ============================================================================

s/text-slate-150/text-[var(--color-text-primary)]/g
s/text-slate-350/text-[var(--color-text-secondary)]/g
s/text-slate-450/text-[var(--color-text-secondary)]/g
s/text-slate-650/text-[var(--color-text-primary)]/g
s/text-slate-850/text-[var(--color-text-primary)]/g
s/bg-slate-650/bg-[var(--color-surface-raised)]/g
s/bg-slate-850/bg-[var(--color-surface)]/g
s/border-slate-650/border-[var(--color-border)]/g
s/border-slate-850/border-[var(--color-border)]/g
s/text-orange-850/text-[var(--color-warning)]/g
s/text-red-650/text-[var(--color-accent-crimson)]/g
