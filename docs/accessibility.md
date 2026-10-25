# Accessibility audit

Last run: Sat Oct 24 2026, about 11:30 PM ET, against a **production build** (`npm run build`, then `PORT=3100 npm start`), Chrome via `playwright-core`.
Reproduce: `node scripts/a11y.mjs http://localhost:3100` (exits 1 on any axe violation or uncaught page error).

## What the script checks
- **axe-core 4.14** with the WCAG 2.0, 2.1 and 2.2 A/AA rule sets plus axe best practices.
- **8 scans:** the landing page and three finished reports (Blacksburg sublet, lease photo, hidden-AI-instructions listing), at **1280 px** and **375 px**, with every `<details>` drawer opened so hidden content is scanned too. Reduced motion is on so the stamp animation doesn't interfere.
- **Contrast of every color token pair**, read from the live CSS and computed with the WCAG 2.x relative-luminance formula.
- **No uncaught page errors** while clicking text → photo → text samples (see "Regression" below).

## Results
- desktop 1280, landing: 0 violations, 43 rules passed, 1 need review
- desktop 1280, report: Blacksburg summer sublet (all drawers open): 0 violations, 47 rules passed, 1 need review
- desktop 1280, report: Photo of a lease page (all drawers open): 0 violations, 49 rules passed, 1 need review
- desktop 1280, report: Hidden AI instructions (all drawers open): 0 violations, 46 rules passed, 1 need review
- phone 375, landing: 0 violations, 44 rules passed, 1 need review
- phone 375, report: Blacksburg summer sublet (all drawers open): 0 violations, 48 rules passed, 1 need review
- phone 375, report: Photo of a lease page (all drawers open): 0 violations, 49 rules passed, 1 need review
- phone 375, report: Hidden AI instructions (all drawers open): 0 violations, 47 rules passed, 1 need review
- PASS: 0 axe violations
- PASS: 0 uncaught page errors (text → photo → text)

**axe "needs review" item, resolved by measuring.** On every page axe marked one element for manual contrast review, "background could not be determined": the main listing `<textarea>`. Nothing overlaps it (checked with `elementFromPoint` at three points); axe can't resolve the background of a resizable form field. Measured in the browser:
- Typed text `#17202a` on the field's `#ffffff`: **16.45:1** (AA needs 4.5:1).
- Placeholder text `#4a5664` on `#ffffff`: **7.48:1**.
- The field's border `#4a5664`: **7.48:1** against the white field and **6.60:1** against the `#eef1f4` page (WCAG 1.4.11 needs 3:1 for a control's boundary).

On phone width axe also flagged one highlighted quote (`<mark>`) that wraps across lines. Its colors are ink `#17202a` on `#dfe7fb`: **13.29:1**.

### Contrast, measured from the CSS tokens
| Foreground | Background | Used for | Ratio | WCAG AA |
| ink #17202a | sheet #fff | body text | 16.45:1 | pass (needs 4.5:1) |
| ink #17202a | paper #eef1f4 | body text on page background | 14.51:1 | pass (needs 4.5:1) |
| ink-soft #4a5664 | sheet #fff | secondary text | 7.48:1 | pass (needs 4.5:1) |
| ink-soft #4a5664 | paper #eef1f4 | secondary text on page background | 6.60:1 | pass (needs 4.5:1) |
| pen #1e4bb8 | sheet #fff | links and buttons | 7.63:1 | pass (needs 4.5:1) |
| sheet #fff | pen #1e4bb8 | white text on blue button | 7.63:1 | pass (needs 4.5:1) |
| ink #17202a | pen-tint #dfe7fb | highlighted quotes | 13.29:1 | pass (needs 4.5:1) |
| ok #1b6a47 | sheet #fff | Typical / No red flags | 6.56:1 | pass (needs 4.5:1) |
| warn #8a4b00 | sheet #fff | Below range / Some red flags | 6.80:1 | pass (needs 4.5:1) |
| stop #ae2318 | sheet #fff | Likely scam / Fix before signing | 6.88:1 | pass (needs 4.5:1) |
| ok #1b6a47 | ok-tint #e6f2eb | green note | 5.71:1 | pass (needs 4.5:1) |
| warn #8a4b00 | warn-tint #faeedc | amber note | 5.94:1 | pass (needs 4.5:1) |
| stop #ae2318 | stop-tint #fbe8e5 | red note | 5.82:1 | pass (needs 4.5:1) |
| nil #4a5664 | nil-tint #eef1f4 | Not run | 6.60:1 | pass (needs 4.5:1) |
| rule #c5ced8 | sheet #fff | decorative dividers and card outlines (no WCAG minimum) | 1.59:1 | n/a (decorative) |
| ink-soft #4a5664 | sheet #fff | form-field borders (non-text, 3:1 needed) | 7.48:1 | pass (needs 3:1) |

The lowest text pair is **5.71:1** (green text on its tint). The only pair under 3:1 is `rule` (`#c5ced8`, 1.59:1). It's used only for decorative dividers and card outlines. Every form control (textarea, ZIP field, edit fields, upload button) uses the `ink-soft` border at 6.60–7.48:1, so WCAG 1.4.11 is met where it applies.

## Regression: the map crash (fixed Oct 24)
The audit found a production-only crash: run a text sample, then the lease-photo sample, and the page showed Next.js's error screen with `TypeError: Cannot read properties of undefined (reading 'then')`. Cause: once Google Maps rejects the key (here, a referrer the key doesn't allow), `Geocoder.geocode()` returns `undefined` instead of a promise, and `components/ListingMap.tsx` called `.then` on it. The deployed site wasn't affected because its referrer is allowed, but any key misconfiguration would have taken down the whole report.
- **Fix:** `lib/client/geocode.ts` (`geocodeZip`) never throws or rejects. Any non-answer becomes "The map couldn't load for this ZIP code."
- **Unit test:** `lib/client/__tests__/geocode.test.ts` covers `undefined`, a synchronous throw, a rejection and empty answers. Run against the old logic, it fails with the exact production error. With the fix it passes.
- **Browser check:** `scripts/a11y.mjs` fails on any uncaught page error during the text → photo → text sequence.

## Spanish mode
`node scripts/a11y.mjs http://localhost:3000 --lang=es` switches to Español first, then runs the same 8 scans: **0 violations**, 0 uncaught page errors (Oct 25, about 12:50 AM, dev server). The toggle is two real buttons in a labelled group with `aria-pressed`, each with its own `lang`, and the page's `<html lang>` switches to `es` so screen readers change voice.

## Known issue: Google Maps error after the key is rejected
When Google rejects the Maps key (seen only on a port the key doesn't allow, e.g. `localhost:3100`), running a lease photo and then the Blacksburg sample logs an uncaught `IntersectionObserver` error from inside Google's map script. The page keeps working (no error screen). It hasn't appeared on the dev server (allowed referrer) or in any e2e run. Two fix attempts didn't remove it; options are in PLAN.md.

## Manual checks
Automated tools catch only part of what matters, so a person also did a keyboard-only and VoiceOver walkthrough. Results are below: 12 of 12 checks pass (K1 after a re-check).

## Manual checklist results
Run by Ashwin on Sat Oct 24, about 11:55 PM ET, on a MacBook with Safari/Chrome and VoiceOver (Cmd+F5), against `http://localhost:3000` (dev server).

| # | Check | Result |
|---|---|---|
| K1 | First Tab lands on a visible "Skip to…" link | **Pass, after re-check.** In the manual run the first Tab skipped the link, but the URL was `localhost:3000/#main` (so the browser started tabbing from the `#main` target, after the link) and the Next.js dev-tools button was on screen. Re-checked by script on a clean load of the production build (no `#main`, no dev overlay): the first Tab lands on "Skip to the checker", visible, with a 3 px solid focus outline, at 1280 px and 375 px. Not a product issue; no change made. |
| K2 | Tab order through the form, focus always visible | Pass |
| K3 | Running a sample moves focus to "Your pre-sign report" | Pass |
| K4 | Evidence and quote drawers open and close with Enter/Space | Pass |
| K5 | Edit facts, save, Escape closes the editor with sensible focus | Pass |
| K6 | Lease-photo sample fully usable by keyboard, no traps | Pass |
| V1 | "Report ready" summary of all three verdicts is announced | Pass |
| V2 | Headings rotor lists sections in a sensible order | Pass |
| V3 | Scam flags say "(strong warning sign)" or "(warning sign)" | Pass |
| V4 | "Quote start" and "quote end" around highlighted quotes are clear | Pass |
| V5 | Map is one item ("Approximate area…"), no trap in map controls | Pass: read as one item; Tab moves past it |
| V6 | Empty submit: error is read and focus goes to the text box | Pass |
