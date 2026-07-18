# DISTRIBUTION.md

> Canonical playbook for sharing Statisti-Kal with Hebrew-speaking statistics students and capturing usage data.
> Last updated: 2026-07-16.

This document describes **how to share Statisti-Kal** with the audience it was built for: Hebrew-speaking university and college statistics students. It also lists the tracking scheme used on `statisti-kal.com` (UTM parameters + Plausible custom events) so we can measure what works.

---

## 1. Where Statisti-Kal lives

- **Canonical URL:** `https://statisti-kal.com/`
- **Hash-routes for deep linking:** `#hypothesis`, `#point-estimation`, `#forward`, `#inverse`, `#regression`, `#table`, `#formula-sheet`, `#summary`, `#test-yourself`, `#exam-2023`
- **Source code:** `https://github.com/AI-Degen-69/Statisti-Kal`

Always share the canonical URL with UTM tags (see §6). Localhost URLs and previews are filtered out by Plausible, so they do not pollute stats.

---

## 2. Audience (in priority order)

1. **Hebrew-speaking university / college intro-stats students** (Hebrew University, Tel Aviv University, Ben-Gurion, Haifa, Technion, IDC, המכללות). Primary user.
2. **High-school students preparing for psychometric / statistics-heavy bachelor's admissions** — secondary.
3. **Tutors / TAs of intro-stats courses** — multiplier. One lecturer telling ten students is more efficient than ten student shares.
4. **Israeli bootcamps / college-level data analytics programs** (per LICENSE.md Additional Use Grant §3, institutional deployment requires a commercial license — see §5).

---

## 3. Channels (ranked by expected impact for this audience)

| Rank | Channel | Format | UTM `utm_source` | Why |
|---|---|---|---|---|
| 1 | **WhatsApp study groups** (course-specific, faculty-wide) | Link + one-line Hebrew tip | `whatsapp` | The dominant peer-to-peer channel for Israeli university students. |
| 2 | **Facebook student groups** ("סטודנטים …" groups, faculty-scoped groups) | Link + screenshot + 2-line pitch | `facebook` | Long-tail discovery. Many older students still live here. |
| 3 | **Telegram channels / groups** (Israeli tech & student channels) | Link + 1-line pitch | `telegram` | Fast broadcast, used by academic channels like AcademiaPlus, Technion Students. |
| 4 | **TAs / lecturers** (direct outreach) | Polite personal WhatsApp / email | `outreach` | One endorsement → tens of students. |
| 5 | **Reddit** (`r/Israel`, `r/AcademicIsrael`, `r/learnmath`, `r/statistics`) | Self-post with context | `reddit` | Long shelf-life; surfaces in Google indexing. |
| 6 | **Israeli forums** (תפוז old forum, פרוג) | Reply to relevant threads | `forum` | Older demographic; still active for older degree-completers. |
| 7 | **YouTube / Instagram Reels / TikTok** (short Hebrew demos) | 30–60 s screen-record of the bell-curve visualizer | `video` | Discovery + trust signal. |
| 8 | **Educational aggregators** (Symbaloo, Pearltrees, course-link lists) | Listed resource entry | `aggregator` | Slow but persistent; good for SEO backlinks. |
| 9 | **Product Hunt / Show HN** | Show HN-style post (English) | `show-hn` | **Read TRADEMARK.md first**; brand-respecting formulation required. |

Each row has a Hebrew posting template in §7.

---

## 4. What to share — the canonical asset bundle

For every post on every channel, lead with **the link** and (when the channel allows) the **`og-image.png`** preview card. The card is generated automatically by social sites from the `<meta property="og:image">` tag in `web/index.html`.

Optional supporting assets to attach depending on channel:

- `web/public/images/visualization.png` — bell-curve visualization.
- `web/public/images/terminology.png`, `terminology-2.png`, `terminology-3.png`, `terminology-answer.png` — Z-table terminology pages.
- `web/public/images/definitions.png` — formula definitions.
- `web/public/images/input-parameters.png` — calculator input panel.
- `web/public/public_images/landing-showcase-2026-06-22/formula-sheet.png` — formula sheet visual.
- `web/public/public_images/landing-showcase-2026-06-22/z-table.png` / `t-table.png` — table pages.
- `web/public/public_images/landing-showcase-2026-06-22/solution-steps.png` — step-by-step solution.

> Never attach screenshots that contain personal data. We never process or display personal data here.

---

## 5. License boundaries (DO NOT cross)

`LICENSE.md` (BUSL-1.1) sets hard rails. **All distribution must respect these.**

✅ **Permitted sharing** (no license needed):

- Sharing the hosted URL in any student group.
- Embedding screenshots in academic articles / blog posts / YouTube reviews.
- A single personal share per cohort.

❌ **Forbidden** (violates Additional Use Grant §1):

- Charging any individual student for access to the app.
- Wrapping the calculators behind a "PRO" tier for end users.
- Selling membership / registration-required use.

⚠️ **Needs a separate license** (Additional Use Grant §3 + TRADEMARK.md §5):

- A university purchasing a campus license (`license@statisti-kal.com`).
- A bootcamp / training company bundling the brand.
- Submitting an app store entry under any name containing "Statisti-Kal".
- Selling merchandise with the brand mark.

If you are unsure — ask `license@statisti-kal.com`.

---

## 6. Tracking scheme (Plausible + UTM)

Plausible is enabled in `web/index.html` with `script.hash.js` (hash-mode). Two layers of tracking:

### A. Standard UTM parameters (per channel)

Every link shared must carry UTM so Plausible segments traffic by source. The UTM values must be lowercase, no spaces.

| Parameter | Pattern | Examples |
|---|---|---|
| `utm_source` | lowercase channel name | `whatsapp`, `facebook`, `telegram`, `outreach`, `reddit`, `forum`, `video`, `aggregator`, `show-hn` |
| `utm_medium` | always `social` for organic posts; `email` for outreach | `social`, `email` |
| `utm_campaign` | snake_case describing the post | `study_groups_intro`, `lecturer_outreach_kickoff` |
| `utm_content` *(optional)* | variant of creative | `bell_curve_demo`, `formula_sheet` |

Example canonical share URL:

```
https://statisti-kal.com/?utm_source=whatsapp&utm_medium=social&utm_campaign=study_groups_intro
https://statisti-kal.com/#hypothesis?utm_source=telegram&utm_medium=social&utm_campaign=inference_calc
```

### B. Custom Plausible events (in-product)

These are dispatched from React components on user actions:

| Event | Trigger | Where |
|---|---|---|
| `newsletter_signup` | User submits newsletter form | `web/src/components/ui/NewsletterForm.tsx` |
| `share_click` *(future)* | User clicks share / copy-link button | (planned) — keep API consistent |

To enable custom-event tracking in Plausible: visit [plausible.io/stats/<your-domain>](https://plausible.io/) → **Settings → Goals → Add goal** → match the event names above (no `props` needed initially).

### C. Hash-mode SPA tracking

The Plausible script URL is `script.hash.js` (set in `web/index.html`). This makes routes like `/#hypothesis` register as distinct pageviews, so we can see which calculator each visitor lands on.

If you ever migrate to a path-routed SPA, switch the script back to `script.js`.

---

## 7. Posting templates (copy-paste ready)

### WhatsApp / SMS — short

```
היי, מצאתי כלי שעוזר לי עם בדיקת השערות והתפלגות נורמלית —
בעברית, עם גרפים של פעמון הגאוס, ומראה שלב אחר שלב.
חינם: https://statisti-kal.com/?utm_source=whatsapp&utm_medium=social&utm_campaign=study_groups_intro
```

### Facebook group — short post

```
למי שעושה / עשה סטטיסטיקה באקדמיה —
מצאתי כלי אינטראקטיבי בעברית: מחשבון התפלגות נורמלית, בדיקת השערות,
אמידה נקודתית, רגרסיה. כל חישוב מציג גם את הדרך ולא רק תוצאה, ויש גם דף נוסחאות ניווט מהיר.

שווה נסיון לפני מבחן:
🔗 https://statisti-kal.com/?utm_source=facebook&utm_medium=social&utm_campaign=student_groups
```

### Telegram channel — minimal

```
Statisti-Kal · מחשבוני סטטיסטיקה בעברית (RTL מלא, חינם):
https://statisti-kal.com/?utm_source=telegram&utm_medium=social&utm_campaign=telegram_share
```

### Lecturer / TA outreach — WhatsApp / email

```
היי [שם],
אני [שם], בניתי כלי חינמי בעברית שעוזר לסטודנטים בסטטיסטיקה:
מחשבונים אינטראקטיביים עם הצגה של הדרך (בדיקת השערות, התפלגות נורמלית,
רגרסיה ועוד). רץ בדפדפן בלי להתקין שום דבר.

אשמח אם תוכל/י להפיץ לסטודנטים שלך, או להמליץ בתחילת הקורס.
הכל בקוד פתוח (BUSL-1.1, חינם לסטודנטים) — רישיון מסחרי למוסד זמין בנפרד.

קישור + תצוגה מקדימה:
https://statisti-kal.com/?utm_source=outreach&utm_medium=email&utm_campaign=lecturer_outreach_kickoff
```

### Reddit (English) — for r/learnmath or r/statistics

```
Title: Hebrew-first open-source statistics calculator (hypothesis testing,
normal distribution, regression) — works in RTL

I built [Statisti-Kal](https://statisti-kal.com/) because every free stats
tool I tried was English-first with awkward translations for Hebrew students.
It does interactive stepwise hypothesis testing, normal distribution
probabilities, ordinary-least-squares regression, and includes a Hebrew
formula sheet + Z/T tables. KaTeX math is LTR-isolated inside the RTL page
so equations render correctly. Free for individual students, source-available
under BUSL-1.1. Looking for feedback from anyone teaching or studying in
Hebrew/RTL — or pointers to existing tools I missed.

https://statisti-kal.com/?utm_source=reddit&utm_medium=social&utm_campaign=show_hn_english
```

### YouTube — short demo voiceover (Hebrew)

```
"בכל פעם שאני רואה סטודנט מתקע על בדיקת השערות…"

[30 s screen-record of /#hypothesis filling in μ₀, σ, x̄, n, α,
and watching the bell curve draw the rejection region live,
then clicking 'חשב' to step through p-value and verdict]

"…אני שולח אותו לכאן. חינם, בעברית, רץ בדפדפן."
[End card: statisti-kal.com + subscribe bell]
```

Tag the video URL with `?utm_source=video&utm_medium=social&utm_campaign=youtube_bell_curve_demo` in the description.

---

## 8. Distribution rhythm

- **Week 1 (kickoff):** WhatsApp study groups (5–10 groups, low-key), one Telegram broadcast, one Facebook group post.
- **Week 2:** Direct outreach to 2–3 statistics lecturers / TAs at Hebrew University, Tel Aviv University, Ben-Gurion.
- **Week 3:** Reddit posts (English + Hebrew), YouTube demo recording.
- **Week 4+:** Steady one-post-per-channel-per-month. Don't spam.
- **Always:** update `lastmod` in `web/public/sitemap.xml` when you ship a meaningful release.

---

## 9. What *not* to do

- **Don't share to non-academic Hebrew groups** ("Israel/Politics" etc.) — irrelevant audience, brand confusion.
- **Don't re-host under any confusingly similar name** (TRADEMARK.md §3 — fork and rename, please).
- **Don't scrape student emails** — we don't, and never will.
- **Don't pay for placement** on Israeli student portals without checking `license@statisti-kal.com` (paid placement of the official brand needs trademark consent per TRADEMARK.md §5).
- **Don't write "Pro" tiers for individuals** — your own LICENSE.md forbids it.

---

## 10. Files involved in distribution

| File | Role |
|---|---|
| `web/index.html` | SEO, Open Graph, Twitter Card, canonical, JSON-LD, manifest, favicon chain |
| `web/public/og-image.svg` / `og-image.png` | 1200×630 share card source + raster |
| `web/public/favicon.svg` / `apple-touch-icon.png` | Browser + iOS home-screen icon |
| `web/public/manifest.json` | PWA-installable metadata (light) |
| `web/public/sitemap.xml` | Single canonical URL for the SPA |
| `web/public/robots.txt` | Crawler policy + sitemap pointer |
| `web/scripts/build-og-image.mjs` | Playwright-based PNG generator (run on every `npm run build`) |
| `web/src/components/ui/NewsletterForm.tsx` | Opt-in email capture (license-safe by design) |
| `web/src/components/SiteFooter.tsx` | Hosts the newsletter form |

Last regenerated: `npm run build:og`.
