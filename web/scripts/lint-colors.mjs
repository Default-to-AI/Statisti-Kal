import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const EXTS = ['.tsx', '.ts', '.css'];

function walk(dir, files = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p, files);
    else if (EXTS.includes(extname(f.name))) files.push(p);
  }
  return files;
}

const COLOR_PATTERNS = [
  /\bslate-\d{2,3}\b/g,
  /\bgray-\d{2,3}\b/g,
  /\bzinc-\d{2,3}\b/g,
  /text-\[\s*[\d.]+\s*px\s*\]/g,
  /border-\w+-\d{2,3}/g,  // catches border-slate-800 etc.
];

const RAW_HEX_PATTERN = /(?<![A-Za-z0-9_-])#[0-9A-Fa-f]{3,8}\b/g;

// ── New patterns: catch hardcoded rgba() and bg-white in TSX/TS ──────────────
// rgba() with specific color values (not generic black/white shadows)
// We allow rgba(0,0,0,...) for shadows and rgba(255,255,255,...) for white
// overlays, but flag any rgba with color-specific RGB values.
const RGBA_COLOR_PATTERN = /rgba\(\s*(?!0\s*,\s*0\s*,\s*0\b)(?!255\s*,\s*255\s*,\s*255\b)(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,/g;

// bg-white without opacity modifier (bg-white/5 is acceptable for subtle overlays)
const BG_WHITE_PATTERN = /\bbg-white(?![/\d])/g;

let violations = 0;
const allFiles = walk(SRC_DIR);

for (const f of allFiles) {
  const content = readFileSync(f, 'utf8');

  // ── Existing checks: slate/gray/zinc, text-[NNpx], border-*-NNN ──────
  for (const re of COLOR_PATTERNS) {
    let m;
    while ((m = re.exec(content)) !== null) {
      console.error(`${f}:${content.slice(0, m.index).split('\n').length}:${m[0]}`);
      violations++;
    }
  }

  if (['.ts', '.tsx'].includes(extname(f))) {
    // ── Strip comments before checking for raw hex and rgba ───────────────
    const withoutComments = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\\textcolor\{#[0-9A-Fa-f]{3,8}\}/g, '\\textcolor{TOKEN}');

    let m;
    while ((m = RAW_HEX_PATTERN.exec(withoutComments)) !== null) {
      console.error(`${f}:${withoutComments.slice(0, m.index).split('\n').length}:${m[0]}`);
      violations++;
    }

    // ── Check for hardcoded rgba() with color values ──────────────────────
    while ((m = RGBA_COLOR_PATTERN.exec(withoutComments)) !== null) {
      console.error(`${f}:${withoutComments.slice(0, m.index).split('\n').length}:rgba(${m[1]},${m[2]},${m[3]},...) — use var(--color-*) with color-mix() or /opacity instead`);
      violations++;
    }

    // ── Check for bg-white without opacity modifier ───────────────────────
    while ((m = BG_WHITE_PATTERN.exec(withoutComments)) !== null) {
      console.error(`${f}:${withoutComments.slice(0, m.index).split('\n').length}:bg-white — use bg-[var(--color-surface)] instead`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\nlint-colors: ${violations} violation(s) in ${allFiles.length} file(s)`);
  process.exit(1);
} else {
  console.log(`lint-colors: OK (${allFiles.length} files scanned, 0 violations)`);
}
