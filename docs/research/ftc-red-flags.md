# FTC rental listing scam red flags, mapped to machine-checkable signals

Researched 2026-10-24. Status tags: **VERIFIED** means I fetched the page and saw the text. **UNVERIFIED** means it was inferred, or the fetch failed. Quotes are verbatim. A few long sentences came back from the fetch tool as consecutive fragments, which I have rejoined without changing any words.

## TL;DR for the build

1. **The FTC names exactly three payment methods: "wire transfer through Western Union or MoneyGram, gift cards, or cryptocurrency".** VERIFIED. The FTC article (dated June 2026) **does not mention payment apps** (Zelle/Venmo/Cash App), so `docs/process/brief/research-facts.md` line 9 ("payment-app deposits") overstates it. For payment apps, cite **DC OAG** (Zelle, Venmo, Cash App, cashier's check) and the **Arizona AG** ("peer-to-peer payment apps"). Both are VERIFIED below.
2. **The Dec 2025 Data Spotlight names no payment methods at all.** VERIFIED for the HTML page. The PDF version wouldn't parse, so its content is UNVERIFIED.
3. **No FTC or government source gives a numeric "% below market" threshold.** FTC: *"a lot cheaper than most rents in the area"*. AZ AG: *"well below"*. DC OAG: *"too good to be true"*. All VERIFIED. **Every numeric threshold below is our design choice** and must be labelled that way in the UI ("Clearlease heuristic").
4. Two FTC red flags (*same address listed with different owner/price* and *home listed for sale*) **can't be detected from the listing text alone**. They need an external search, so show them as a user checklist item with a link, not as a computed flag.
5. Report URL: **https://reportfraud.ftc.gov/**. Paid-a-scammer URL: **https://consumer.ftc.gov/articles/what-do-if-you-were-scammed** (section "How To Get Your Money Back if You Paid a Scammer"). Both VERIFIED.

---

## 1. Sources

| ID | Source | Date | Status |
|---|---|---|---|
| FTC-A | FTC Consumer Advice, "Rental Listing Scams", https://consumer.ftc.gov/articles/rental-listing-scams | "June 2026" | VERIFIED |
| FTC-S | FTC Data Spotlight, "Rental scams hit home with $65 million in reported losses", https://www.ftc.gov/news-events/data-visualizations/data-spotlight/2025/12/rental-scams-hit-home-65-million-reported-losses | December 22, 2025 (Division of Consumer Response and Operations Staff) | VERIFIED (HTML). PDF https://www.ftc.gov/system/files/ftc_gov/pdf/rental-scams-spotlight-2025.pdf is UNVERIFIED (unparseable) |
| FTC-W | FTC, "What To Do if You Were Scammed", https://consumer.ftc.gov/articles/what-do-if-you-were-scammed | "June 2026" | VERIFIED |
| DC-23 | DC OAG, "Consumer Alert: Looking for a Place to Rent in D.C.? Watch Out for Fake Listings & Rental Fee Scams", https://oag.dc.gov/blog/consumer-alert-looking-place-rent-dc-watch-out | August 3, 2023 | VERIFIED |
| DC-18 | DC OAG, "Shopping for a rental property? Beware of fake listings!", https://oag.dc.gov/blog/shopping-rental-property-beware-fake-listings | August 21, 2018 | VERIFIED |
| AZ | Arizona AG, "Attorney General Mayes Warns Consumers about Rental Scams", https://www.azag.gov/press-release/attorney-general-mayes-warns-consumers-about-rental-scams | May 14, 2025 | VERIFIED (out-of-DMV state AG, a government source used as a supplement) |

---

## 2. Verbatim red flags

### FTC-A: consumer.ftc.gov/articles/rental-listing-scams (VERIFIED)

Section headings (H2): "How Rental Scam Ads Work", "How To Tell Whether a Rental Listing Is Real", "Protect Your Personal Information and Money", "Report Problems".

**Hijacked listings**
- A1: "Scammers take over real rental listings and make them their own."
- A2: "Scammers copy the pictures, description, or virtual tour from a real online rental listing, replace the agent's contact information with their own, and then post the phony ads on a new site."
- A3: "The scammer might try to pocket your money for the supposed application fee, deposit, first month's rent, or vacation rental charge."
- A4: "The scammer might tell you to complete an application with information like your Social Security number, a picture of your driver's license, paystubs, and other personal details. Then they might use this information to steal your identity."
- A5: "The scammer might say you need to show you're creditworthy by sending screenshots of your credit scores. What they really want is to get you to enroll in a paid credit monitoring program with recurring fees."
- A6: "Search online for the rental location's address along with the name of the property owner or rental company. If other ads come up for the same address, but with a different owner or rental company name, that's a sign of a scam."
- A7: "Go to the rental company's own website to see if the property is listed there, too. If it isn't, the ad you found may be a scam."

**Listings that don't exist**
- A8: "Scammers create listings for places that aren't for rent or don't exist."
- A9: "The fake ads might offer surprisingly low rent or amazing amenities."
- A10: "But when you ask to see the rental, the fake owner will usually claim to be out of the country or give another excuse for not showing the property — then rush you into making a quick decision."
- A11: "The fake owner might tell you can only secure the property with a wire transfer through Western Union or MoneyGram, gift cards, or cryptocurrency to pay for an application fee, deposit, or first month's rent."
- A12: "If anyone pressures you to make a decision quickly, walk away."
- A13: "And if you find the home listed for sale instead of for rent, that's also a big red flag."
- A14: "And know that if you send money by wire transfer, gift card, or cryptocurrency, it's like sending cash. Once it's gone, you probably can't get it back."

**How To Tell Whether a Rental Listing Is Real**
- A15: "Search online for the name of the property owner or rental company with the words "complaint," "review," or "scam.""
- A16: "Consider the price of the rental. If the rent is a lot cheaper than most rents in the area, it could be a sign of a scam. And if anyone pressures you to make a decision quickly to get a great deal, walk away."
- A17: "If you can, look at the property before you sign or pay. Visit the property in person, have a friend or someone you know visit it, or watch a video or virtual tour."
- A18: "While rental scammers generally won't meet you in person, they may set you up with a self-guided tour to help convince you they're legit by copying listings from landlords who use self-tour services."
- A19: "If you go in person, ask the rental agent for a business card issued by the company that owns or manages the property. Then check the agent's ID to be sure it matches the records."
- A20: "Search city or county tax assessment websites to learn who owns a property, then check the landlord's ID to be sure it matches the records."

**Protect Your Personal Information and Money**
- A21: "Never give personal or financial information to anyone who contacts you and claims to be working with the owner or rental company. Instead, use the contact information you already have to contact the owner or company."
- A22: "Until you've agreed to rent a place, a landlord doesn't need your Social Security number, credit score, or other sensitive information. And most landlords normally pull your credit score themselves — they don't tell you to get it for them."
- A23: "If anyone insists you can only pay with wire transfers through Western Union or MoneyGram, gift cards, or cryptocurrency, it's a scam."
- A24: "Wiring money, sending gift cards, or paying by cryptocurrency is the same as sending cash" (continues: once you send it, you probably can't get it back).

**Report Problems**
- A25: "If you notice a rental listing scam, report it to your local law enforcement agency and the website where the ad was posted. And report it to" the FTC at ReportFraud.ftc.gov (link `https://reportfraud.ftc.gov/#/`) and your state attorney general (link `https://www.naag.org/our-work/center-for-consumer-protection/consumer-file-a-complaint/`).

### FTC-S: Data Spotlight, Dec 22, 2025 (VERIFIED)

- S1: "Since 2020, people have reported nearly 65,000 rental scams to the FTC with about $65 million in losses." Footnote: "The median reported loss amount during this period was $1,000."
- S2: "People ages 18 to 29 were three times more likely than other adults to report losing money to a rental scam." Footnote: 46% of loss-indicating reports came from ages 18–29.
- S3: "In the 12 months ending in June 2025, about half of people who reported a rental scam said it started with a fake ad on Facebook." / "Another 16% said the scam started with a fake listing on Craigslist."
- S4: "Many young adults report being targeted on Facebook groups college students use to look for sublets" (this is the student angle for the pitch).
- S5: "many would-be renters report discovering that the scammer copied an ad for a property that was really for sale, not for rent."
- S6: "Other scammers create fake listings from scratch, complete with attractive photos and below market rent to grab your attention."
- S7: "Scammers pressure you for money upfront before you've even seen the place in person." / "They might say you need to pay an application fee, security deposit, or first month's rent to "hold" the property."
- S8: "Scammers say you need to show you're creditworthy by sending screenshots of your credit scores." / "They send links to websites that let you sign up for a credit check, often for $1."
- S9: "As a rule, these scammers will not meet you in person to show the property, but they may set you up with a self-guided tour to help convince you they're legit." / "Then they send you a code (or tell you how to get one) to open a lockbox holding the keys."
- S10 (tip): "If you find the same property listed with different prices or contact information, it's likely a scam."
- S11 (tip): "If the advertised rent is a lot cheaper than most rents in the area, it could be a sign of a scam."
- S12 (tip): "And legit landlords normally pull your credit score themselves – they don't tell you to get it for them."
- Payment methods: **none named** in the HTML Spotlight (VERIFIED by absence). The PDF is UNVERIFIED.

### DMV and state supplements (VERIFIED)

- DC-23a: "Examples of non-refundable payment methods include wire transfers, Zelle, or a cashier's check."
- DC-23b: "Once money is sent using a mobile payment app (Zelle, Venmo, Cash App, etc.), wire transfer, or cashier's check, that money is gone."
- DC-23c: "It is safer to pay an application fee or security deposit with a personal check or a credit card."
- DC-23d: "Don't pay a security deposit until a lease is signed!"
- DC-23e: "Ask the landlord to do a virtual tour of the property on a video call, FaceTime, or Skype." followed by "If the landlord refuses, this is a red flag."
- DC-23f: "If the landlord tells you that they will complete the lease after you send the security deposit, this is a red flag."
- DC-23g: "Look out for lease agreements that contain blank spaces or unclear terms." (feeds the lease-clause module)
- DC-23h: "Security deposits cannot cost more than one month of rent." (DC claim. Cross-check against the DC Code in the lease-law research before using it as a rule.)
- DC-18a: "Do not send money or share financial information if the landlord is unwilling to give you an address that you can research."
- DC-18b: "Never wire money or pay with prepaid card."
- DC-18c: "It is a red flag if a landlord insists that you must act immediately."
- AZ-a: requests for payments "sent overseas or by wired funds, gift cards or through peer-to-peer payment apps."
- AZ-b: listers who are "out of state or out of the country"; who "request communication via text only"; who are "not reachable by phone during normal business hours"; "up front" fees beyond the normal application and credit check fees; requests for "personal information such as your social security number and bank account information up front."

---

## 3. Payment methods called out

| Normalized enum (`PaymentMethod`) | Called out by | Risk tier (our design choice) |
|---|---|---|
| `wire_transfer` (incl. `western_union`, `moneygram`) | FTC-A (A11, A14, A23), DC-23, DC-18, AZ | `scam` |
| `gift_card` | FTC-A (A11, A14, A23), AZ | `scam` |
| `cryptocurrency` | FTC-A (A11, A14, A23) | `scam` |
| `prepaid_card` | DC-18 ("prepaid card") | `scam` |
| `zelle` | DC-23 | `high` |
| `venmo` | DC-23 | `high` |
| `cash_app` | DC-23 | `high` |
| `p2p_app_other` (e.g. PayPal Friends & Family; PayPal itself isn't named by any source) | AZ ("peer-to-peer payment apps") | `high` |
| `cashiers_check` | DC-23 | `high` |
| `overseas_transfer` | AZ ("sent overseas") | `scam` |
| `cash` | Not named by any source as a scam payment. The FTC compares the scam methods to "sending cash" | `high` (design choice) |
| `personal_check`, `credit_card` | DC-23 calls these "safer" | `ok` |
| `online_portal`, `other`, `unknown` | — | `ok` / `unknown` |

The FTC rule in A23 is the strongest one: *"If anyone insists you can **only** pay with wire transfers through Western Union or MoneyGram, gift cards, or cryptocurrency, it's a scam."* So whether those are the **only** accepted methods matters. We extract `paymentMethodsOnly: boolean`.

---

## 4. Extraction schema (what Gemma returns)

This is a design choice: field names for the TS/zod schema. Every field is nullable or defaults to `false`, and Gemma must return `null` when the listing text doesn't say. **Gemma only extracts. The deterministic code below decides the flags.** Each boolean has a companion `evidence` quote so the UI can show the user the exact listing text.

```ts
type PaymentMethod =
  | "wire_transfer" | "western_union" | "moneygram" | "gift_card" | "cryptocurrency"
  | "prepaid_card" | "overseas_transfer" | "zelle" | "venmo" | "cash_app" | "p2p_app_other"
  | "cashiers_check" | "cash" | "personal_check" | "credit_card" | "online_portal" | "other";

interface ListingSignals {
  askingRent: number | null;            // USD per month, as stated
  bedrooms: number | null;              // 0 = studio/efficiency
  zip: string | null;                   // 5-digit
  addressGiven: boolean | null;         // full street address present?  (DC-18a)
  paymentMethods: PaymentMethod[];      // every method mentioned as acceptable or requested
  paymentMethodsOnly: boolean | null;   // "only"/"must" pay via those methods  (A11, A23)
  paymentRequestedBeforeViewing: boolean | null; // deposit/fee/rent to "hold" before any viewing  (S7)
  paymentRequestedBeforeLease: boolean | null;   // deposit before a signed lease  (DC-23d, DC-23f)
  pressureToActQuickly: boolean | null; // "today only", "many applicants", "first to pay"  (A10, A12, A16, DC-18c)
  landlordAway: boolean | null;         // out of country/state, missionary, deployed, abroad  (A10, AZ-b)
  canTourInPerson: boolean | null;      // false if owner refuses/excuses a showing  (A10, A17, S9)
  tourType: "in_person" | "self_guided_lockbox" | "virtual" | "none" | null; // (A17, A18, S9)
  refusesVirtualTour: boolean | null;   // (DC-23e)
  requestsSensitiveInfoEarly: boolean | null; // SSN, DL photo, paystubs, bank info before agreeing to rent  (A4, A22, AZ-b)
  requestsCreditScreenshotOrLink: boolean | null; // "send your credit score", credit-check link  (A5, S8, S12)
  thirdPartyIntermediary: boolean | null; // "my agent/lawyer will handle it", contact via unsolicited third party  (A21)
  textOrEmailOnly: boolean | null;      // won't talk by phone; text-only  (AZ-b)
  offPlatformContact: boolean | null;   // asks to move to WhatsApp/text/personal email
  upfrontFeesBeyondApplication: boolean | null; // "holding fee", "key fee" beyond app/credit fee  (AZ-b)
  evidence: Partial<Record<keyof Omit<ListingSignals, "evidence">, string>>; // verbatim snippet per field
}
```

`offPlatformContact` has **no FTC or AG source** in the pages I fetched. The closest is AZ-b ("request communication via text only"). If we keep it, label it a Clearlease heuristic (UNVERIFIED as an official red flag).

---

## 5. Deterministic rules

Severity labels (`scam` > `high` > `medium` > `info`) and all numeric thresholds are **our design choice**. Only the **source** column is a factual claim.

| Rule ID | Fires when | Severity | User-facing reason (quote the source) | Source |
|---|---|---|---|---|
| `PAY_SCAM_METHOD` | `paymentMethods` ∩ {wire_transfer, western_union, moneygram, gift_card, cryptocurrency, prepaid_card, overseas_transfer} ≠ ∅ | `high`. Escalates to `scam` if `paymentMethodsOnly === true` | "If anyone insists you can only pay with wire transfers through Western Union or MoneyGram, gift cards, or cryptocurrency, it's a scam." | FTC-A A23 (DC-18b, AZ-a) |
| `PAY_NONREFUNDABLE_APP` | `paymentMethods` ∩ {zelle, venmo, cash_app, p2p_app_other, cashiers_check} ≠ ∅ | `medium` (`high` if combined with `paymentRequestedBeforeViewing` or `paymentRequestedBeforeLease`) | "Once money is sent using a mobile payment app (Zelle, Venmo, Cash App, etc.), wire transfer, or cashier's check, that money is gone." | DC-23b, AZ-a |
| `PAY_BEFORE_VIEWING` | `paymentRequestedBeforeViewing === true` | `high` | "Scammers pressure you for money upfront before you've even seen the place in person." | FTC-S S7 |
| `PAY_BEFORE_LEASE` | `paymentRequestedBeforeLease === true` | `medium` | "Don't pay a security deposit until a lease is signed!" | DC-23d, DC-23f |
| `PRESSURE` | `pressureToActQuickly === true` | `medium` | "If anyone pressures you to make a decision quickly, walk away." | FTC-A A12 |
| `LANDLORD_AWAY` | `landlordAway === true` | `high` | "the fake owner will usually claim to be out of the country or give another excuse for not showing the property" | FTC-A A10, AZ-b |
| `NO_SHOWING` | `canTourInPerson === false` or `tourType === "none"` or `refusesVirtualTour === true` | `high` | "If you can, look at the property before you sign or pay." / "If the landlord refuses, this is a red flag." | FTC-A A17, DC-23e |
| `SELF_TOUR_ONLY` | `tourType === "self_guided_lockbox"` and no in-person option | `info` (legit landlords use these too; S9 calls it a scammer tactic, not proof) | "they may set you up with a self-guided tour to help convince you they're legit." | FTC-S S9, FTC-A A18 |
| `EARLY_SENSITIVE_INFO` | `requestsSensitiveInfoEarly === true` | `high` | "Until you've agreed to rent a place, a landlord doesn't need your Social Security number, credit score, or other sensitive information." | FTC-A A22 |
| `CREDIT_SCREENSHOT` | `requestsCreditScreenshotOrLink === true` | `high` | "most landlords normally pull your credit score themselves — they don't tell you to get it for them." | FTC-A A22, FTC-S S8 |
| `THIRD_PARTY` | `thirdPartyIntermediary === true` | `medium` | "Never give personal or financial information to anyone who contacts you and claims to be working with the owner or rental company." | FTC-A A21 |
| `NO_ADDRESS` | `addressGiven === false` | `medium` | "Do not send money or share financial information if the landlord is unwilling to give you an address that you can research." | DC-18a |
| `TEXT_ONLY` | `textOrEmailOnly === true` | `info` | listers who "request communication via text only" | AZ-b |
| `OFF_PLATFORM` | `offPlatformContact === true` | `info` | Clearlease heuristic (no official source found) | — (design choice) |
| `EXTRA_UPFRONT_FEES` | `upfrontFeesBeyondApplication === true` | `medium` | be skeptical of "up front" fees beyond the normal application and credit check fees | AZ-b |
| `PRICE_TOO_LOW` | see below | `medium` / `high` | "If the rent is a lot cheaper than most rents in the area, it could be a sign of a scam." | FTC-A A16, FTC-S S11 |
| `CHECK_DUPLICATES` (manual checklist, always shown) | always | `info` | "If you find the same property listed with different prices or contact information, it's likely a scam." | FTC-S S10, FTC-A A6 |
| `CHECK_FOR_SALE` (manual checklist, always shown) | always | `info` | "And if you find the home listed for sale instead of for rent, that's also a big red flag." | FTC-A A13, FTC-S S5 |
| `CHECK_OWNER` (manual checklist) | always | `info` | "Search city or county tax assessment websites to learn who owns a property" | FTC-A A20 |

### `PRICE_TOO_LOW`: thresholds are our design choice

The sources give **no numeric threshold**. The FTC says "a lot cheaper than most rents in the area" (A16, S11) and "surprisingly low rent" (A9). AZ says "well below" market price. DC-18 says "Beware of a deal that seems too good to be true." All VERIFIED. A web-search summary attributed a "50% discount" rule of thumb to one Nevada private attorney; that's secondary, UNVERIFIED, and **not to be cited**.

Proposed rule (design choice):

```ts
// reference: first non-null of
//   1. ACS B25031 median gross rent for (ZCTA, bedrooms)   (census-acs.md)
//   2. HUD FMR for (ZIP via SAFMR or county, bedrooms)     (hud-fmr.md: basicdata["One-Bedroom"], etc.)
//   3. ACS B25064 median gross rent for ZCTA, then county  (census-acs.md)
// Skip if reference is null, or top-coded (ACS EA "3,500+" / value 3501), or if askingRent is null.
const ratio = askingRent / reference;
if (ratio <= 0.60) flag("PRICE_TOO_LOW", "high");        // 40%+ below reference
else if (ratio <= 0.75) flag("PRICE_TOO_LOW", "medium"); // 25-40% below reference
```

Why it's set conservatively (design reasoning, not sourced):
- ACS **gross** rent includes utilities paid by the renter, but listing asking rent usually doesn't. That deflates the ratio and over-flags. The definition is UNVERIFIED: I saw only a census.gov search snippet (see census-acs.md).
- ACS 5-year values are pooled over 2020–2024 and lag current asking rents. That makes old medians *lower* than today's market, so this bias under-flags.
- An all-bedroom median (B25064) compared against a studio over-flags studios. Prefer the per-bedroom reference (B25031 or FMR).
- Always show the user the reference number, its source and vintage, plus "Clearlease heuristic, not an FTC threshold."

### Aggregate verdict (design choice)

- `likely_scam`: any `scam`-severity flag, or ≥2 `high` flags
- `caution`: 1 `high`, or ≥2 `medium`
- `no_red_flags_found`: otherwise. Never say "safe", because the FTC notes even a video tour is "still not a guarantee that a property is real or available for rent" (FTC-A, VERIFIED).

---

## 6. Where to send users

| Purpose | URL | Status |
|---|---|---|
| Report to FTC | https://reportfraud.ftc.gov/ (the article links `https://reportfraud.ftc.gov/#/`; the Spotlight links `http://www.reportfraud.ftc.gov/`) | VERIFIED |
| Paid a scammer: how to try to get money back | https://consumer.ftc.gov/articles/what-do-if-you-were-scammed, section "How To Get Your Money Back if You Paid a Scammer" | VERIFIED |
| FTC rental scam article (cite in the UI) | https://consumer.ftc.gov/articles/rental-listing-scams | VERIFIED |
| State AG complaint directory (linked by the FTC) | https://www.naag.org/our-work/center-for-consumer-protection/consumer-file-a-complaint/ | VERIFIED (link present on FTC-A) |
| DC OAG consumer complaint | https://oag.dc.gov/consumer-protection/submit-consumer-complaint · hotline (202) 442-9828 · consumer.protection@dc.gov | VERIFIED (listed on DC-23) |
| MD AG Consumer Protection complaint portal | https://portal.oag.state.md.us/cpdportal/?q=Home | UNVERIFIED (seen in search results only, not fetched) |

Per-payment-method "paid a scammer" actions, from FTC-W (VERIFIED; quotes as returned):

| Paid with | FTC instruction |
|---|---|
| Credit card | "Report it to the credit card issuer immediately." |
| Debit card | "Report it to your bank or credit union immediately." |
| Wire transfer | "Report it to the wire transfer company immediately." |
| Payment app | "Report it to the payment app immediately." |
| Zelle / bank transfer | "Report it to your bank or credit union immediately." (under the heading "Zelle and Bank Transfers") |
| Gift card | "Contact the gift card issuer immediately. Use the number on the back of the card." |
| Cryptocurrency | "Contact the cryptocurrency exchange or ATM operator immediately." |

These map directly from `paymentMethods`, so the "already paid?" panel can show the matching row (design choice).
