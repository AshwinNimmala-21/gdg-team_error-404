m01 not_run unknown
m02 some unknown
m03 some unknown
m04 not_run unknown
m05 not_run unknown
m06 none_found unknown
m07 likely unknown
m08 none_found typical
m09 none_found typical
m10 likely far-below
m11 likely far-below
m12 likely below
m13 likely typical
m14 likely unknown
m15 none_found far-below
m16 none_found typical
m17 likely far-below
m18 none_found typical
m19 none_found typical
m20 none_found unknown

### Run "messy-after", messy set (2026-10-25T08:46Z, http://localhost:3000)

**Development set** (7 scam / 8 legit; errors: 0)

| System | Precision | Recall | False alarms on legit listings |
|---|---|---|---|
| Clearlease: "Likely scam" | 100% | 100% | 0 of 8 |
| Clearlease: any red flag (Some or Likely) | 100% | 100% | 0 of 8 |
| Keyword baseline: any keyword | 83% | 71% | 1 of 8 |

Legit listings labelled "Suspiciously cheap": none.
Missed scams (no red flag): none. False alarms: none.

Clause-conflict recall: 0 of 0. Unexpected conflicts: 0.

| Lease | Expected conflicts | Found conflicts |
|---|---|---|

Modes: live. Median latency: 12.1 s.

| Category | Items | Clearlease correct (any red flag = scam) | Baseline correct (any keyword = scam) |
|---|---|---|---|
| question | 5 | 3 | 3 |
| partial | 1 | 1 | 1 |
| emoji-caps | 1 | 1 | 1 |
| typos | 1 | 1 | 1 |
| paste-junk | 2 | 2 | 2 |
| chat-text | 1 | 1 | 1 |
| chat-screenshot | 1 | 1 | 0 |
| es-no-accents | 1 | 1 | 1 |
| es-abbrev | 1 | 1 | 0 |
| es-regional | 2 | 2 | 2 |
| spanglish | 2 | 2 | 2 |
| caps-negation | 1 | 1 | 0 |
| es-number-format | 1 | 1 | 1 |

Questions answered with the "what we can check" state: 4 of 5. Rent read correctly: 11 of 11. Listings or messages shown as a question by mistake: 0.

| Item | Category | Label | Shown as | Scam | Rent read (expected) |
|---|---|---|---|---|---|
| m01 | question | question | question | not_run | 600 |
| m02 | question | question | question | some (2) | none |
| m03 | question | question | question | some (2) | none |
| m04 | question | question | question | not_run | none |
| m05 | question | question | report | not_run | none |
| m06 | partial | legit | report | none_found | none |
| m07 | emoji-caps | scam | report | likely (5) | 1450 |
| m08 | typos | legit | report | none_found | 1900 (1900) |
| m09 | paste-junk | legit | report | none_found | 2150 (2150) |
| m10 | paste-junk | scam | report | likely (5) | 900 (900) |
| m11 | chat-text | scam | report | likely (5) | 1700 |
| m12 | chat-screenshot | scam | report | likely (4) | 1250 |
| m13 | es-no-accents | scam | report | likely (4) | 1650 (1650) |
| m14 | es-abbrev | scam | report | likely (3) | 700 (700) |
| m15 | es-regional | legit | report | none_found | 1650 (1650) |
| m16 | es-regional | legit | report | none_found | 2100 (2100) |
| m17 | spanglish | scam | report | likely (4) | 1100 (1100) |
| m18 | spanglish | legit | report | none_found | 1700 (1700) |
| m19 | caps-negation | legit | report | none_found | 2600 (2600) |
| m20 | es-number-format | legit | report | none_found | 850 (850) |
