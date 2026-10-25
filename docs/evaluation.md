# Clearlease evaluation

How well does Clearlease separate rental scams from legitimate listings, and does it beat a plain keyword scanner? This page records every run so the numbers can be checked and reproduced.

## Dataset (`scripts/eval/dataset.jsonl`)
- **47 items:** 22 rental scams, 20 legitimate listings and 5 lease excerpts with known problem clauses (one is a clean control).
- **Sources.** Every item has a `source` field.
  - 3 scams are **reconstructions** of real, publicly reported cases: a University of Illinois police report of a Facebook sublet Zelle scam, a CBS Detroit report of a Zelle sublease where the "landlord" offered to mail the keys, and a WDBJ7 report of a Roanoke-area renter who toured a house and still lost $4,700 over Zelle. None of those sources publishes the listing text, so we wrote listings that match the facts each report describes. The `note` field says so.
  - The other 44 items are **synthetic**, written by us during the hackathon. They are not real listings.
- **Hard cases on purpose:**
  - Paraphrased scams that avoid the obvious words (Zelle "to hold it", "mission trip", "my agent will mail the keys", self-tour access codes, lease takeovers).
  - A scam where the renter *did* tour the unit (reconstruction of the WDBJ7 case).
  - Legitimately cheap listings: rooms in shared houses, older units, income-restricted (LIHTC, Section 8, inclusionary-zoning) units and approved summer sublets.
  - Legitimate listings with scam-like words: an out-of-state owner with a local manager, "units go fast", Venmo for splitting utilities, and a tenant relocating for work.
- **Holdout:** 10 listings (5 scams, 5 legitimate) were marked `holdout: true` when the dataset was written, before any run. Their results are saved unread to `scripts/eval/results/<run>-holdout.json` and only reported in the final "after" run. Caveat: the same team wrote the holdout and the development items, so it guards against tuning to specific items, not against our own blind spots.
- **No tuning to the dataset.** Prompts and rules were not changed to fix specific dataset items. Changes between runs come from the product decisions listed in each run.

## Method (`scripts/eval/run.mjs`)
- Each item's text goes to `POST /api/check` on a local server with live Gemma 4 (`gemma-4-26b-a4b-it`) and live HUD/Census data, one at a time, 1.5 s apart. Local runs raise the rate limit (`RATE_LIMIT_PER_MIN=1000 npm run dev`); the deployed service keeps its limit.
- **A positive** is a scam verdict. We report two thresholds: "Likely scam" only, and any red flag ("Some red flags" or "Likely scam").
- **Keyword baseline:** flags a listing if any of 33 scam keywords appears (wire, Zelle, Venmo, gift card, overseas, mail the keys, WhatsApp, SSN and so on). No model, no rules, no price data. It's the "just grep for Zelle" approach.
- **Precision** = scams among the listings flagged. **Recall** = share of scams flagged. **False alarms** = legitimate listings flagged.
- **Leases:** recall of the expected clause conflicts (by clause type), plus any unexpected conflicts.
- The eval scores only the text path. Photo reading is covered by the lease-photo sample in `scripts/e2e.mjs`.

Reproduce:
```bash
RATE_LIMIT_PER_MIN=1000 npm run dev            # terminal 1
node scripts/eval/run.mjs before                # terminal 2; add --holdout to print the holdout too
```

## Runs
### Run "before" (2026-10-25T02:33Z, http://localhost:3000)

**Development set** (17 scam / 15 legit; errors: 0)

| System | Precision | Recall | False alarms on legit listings |
|---|---|---|---|
| Clearlease: "Likely scam" | 100% | 94% | 0 of 15 |
| Clearlease: any red flag (Some or Likely) | 77% | 100% | 5 of 15 |
| Keyword baseline: any keyword | 94% | 100% | 1 of 15 |

Legit listings priced "far below" (would read "Suspiciously cheap"): l01, l03, l12, l18.
Missed scams (no red flag): none. False alarms: l01 (priceFarBelow); l03 (priceFarBelow); l11 (pressure); l12 (priceFarBelow, riskyPayment); l18 (priceFarBelow).

Clause-conflict recall: 7 of 9. Unexpected conflicts: 0.

| Lease | Expected conflicts | Found conflicts |
|---|---|---|
| x01 | security_deposit, landlord_entry, waiver_of_rights | landlord_entry, waiver_of_rights |
| x02 | landlord_entry, attorney_fees | landlord_entry, attorney_fees |
| x03 | security_deposit, late_fee | security_deposit, late_fee |
| x04 | late_fee, repairs_on_tenant | late_fee |
| x05 | none | none |

Modes: live. Median latency: 11.7 s.

Holdout: 10 items run and saved unread to scripts/eval/results/before-holdout.json.

What "before" tells us:
- The keyword baseline is strong on this set: one keyword hit catches every scam, and it raised only one false alarm (l12, Venmo for splitting utilities). Most scams in the wild do mention a payment app or an absent owner.
- Clearlease's "Likely scam" verdict never fired on a legitimate listing (100% precision), but missed one scam at that threshold.
- Clearlease's softer "Some red flags" tier is where the false alarms live: 4 of the 5 come from price alone (a shared room, a LIHTC unit, a room share and an inclusionary-zoning unit), and one from "units go fast". Cheap rent alone being treated as a scam sign is the bias step 2 fixes.
- Lease reading missed the $3,000 deposit (3× rent, Virginia caps at 2×) in x01 and the "tenant pays all repairs" clause in x04.
