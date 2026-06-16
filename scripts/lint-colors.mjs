#!/usr/bin/env node
/**
 * lint-colors.mjs — forbid direct Tailwind color utility classes in src/
 *
 * Design.md mandates semantic CSS variables (e.g. var(--color-accent-cobalt))
 * for all color usage. Raw Tailwind palette utilities (bg-slate-700, text-blue-500,
 * border-rose-200/50, shadow-indigo-600/10, etc.) are not allowed because they
 * bypass the design system.
 *
 * This script scans src/ for any forbidden class and exits non-zero with a list
 * of (file:line:class) findings. It is intentionally simple — no ESLint plugin,
 * no plugin ecosystem, just a regex scanner that runs in <100ms.
 *
 * The forbidden set mirrors scripts/migrate-colors.sed. Keep them in sync.
 *
 * Usage:
 *   node scripts/lint-colors.mjs
 *   npm run lint:colors
 *
 * Exit codes:
 *   0  no forbidden classes found
 *   1  one or more forbidden classes found (prints findings to stderr)
 *   2  tool error (e.g. cannot read src/)
 *
 * Output convention: all messages go to stderr. Exit code is the source of
 * truth for CI. (Earlier draft used stdout for success and stderr for failure;
 * this was inconsistent and made CI logs harder to grep.)
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const PALETTES = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
];
const SHADES = "(50|100|200|300|400|500|600|700|800|900|950)";

// Base utility classes: (bg|text|border|ring|outline|from|to|via)-(palette)-(shade)(/opacity)?
// `placeholder` is intentionally NOT a base utility — in v3 the form is
// `placeholder-slate-400`; in v4 it is `placeholder:text-slate-400`. The v3 form
// is covered by the base regex; the v4 form is covered by the variant regex below.
const BASE_UTILITIES = ["bg", "text", "border", "ring", "outline", "from", "to", "via", "shadow"];
const FORBIDDEN_BASE = new RegExp(
  `\\b(?:${BASE_UTILITIES.join("|")})-(?:${PALETTES.join("|")})-${SHADES}(?:\\/\\d+)?\\b`,
  "g",
);

// Tailwind variants that compose with a base color utility, e.g.:
//   placeholder:text-slate-400   (v4 — variant prefix required)
//   hover:bg-blue-500             (caught by BASE_UTILITIES — hover: prefix is irrelevant)
// The placeholder: variant is the only one whose base pattern (placeholder-…) does
// not match the base utility regex above.
const FORBIDDEN_PLACEHOLDER = new RegExp(
  `\\bplaceholder:(?:text|bg|border|ring|outline)-(?:${PALETTES.join("|")})-${SHADES}(?:\\/\\d+)?\\b`,
  "g",
);

const SCAN_EXT = new Set([".ts", ".tsx"]);

/** Recursively collect files under `dir` matching SCAN_EXT. */
async function collectFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return out;
    throw err;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await collectFiles(full)));
    } else if (e.isFile()) {
      const ext = e.name.slice(e.name.lastIndexOf("."));
      if (SCAN_EXT.has(ext)) out.push(full);
    }
  }
  return out;
}

/** Find all forbidden matches in a file. */
function findForbiddenIn(source) {
  const findings = [];
  const lines = source.split(/\r?\n/);

  const scanWith = (regex) => {
    for (let i = 0; i < lines.length; i++) {
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(lines[i])) !== null) {
        findings.push({ line: i + 1, col: m.index + 1, match: m[0] });
      }
    }
  };
  scanWith(FORBIDDEN_BASE);
  scanWith(FORBIDDEN_PLACEHOLDER);
  return findings;
}

async function main() {
  let files;
  try {
    await stat(SRC);
    files = await collectFiles(SRC);
  } catch (err) {
    process.stderr.write(`lint-colors: cannot read ${SRC}: ${err.message}\n`);
    process.exit(2);
  }

  const violations = [];
  for (const file of files) {
    const src = await readFile(file, "utf8");
    for (const f of findForbiddenIn(src)) {
      violations.push({ file: relative(ROOT, file), ...f });
    }
  }

  if (violations.length === 0) {
    process.stderr.write(`lint-colors: OK (${files.length} files scanned, 0 violations)\n`);
    process.exit(0);
  }

  process.stderr.write(
    `lint-colors: FAILED — ${violations.length} forbidden class${violations.length === 1 ? "" : "es"} found\n\n`,
  );
  violations.sort((a, b) =>
    a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col,
  );
  for (const v of violations) {
    process.stderr.write(`  ${v.file}:${v.line}:${v.col}  ${v.match}\n`);
  }
  process.stderr.write(
    `\nUse semantic CSS variables per DESIGN.md (e.g. text-[var(--color-text-primary)],\n` +
      `bg-[var(--color-accent-cobalt-bg)], border-[var(--color-accent-crimson)], etc.).\n` +
      `See scripts/migrate-colors.sed for the canonical mapping.\n`,
  );
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`lint-colors: unexpected error: ${err}\n`);
  process.exit(2);
});
