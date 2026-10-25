# Clearlease design principles

`ux-critic` and all UI work follow this file (from docs/process/KICKOFF_PROMPT.md §4b).

## Direction
- Ground the look in the subject: leases, listings, inspection reports, a building super's clipboard. It should feel like a trustworthy, plain-spoken tool a tenant advocate would hand you. Not a SaaS landing page.
- Be bold in ONE place: the verdict moment, where the three verdicts land. Keep everything else quiet and disciplined.
- Verdict states never rely on color alone. Each one uses an icon, a word and a color.

## Avoid (generated-look tells)
- Warm cream background + serif + terracotta accent
- Near-black + one acid accent
- Identical rounded cards with the same soft shadow
- Gradient washes
- ALL-CAPS tracked eyebrow labels
- "A · B · C" meta strings
- Arrows appended to buttons
- Fade-up animation on every section
- One accented word in a headline

## Copy
- Plain verbs, sentence case, written for a stressed renter.
- Buttons say exactly what happens ("Check this listing").
- Errors say what happened and what to do next.
- The empty state invites the first action and offers the three sample inputs.

## Quality floor
- Responsive down to 375px with no horizontal scroll. Image upload from the camera roll works.
- Visible keyboard focus, reduced motion respected, contrast ≥ 4.5:1.
- Before every UI STOP, take Playwright screenshots at 375px and 1280px and critique them.

## Token plan (v1, Sat Oct 24)

**Concept: a housing inspection report.** The input side looks like an intake form. The result looks like one printed report sheet with three numbered sections. Each section ends in an inspector's ink stamp. The stamp is the single bold moment; everything else is quiet form ruling.

### Colors
| Token | Hex | Role | Contrast |
|---|---|---|---|
| `paper` | `#EEF1F4` | Page background, cool carbon-copy gray (not cream) | — |
| `sheet` | `#FFFFFF` | Report sheet and inputs | — |
| `ink` | `#17202A` | Body text, headings | 16.5:1 on sheet, 14.5:1 on paper |
| `ink-soft` | `#4A5664` | Secondary text, labels | 7.5:1 on sheet, 6.6:1 on paper |
| `pen` | `#1E4BB8` | Ballpoint blue: primary button, links, focus ring | 7.6:1 on sheet; white on pen 7.6:1 |
| `rule` | `#C5CED8` | Hairlines and form rules (decorative, not text) | — |

Verdict inks (stamp border, icon and word; each pairs with an icon and a word, never color alone):
| Token | Ink | Tint | Ink on tint |
|---|---|---|---|
| `ok` | `#1B6A47` | `#E6F2EB` | 5.7:1 |
| `warn` | `#8A4B00` | `#FAEEDC` | 5.9:1 |
| `stop` | `#AE2318` | `#FBE8E5` | 5.8:1 |
| `none` | `#4A5664` | `#EEF1F4` | 6.6:1 |

Contrast values computed with the WCAG 2.x relative-luminance formula (node one-liner, Oct 24).

### Type
- **Public Sans** (the US Web Design System's typeface, free on Google Fonts) for all UI. It's civic, plain and legible, the voice of a public-service form rather than a startup. Weights 400, 600 and 800.
- **IBM Plex Mono** for anything quoted from the user's input or read from data (rents, citations). It looks like a typed carbon copy, so "this is evidence" reads at a glance.
- Scale (px): 13 (fine print, mono) / 15 (labels) / 16 (body) / 19 (section titles) / 24 (stamp word) / 32→44 (h1, mobile→desktop). Line height 1.5 for body, 1.15 for headings. Sentence case everywhere.

### Layout
Mobile (375):
```
Clearlease                       for DC, MD, VA renters
Check a rental before you send money.
short sub-line
┌ Listing or lease text ─────────────┐
│ textarea (6 rows)                  │
└────────────────────────────────────┘
[ Add a photo ]  thumb + Remove
ZIP code (optional) [_____]
[        Check this listing        ]
We don't save anything. What we send ▸
Or try a sample
 1  Arlington 1-bedroom, looks fine
 2  Facebook deal that's too good
 3  Photo of a lease page
 4  Listing with hidden AI instructions
════════ REPORT (sheet) ════════
We read: Rent $1,650 a month  Size 1-bedroom  ZIP 22201   [Edit]
─────────────────────────────────
1  Price check            ┌───────────┐
   25% below HUD's…       │ ✕ Below   │  stamp (rotated −2°)
   detail                 └───────────┘
   ▸ Show evidence (3)
─────────────────────────────────
2  Scam risk               [stamp]
   7 of 9 checks flagged
   • Wants payment by wire…  "wire the $1,650…" (mono)
─────────────────────────────────
3  Lease clauses           [stamp]
─────────────────────────────────
Questions to ask before you sign (numbered)
Not legal advice. Get help: links
```
Desktop (1280): two columns. The left column (400px) is the sticky intake form and samples. The right column is the report sheet (max 760px) with a numbered left gutter (section numbers in large mono). The empty state shows the sheet as an outline, with the three section names and what each one checks.

### Review: defaults we rejected
- Cream background + serif: rejected. We use cool carbon gray with a civic grotesk, and the serif appears only *inside* the lease sample image.
- Three identical rounded cards: rejected. It's one sheet with ruled sections, square corners (2px max) and no drop shadows.
- An acid accent on near-black: rejected. Ballpoint blue on white, like filling in a form.
- Gradient hero / fade-up on everything: rejected. The only motion is the stamp landing (scale 1.12 → 1 over 160ms, staggered), and it's off under `prefers-reduced-motion`.
- "A · B · C" meta strings: rejected. The facts bar is a labelled definition list.
- ALL-CAPS eyebrows: rejected. Section labels are numbered, in sentence case.

## Design pass 2 (Sat Oct 24, evening)

**Problems in v1:**
- The bold moment was split across a small text strip at the top and a stamp inside each section, about 850px down on a phone.
- Template tells crept in: big mono gutter numerals (1/2/3), numbered samples that aren't a sequence, mono for data labels in the facts bar, and hairline rules between everything.
- The lease section repeated a red badge on every clause.

**v2 plan:**
- **One verdict board, the single bold element.** The top of the report becomes an inspection slip with three inked stamps: Price, Scam risk, Lease. Each stamp is large (24 → 30px, weight 900) with a double-ring border like a real rubber stamp. The ink edge is roughened with an SVG turbulence filter on the *border only*, so the text stays crisp. Each stamp sits at its own slight angle (−2.5°, 1.5°, −1°), as if stamped by hand. They land one after another (scale 1.16 → 1 with a brief ink "press" shadow). Each stamp links to its section. On a phone they stack and are the first thing the report shows.
- **Sections go quiet.** Each section has a title and a small tone tag (icon + word in the tone color, no border). The big numerals and per-section stamps are gone.
- **Lease clauses are grouped by what to do:** "Fix before signing", "Ask about", "Looks standard". Each group has a count, so the badge doesn't repeat on every clause. Grouping is information, not decoration.
- **Mono only for evidence:** words quoted from the renter's input, plus the model ID. Figures use Public Sans with tabular numbers.
- **Fewer rules:** spacing separates items; rules separate only the three sections and the questions.
- **Samples:** no numbers (they're a choice, not a sequence). The empty state lists the three checks as plain text, not a numbered list.
- **Mobile:** the textarea is 5 rows below `sm`, so "Check this listing" stays near the first screen. The report header is compact.

**Review: did v2 drift into a default?**
- "Rotated rubber stamp" could become a gimmick if it's used everywhere. That's why it appears in exactly one place, carries real information (all three verdicts), and works as navigation.
- The double ring and rough ink edge are specific to this subject (a leasing office's approval stamp, an inspector's mark). They aren't a generic badge.

## Dark theme (Sun Oct 25, overnight)

**Concept: carbon paper at night.** Same report, re-inked. Graphite paper and sheet, chalk-white ink, a lighter ballpoint blue, and verdict inks lifted to stay legible on their tints.

**Rejected defaults:**
- Near-black with one acid accent (banned above): the paper is a cool graphite (`#161b22`), not `#000`/`#0b0b0b`.
- All three verdict colors survive, so severity still reads as icon + word + color.

**Behaviour:**
- It follows the system setting (`prefers-color-scheme`) until the reader picks Light or Dark. The header switch is two real buttons with `aria-pressed` and their names in the accessible label.
- The choice is saved in `localStorage` (try/catch; it still works for the tab when storage is blocked).
- A tiny inline script (`lib/client/theme-init.ts`) sets `<html data-theme>` before first paint, so there's no flash.
- `color-scheme` matches, so form controls and scrollbars follow.
- The Google map uses its own `colorScheme="DARK"`.
- Photos and sample images are never inverted.
- Filled buttons use `text-sheet` instead of `text-white`, so their text flips with the theme.

**Tokens and measured contrast** (from the live CSS by `node scripts/a11y.mjs <url> --theme=dark`, WCAG 2.x):

| Token | Dark value | Pair | Ratio |
|---|---|---|---|
| `paper` | `#161b22` | ink on paper | 14.45:1 |
| `sheet` | `#1f252e` | ink on sheet | 12.87:1 |
| `ink` | `#e7ebf0` | ink on pen-tint (highlighted quotes) | 9.42:1 |
| `ink-soft` | `#a9b4c1` | on sheet / on paper | 7.33:1 / 8.23:1 |
| `pen` | `#93b4ff` | on sheet (links); sheet on pen (filled buttons) | 7.50:1 / 7.50:1 |
| `pen-dark` (hover) | `#bccfff` | on sheet | 9.91:1 |
| `pen-tint` | `#2b3a5c` | background for highlights | n/a |
| `rule` | `#3b4553` | decorative only | 1.59:1 (no minimum) |
| `ok` / `ok-tint` | `#7dd3a8` / `#1c3a2c` | ok on sheet; ok on its tint | 8.63:1 / 6.95:1 |
| `warn` / `warn-tint` | `#f0b85f` / `#3e2f15` | warn on sheet; on its tint | 8.61:1 / 7.23:1 |
| `stop` / `stop-tint` | `#ff8f80` / `#47211c` | stop on sheet; on its tint | 6.97:1 / 6.32:1 |
| `nil` / `nil-tint` | `#a9b4c1` / `#2a313b` | nil on its tint | 6.24:1 |

- Lowest text pair: 6.24:1. Form-field borders (ink-soft on sheet) are 7.33:1, against the 3:1 non-text minimum.
- axe-core: 0 violations in dark and light, English and Spanish, at 375 and 1280 px (landing plus three reports, all drawers open).
- Screenshots: `docs/screenshots/dark/`.
