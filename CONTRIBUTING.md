# Contributing to Statisti-Kal

Thanks for stopping by — whether you are a Hebrew-speaking student finessing a hypothesis test, a lecturer adding a question to the exam bank, or an open-source contributor cleaning up code, you are welcome here.

Statisti-Kal is a Hebrew-first, RTL-first academic statistics instrument. Polish matters. The design is "Editorial Academic" — see `DESIGN.md`. Read `STRATEGY.md` and `CONTEXT.md` before making structural changes.

Source code lives in `web/`. Run:

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm run lint:tsc     # type-check only
npm run lint:colors  # DESIGN.md palette compliance
npm run build        # production build
npm test             # Vitest
```

## Quick links

- **License:** `LICENSE.md` — BUSL-1.1, converts to Apache 2.0 on 2028-07-15.
- **Trademark:** `TRADEMARK.md` — name, logo, and brand-id usage rules.
- **Strategy:** `STRATEGY.md`
- **Design system:** `DESIGN.md` and `web/src/index.css`.
- **Project routing:** `AGENTS.md` — if you are working on this with an AI coding assistant, it should start there.

---

## Code of conduct (short form)

- **Be kind.** This project serves students under exam-pressure; remember the audience.
- **Be specific.** Bug reports with a real problem statement and a minimal reproducing example are always welcome.
- **Be polite about style disagreements.** Suggest what to do; do not gatekeep.
- **Hebrew, English, and "Heblish with code terms"** are all acceptable in issues, PRs, and review. We do not gatekeep on language.
- We do not currently have a formal Code of Conduct document. The short form above is the working standard.

## What we are looking for

Pull requests that:

- **Add Hebrew statistics content.** Curated Hebrew translations of common exam questions, mirrored Open University and Technion question styles, worked solutions. Content is harder than code and is welcome.
- **Improve the educational flow.** Better step-by-step explanations, clearer chart annotations, more accurate KaTeX, more forgiving input validation.
- **Respect the design system.** Use shared primitives from `web/src/components/ui/`. Do not introduce raw HTML grids or ad-hoc colors. The `npm run lint:colors` script enforces this.
- **Respect right-to-left.** Do not break the RTL flow. KaTeX may always remain force-isolated to LTR — see the rules at the bottom of `AGENTS.md`.
- **Come with tests where applicable.** Statistics-math changes need unit tests in `web/src/lib/statistics/`. UI changes need at least a smoke test if the area has any.

Pull requests that we will politely close:

- Typos that don't affect rendering (please batch).
- Drive-by formatting rewrites that touch dozens of files unrelated to the change.
- New dependencies when an existing dependency already does the job — especially for visual primitives; use what already exists.

## How contributions are licensed

This is the **only** legal term that matters for contributing:

> **By opening a pull request against this repository, you agree that your contribution is licensed under the project's standing license — BUSL-1.1, with the change to Apache License 2.0 on 2028-07-15 — and may be redistributed by the project as part of the larger work.**

No CLA bot. No DCO. No "click here to sign" pop-up. Your PR is your agreement. If you are contributing on behalf of your employer, you confirm that you have authority to do so.

If a future version of this project moves to a different license (for example, after the Change Date), ongoing contributions remain available to the project under the license terms in effect at submission time.

## Pull-request workflow

1. **Open an issue first** for non-trivial changes (new calculator, rebrand, refactor of an entire module, dependency upgrade). Open the PR directly only for typo fixes, one-line bug fixes, and translation/typography tweaks.
2. **Branch off `main`** with a descriptive name: `feat/exam-bank-2023-moed-b`, `fix/normal-calculator-z-rounding`, etc.
3. **Keep changes focused.** One PR, one concern. If your PR touches more than ~600 lines excluding content, expect a request to split.
4. **Pass the gates locally before pushing:**
   ```bash
   cd web
   npm run lint:tsc     # must pass
   npm run lint:colors  # must pass
   npm test             # existing tests must still pass
   npm run build        # must build
   ```
5. **Reference the issue** in the PR title or description (e.g., `Closes #42`).
6. **Wait for review.** This is a small project with a single maintainer; reviews can take up to a week. Be patient — and pings are welcome after a week of silence.

## Issue workflow

- **Bug:** include browser, OS, the form of the data you entered, the expected output, and what you got instead. A screenshot is welcome.
- **Feature:** describe the *educational problem* the feature solves. Avoid feature-only descriptions; anchoring to "students trying to learn X will benefit because Y" lands better.
- **Hebrew content / question contribution:** attach the question as Markdown with the worked solution, and tag `exam-bank` / `translation`.

## Style

- **TypeScript strict-ish.** `strict: false` in `tsconfig.json`, but be defensive. Use the existing types — do not introduce `any` lightly.
- **KaTeX strings must use `String.raw`.** JavaScript string literals silently consume backslash-escape sequences before KaTeX sees them. For example, a single backslash followed by `m` (the start of `\mu`) in a regular string gets degraded (the `\m` is not a recognized escape and is consumed), so the math fails to render. Always use a raw template literal like `` String.raw`...` `` to preserve backslashes exactly as written.
- **Raw HTML headings in calculator pages are forbidden.** Use the `Heading` component. There is a lint check.
- **Do not introduce raw Tailwind palette classes like `bg-blue-500`.** Use semantic design tokens via `var(--color-*)` or the themed Tailwind utilities mapped in `index.css`. The color lint enforces this.
- **Right-to-left.** New components must be RTL-friendly. Test in Hebrew mode (`<html lang="he" dir="rtl">`) before opening the PR.

---

## תרומה ל-Statisti-Kal

תודה שאתם כאן. המוצר מיועד לסטודנטים בעברית, ושיפורים בתוכן העברי תמיד רצויים — שאלות מבחן, תרגומים מדויקים, וניסוחים חלופיים של הסברים.

**כללי ברזל:**

- לפני PR שאינו תיקון קטן — **פתחו Issue** ותארו את הבעיה החינוכית שאתם רוצים לפתור.
- ודאו עוברים מקומית:
  ```bash
  npm run lint:tsc
  npm run lint:colors
  npm test
  npm run build
  ```
- שמרו על הזהות העיצובית — ראו `DESIGN.md` ו-`web/src/index.css`.
- אל תשברו את תצוגת ה-RTL ואל תשנו את כללי ה-KaTeX.
- כל תרומה מתפרסמת תחת רישיון BUSL-1.1 (ראו `LICENSE.md`).

**רישוי תרומה:**

> פתיחת PR למאגר זה = הסכמה שהתרומה תופץ תחת רישיון הפרויקט (BUSL-1.1, עם המרה ל-Apache 2.0 ב-15 ביולי 2028).

**איפה אפשר לעזור:**

- תרגום שאלות מבחן מהאוניברסיטה הפתוחה / טכניון.
- ניסוח הסברים בעברית פשוטה יותר.
- בדיקת מקרי קצה במחשבונים.
- הוספת בדיקות יחידה למודולים ב-`web/src/lib/statistics/`.
- שיפור חוויית ה-RTL במובייל.

---

## See also

- `LICENSE.md` — full BUSL-1.1 terms and Change License.
- `TRADEMARK.md` — public Acceptable Use Policy for the names and logos.
- `STRATEGY.md`, `CONTEXT.md`, `DESIGN.md`, `AGENTS.md` — project routing.
