# Clearlease evaluation

How well does Clearlease separate rental scams from legitimate listings, and does it beat a plain keyword scanner? This page records every run so the numbers can be checked and reproduced.

## Dataset (`scripts/eval/dataset.jsonl`)
- **50 items:** 22 rental scams, 20 legitimate listings and 8 lease excerpts with known problem clauses (5 from the start, one a clean control; 3 added after the lease fix, see below).
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

## Hard set (`scripts/eval/hard.jsonl`), added after the first run
The easy set turned out to be too easy and partly circular: the same author wrote the items and the baseline's keywords, and a keyword scan nearly matched Clearlease. So:
- **The baseline was frozen first.** Its 33 keywords live in `scripts/eval/baseline-keywords.json` and are never edited.
- **24 hard items** (15 scams, 9 legitimate), each with a `category` and `source`, based on documented scam behavior:
  - `payment-obfuscated` (5): "send it through the app, I'll text you the name", a CashApp $tag, "PP F&F" (PayPal tells buyers to refuse Friends and Family for purchases and excludes rental property from Buyer Protection), Apple Cash, "my roommate will send you a request".
  - `obfuscated-spelling` (3): "Z.e.l.l.e", "0verseas", "keyz", "W.U.", "w!re", "Gift crds".
  - `spanish` (3): Spanish-language scams built from the FTC's red flags.
  - `legit-negation` (7): legitimate listings with anti-scam disclaimers ("we never accept wire transfers, Zelle, Venmo…", "not overseas", "nobody here will ask you to Zelle"), including one in Spanish.
  - `screenshot` (6): the text is only inside an image (chat or group-post screenshots rendered by `scripts/eval/render-hard-images.mjs`, generic styling, no real site's branding). The baseline gets no text for these, just as grep can't read a picture.
- **Honest limits:** the same person (with Claude Code) wrote these items, knowing how both systems work, and chose categories that target known keyword weaknesses. Treat this set as a stress test of the failure modes we care about, not a random sample of real listings. Sources are cited per item; all 24 items are synthetic.

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


### Run "before", hard set (2026-10-25T02:45Z, http://localhost:3000)

**Hard set** (15 scam / 9 legit; errors: 0)

| System | Precision | Recall | False alarms on legit listings |
|---|---|---|---|
| Clearlease: "Likely scam" | 100% | 100% | 0 of 9 |
| Clearlease: any red flag (Some or Likely) | 94% | 100% | 1 of 9 |
| Keyword baseline: any keyword | 25% | 13% | 6 of 9 |

Legit listings priced "far below" (would read "Suspiciously cheap"): h23.
Missed scams (no red flag): none. False alarms: h23 (priceFarBelow).

Modes: live. Median latency: 11.7 s.

| Category | Items | Clearlease correct (any red flag = scam) | Baseline correct (any keyword = scam) |
|---|---|---|---|
| payment-obfuscated | 5 | 5 | 0 |
| obfuscated-spelling | 3 | 3 | 1 |
| spanish | 3 | 3 | 1 |
| legit-negation | 7 | 7 | 1 |
| screenshot | 6 | 5 | 2 |

What the hard set tells us (reported as measured):
- **On this set the baseline does not match Clearlease.** Keywords catch 2 of 15 scams (13% recall) and raise 6 false alarms out of 9 legitimate listings (precision 25%): disclaimers like "we never accept Zelle" trip it, and paraphrased payment requests, misspellings, Spanish and screenshots slip past it.
- Clearlease caught all 15 scams at "Likely scam". Its one false alarm (h23, a $425 room in a shared Blacksburg house, shown in a screenshot) came from price alone, the same bias as in the easy set.
- Because of the limits above, the fair summary is: on ordinary listings a keyword scan is a strong baseline; Clearlease's advantage shows on paraphrase, negation, other languages and images.


## Student-market set (`scripts/eval/student.jsonl`), added Oct 24 for per-bedroom pricing and sublets
8 synthetic items: per-bedroom and per-person student rentals (Blacksburg, Arlington, Baltimore), two legitimate sublets or short-term rentals, and two scams priced per bedroom or per person. "Before" ran on the code before this change, "after" on the code with it. (Before step 2, a "far below" price read "Suspiciously cheap" on its own; here "before" already includes step 2.)

| Item | What it is | Label | Price verdict: before | after per-bedroom compare | after "far below only" (current) | Sublet line (current) | Scam verdict (current) |
|---|---|---|---|---|---|---|---|
| st01 | per-bedroom | legit | Below usual range: verify before paying | Above usual range | Rough comparison | no | none_found |
| st02 | per-person | legit | Below usual range: verify before paying | Above usual range | Rough comparison | no | none_found |
| st03 | per-bedroom | legit | Below usual range: verify before paying | Typical | Rough comparison | no | none_found |
| st04 | summer-sublet | legit | Below usual range: verify before paying | Below usual range: verify before paying | Below usual range: verify before paying | yes | none_found |
| st05 | short-term | legit | Below usual range: verify before paying | Below usual range: verify before paying | Below usual range: verify before paying | yes | none_found |
| st06 | per-bedroom | scam | Not enough info | Suspiciously cheap | Suspiciously cheap | yes | likely |
| st07 | per-person | scam | Suspiciously cheap | Suspiciously cheap | Suspiciously cheap | no | likely |
| st08 | per-bedroom | legit | Below usual range: verify before paying | Typical | Rough comparison | no | none_found |

What changed:
- **Per-bedroom and per-person rent** (st01–st03, st08) is compared with the whole unit's benchmark divided by its bedroom count, labelled in the report as an approximation. None of the legitimate ones reads "far below" any more.
- **First version, then revised.** The first version also checked the "above" direction, and two Blacksburg student rentals ($650 per bedroom, $575 per person) read "Above usual range": the usual range for one bedroom's share of a Blacksburg 4-bedroom is $438–$512 (Census median ÷ 4 to HUD FMR ÷ 4). Area averages divided by bedrooms understate near-campus student rents, so that verdict wasn't trustworthy. Now per-bedroom and per-person prices are only checked in the "far below" direction. Otherwise the report shows a neutral **Rough comparison** with: "Rough comparison only: per-bedroom rents near campus often run above an even split of area averages. Compare 2–3 nearby listings and ask what's included."
- **Sublets and short-term rentals** (st04, st05) now carry "Summer sublets often list below market; price alone isn't a red flag here." Neither escalates.
- **Scams priced per bedroom or per person** (st06, st07) still read "Likely scam" from their non-price signs.

## Lease fix, motivated by the "before" misses (Oct 25, about 12:30 AM)
Run "before" found two lease misses: x01's $3,000 deposit on $1,000 rent (3×, over Virginia's 2-month cap) and x04's "Tenant is responsible for all repairs … regardless of cause". **Those misses motivated this fix.** We fixed the causes in general, not those items:
- **Deposit stated as a fact.** Gemma had read the deposit and the rent correctly, but as listing facts, not as a lease clause, and the cap check only looked at clauses. Now, in a lease, a deposit amount whose quote is verified is checked against the state cap even when no deposit clause was extracted.
- **Blanket repair clauses.** A clause putting *all* repairs on the tenant, whatever the cause, is now a conflict in Virginia and DC. A clause making the tenant pay for damage they cause stays an "ask".
- **Caps and statutes checked against official sources before coding:**
  - Virginia: deposit cap 2 months' rent, Va. Code § 55.1-1226(A). Repairs: § 55.1-1220(A)(2) and (4) (landlord makes all repairs and maintains electrical, plumbing and heating), § 55.1-1208(C) (no repair or maintenance fees unless the tenant caused it). § 55.1-1220(D) allows a written good-faith agreement for specified repairs, which is why only blanket clauses conflict. Source: law.lis.virginia.gov.
  - Maryland: deposit cap **1 month's rent**, Md. Code, Real Prop. § 8-203(b)(1), with a narrow 2-month exception for tenants on utility assistance (§ 8-203(b)(2)). Source: mgaleg.maryland.gov. No Maryland statute was found that voids a repair-shifting clause (§ 8-211 is rent escrow), so in Maryland a blanket repair clause stays an "ask".
  - DC: deposit cap 1 month's rent, 14 DCMR § 308.2, as cited by the DC Rental Housing Commission and the Office of the Tenant Advocate. The existing DC rule for maintenance waivers is unchanged.
- **Three new lease items** (x06 DC, x07 Maryland control, x08 Virginia) were written *after* the fix, to test it on text it wasn't built around.

Run "after-leasefix" (all 8 leases, live Gemma): **clause-conflict recall 13 of 13, 0 unexpected conflicts** (the original 5 were at 7 of 9 in "before").

| Lease | Expected conflicts | Found conflicts |
|---|---|---|
| x01 | security_deposit, landlord_entry, waiver_of_rights | landlord_entry, waiver_of_rights, security_deposit |
| x02 | landlord_entry, attorney_fees | landlord_entry, attorney_fees |
| x03 | security_deposit, late_fee | security_deposit, late_fee |
| x04 | late_fee, repairs_on_tenant | late_fee, repairs_on_tenant |
| x05 | none | none |
| x06 (new, DC) | security_deposit, landlord_entry | security_deposit, landlord_entry |
| x07 (new, MD control) | none | none |
| x08 (new, VA) | security_deposit, repairs_on_tenant | repairs_on_tenant, security_deposit |

Caveat: 8 leases written by us is a small set. It shows the fixes work on new wording, not that lease reading is solved.


### Run "after", easy set (2026-10-25T05:19Z, http://localhost:3000)

**Development set** (17 scam / 15 legit; errors: 0)

| System | Precision | Recall | False alarms on legit listings |
|---|---|---|---|
| Clearlease: "Likely scam" | 100% | 94% | 0 of 15 |
| Clearlease: any red flag (Some or Likely) | 89% | 100% | 2 of 15 |
| Keyword baseline: any keyword | 94% | 100% | 1 of 15 |

Legit listings labelled "Suspiciously cheap": none.
Missed scams (no red flag): none. False alarms: l11 (pressure); l12 (riskyPayment).

Clause-conflict recall: 13 of 13. Unexpected conflicts: 0.

| Lease | Expected conflicts | Found conflicts |
|---|---|---|
| x01 | security_deposit, landlord_entry, waiver_of_rights | landlord_entry, waiver_of_rights, security_deposit |
| x02 | landlord_entry, attorney_fees | landlord_entry, attorney_fees |
| x03 | security_deposit, late_fee | security_deposit, late_fee |
| x04 | late_fee, repairs_on_tenant | late_fee, repairs_on_tenant |
| x05 | none | none |
| x06 | security_deposit, landlord_entry | security_deposit, landlord_entry |
| x07 | none | none |
| x08 | security_deposit, repairs_on_tenant | repairs_on_tenant, security_deposit |

Modes: live. Median latency: 12.6 s.

**Holdout (never inspected while making changes)** (5 scam / 5 legit; errors: 0)

| System | Precision | Recall | False alarms on legit listings |
|---|---|---|---|
| Clearlease: "Likely scam" | 100% | 80% | 0 of 5 |
| Clearlease: any red flag (Some or Likely) | 83% | 100% | 1 of 5 |
| Keyword baseline: any keyword | 100% | 100% | 0 of 5 |

Legit listings labelled "Suspiciously cheap": none.
Missed scams (no red flag): none. False alarms: l10 (landlordAway).

### Run "after", hard set (2026-10-25T05:25Z, http://localhost:3000)

**Hard set** (15 scam / 9 legit; errors: 0)

| System | Precision | Recall | False alarms on legit listings |
|---|---|---|---|
| Clearlease: "Likely scam" | 100% | 100% | 0 of 9 |
| Clearlease: any red flag (Some or Likely) | 100% | 100% | 0 of 9 |
| Keyword baseline: any keyword | 25% | 13% | 6 of 9 |

Legit listings labelled "Suspiciously cheap": none.
Missed scams (no red flag): none. False alarms: none.

Modes: live. Median latency: 12.8 s.

| Category | Items | Clearlease correct (any red flag = scam) | Baseline correct (any keyword = scam) |
|---|---|---|---|
| payment-obfuscated | 5 | 5 | 0 |
| obfuscated-spelling | 3 | 3 | 1 |
| spanish | 3 | 3 | 1 |
| legit-negation | 7 | 7 | 1 |
| screenshot | 6 | 6 | 2 |

## Before and after (all runs live, Oct 24–25)

What changed between "before" and "after": cheap rent alone no longer counts as a scam sign (step 2), per-bedroom and per-person pricing plus the sublet line, the lease deposit and repairs fixes, and the Spanish option (English path unchanged). None of these were tuned to specific items; the lease fix was motivated by the "before" misses and then tested on 3 new leases.

| Set | System | Before: precision / recall / false alarms | After: precision / recall / false alarms |
|---|---|---|---|
| Easy (17 scam / 15 legit) | Clearlease "Likely scam" | 100% / 94% / 0 | 100% / 94% / 0 |
| Easy | Clearlease any red flag | 77% / 100% / 5 | **89% / 100% / 2** |
| Easy | Keyword baseline | 94% / 100% / 1 | 94% / 100% / 1 |
| **Holdout** (5 / 5, first opened in "after") | Clearlease "Likely scam" | 100% / 80% / 0 | 100% / 80% / 0 |
| Holdout | Clearlease any red flag | 71% / 100% / 2 | 83% / 100% / 1 |
| Holdout | Keyword baseline | 100% / 100% / 0 | 100% / 100% / 0 |
| Hard (15 / 9) | Clearlease "Likely scam" | 100% / 100% / 0 | 100% / 100% / 0 |
| Hard | Clearlease any red flag | 94% / 100% / 1 | **100% / 100% / 0** |
| Hard | Keyword baseline | 25% / 13% / 6 | 25% / 13% / 6 |
| Leases | Clause-conflict recall | 7 of 9 (5 leases) | **13 of 13** (8 leases, 3 written after the fix), 0 unexpected |
| All listing sets | Legitimate listings labelled "Suspiciously cheap" | 6 (l01, l03, l12, l18, l20, h23) | **0** |

The holdout "before" numbers were computed from `scripts/eval/results/before-holdout.json`, saved unread at the first run and opened only for this table.

**Plain reading:**
- The price-bias fix did what it was meant to: no legitimate listing is called "Suspiciously cheap" any more, and false alarms from price alone are gone. The remaining false alarms come from real-sounding signals: "units go fast" (pressure), "Venmo to split utilities" (payment app), and "the owner lives out of state" (owner away, though a local manager shows it).
- **On the easy set and the holdout, a simple keyword scan is as good as Clearlease or better.** On the 5-and-5 holdout it made no mistakes, while Clearlease's softer "Some red flags" tier raised one false alarm. Ordinary scam posts use ordinary scam words.
- Clearlease's advantage shows on the hard set (paraphrased payments, misspellings, Spanish, anti-scam disclaimers, screenshots) and on leases, which a keyword scan can't judge at all.
- "Likely scam" is the verdict to trust: it raised 0 false alarms in every set. It missed 1 easy scam and 1 holdout scam that still got "Some red flags".
- Each run is a single pass of a live model; reruns can move a flag or two (for example, the Blacksburg sample has shown 6 or 7 of 9 flags).
