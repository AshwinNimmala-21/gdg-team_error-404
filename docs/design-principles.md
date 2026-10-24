# Clearlease design principles

`ux-critic` and all UI work follow this file (from KICKOFF_PROMPT.md §4b).

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
