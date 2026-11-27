# Mirror Academy: design notes

Notes for whoever touches the site next, so a later pass builds on these choices instead of
drifting back to a template.

## Subject

A coaching institute in Berhampore preparing students for WBPSC/WBCS, police, medical and
engineering entrance, and teaching exams. Most visitors are students on phones. The site has one
job: get a registration or a call.

## One look, two places

The public site shares its design with the **Mirror Academy Admissions Page** (the shareable
one-pager). The owner liked that Page's theme, font, cards and overall feel, so the site now uses
the same kit. Change the kit in one place and keep both in step.

- `src/app/kit.css`: the shared kit (tokens, nav, hero, callout, stats, section heads, cards,
  steps, footer). Imported into Tailwind's `components` layer, so utilities still win.
- `src/app/globals.css`: site components built on the kit's tokens (filter chips, tabs, course
  rows, form fields, batch choices, registration panel, map card).
- The admin portal (`/admin`) uses the same kit and theme toggle (`src/components/ThemeToggle.tsx`): a sign-in card,
  a glass pill bar, stats, a filter panel, the registrations table (rows become cards on phones), and a detail sheet.
  Its classes start with `adm-` in `globals.css`.

## Tokens

Neutral, Apple-like greys that switch with the visitor's light or dark setting (`light-dark()`),
plus a toggle in the nav that remembers the choice (`localStorage` key `ma-theme`).

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--fill-primary-on` | `#F5F5F7` | `#1D1D1F` | Page background |
| `--fill-primary` | `#1D1D1F` | `#F5F5F7` | Primary capsule, active chip and tab |
| `--fill-tertiary` | `#E8E8EA` | `#2A2A2D` | Cards and panels |
| `--text-secondary` | `#636366` | `#A1A1A6` | Supporting text |
| `--hero-surface` | `#161F39` | same | The hero's deep navy, always light text |
| `--fill-system-green` | `#00A665` | same | Picked course, "application received" |

Brand navy and gold live in the logo; the UI stays neutral so the logo carries the colour.
Radii: 12 / 16 / 24 / 32px and pill. Breakpoints: 600, 761, 900px.

## Type

Geist for everything, Geist Mono for registration IDs. One size scale from the kit
(caption 12, small 14, body 15, heading 20, title 26–32, display 34–48), every style at 130%
line height. Medium (500) for headings, never heavier than 600.

## Layout of the home page

Glass pill nav (logo, section tabs with the one in view marked, call capsule, theme toggle) →
navy hero with logo, eyebrow, tagline and an "Admissions open" callout → stats row → Courses
(stream filter chips, one card per stream, each course a row that pre-fills registration) →
Why us (three cards) → How admission works (numbered steps) → Register (tabs for register /
check my registration, beside an "After you register" callout) → Contact (three cards, the
Google Maps embed in a card, closing callout) → footer with section chips and the admin link.

## Principles

- Content comes from `src/lib/constants.ts`; nothing is invented.
- `src/app/api/enquiry/route.ts` is never changed by design work.
- Only the admission steps are numbered, because only they are a sequence.
- One primary capsule per screen; everything else is a quiet bordered button or a link.
- Touch targets at least 44px on phones; inputs at 16px so iOS does not zoom.
- No gradient blobs, glows or decorative motion. Reduced motion is respected.

## Pending owner input

- Admission steps 2 and 3 wording, and the "Enquiry-led admission" point (marked TODO in code).
- Cloudflare Turnstile is not wired up on the client yet.

## Hero (2026-11-24, final)
- Back to the kit hero (`.hero.hero--site`, flat navy surface, glass "Admissions open" callout top-right), as the user asked.
- Branding is bigger: round logo (`public/brand/logo-round.webp`, 112-160px, white + gold ring) beside the h1 "Mirror Academy" (Academy in gold #FFC501). The tagline is a large subheading. No glow.
- On phones the logo and name stack, and the callout is full width (Register spans it; Call and WhatsApp share a row).
- Course stream chips filter client-side via history.replaceState.

## Part A upgrade (2026-11-25)
- Course rows carry an optional `about` line (constants.ts) naming the exam and its conducting body; left blank where unsure (FOOD, mock interviews).
- FAQ section (`Faq.tsx`) before Contact, native `<details>` in one card; answers only restate what the site already says. Added to nav.
- Phones (≤760px) get a fixed glass action bar (`MobileActionBar.tsx`): Register, Call, WhatsApp.
- SEO: EducationalOrganization JSON-LD on the home page, `sitemap.ts`, `robots.ts` (disallows /admin and /api), brand icon/favicon from the round logo, canonical and en_IN OG locale.
- Removed the Next.js starter SVGs.

## Follow-up, slip, duplicates, Turnstile (2026-11-26)
- Admin detail sheet has Team notes + Follow up on date (`AdminFollowUp.tsx`, columns `admin_notes`, `follow_up_date`, migration 003). Table shows "Follow up <date>" (orange when due). Filters: Any day / Registered today / Follow-up due; sort Newest/Oldest. Stats add New today and Follow-ups due.
- Duplicate check: same phone + course, not cancelled → 409 `duplicate: true`; the form offers Check my registration or Register again anyway (`allowDuplicate`).
- Registration slip: PNG drawn on canvas (`src/lib/slip.ts`), from the success screen and each lookup result.
- Turnstile: `Turnstile.tsx` renders when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; the API refuses missing or failed tokens whenever `TURNSTILE_SECRET_KEY` is set, and fails closed if Cloudflare is unreachable.

## Notice board (2026-11-27)
- `NoticeBoard.tsx` (server component, streamed in `<Suspense>` after `connection()`) sits right after the hero. Anyone can read it; no sign-in. Pinned first, then newest, up to 12. "New" chip for 7 days.
- Data: `notices` table + public `notices` storage bucket (migration 004). Public read via RLS (`published = true`); all writes go through `/api/admin/notices` with the service role.
- Admin: Notices tab in /admin (`AdminNotices.tsx`): post title, text, optional link, optional PDF/JPG/PNG/WebP up to 4 MB; pin, hide/show, delete (deletes the file too).
- If the table can't be read (migration not run yet), the board falls back to `FALLBACK_NOTICES` in `src/lib/notices.ts`. Migration 004 also seeds the first notice: WBPSC Clerkship Part-I, 26 and 27 Dec 2026, admit cards from 14 Dec, pinned.
- Class prefix `nb-` (the older `.notice` class is the form alert box).
