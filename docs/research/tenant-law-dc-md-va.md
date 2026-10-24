# Tenant law rule sheet: Virginia, DC, Maryland

Researched 2026-10-24 for the Clearlease jurisdiction rule sheet. Priority order is VA, then DC, then MD.

## How to read this file

- **VERIFIED** means I fetched the cited page during this session and saw the quoted text, or saw a summary of it from the page.
- **UNVERIFIED** means the claim is inferred, comes from a search snippet, or the fetch failed. Do not ship an UNVERIFIED value as fact. Either show it with an "unconfirmed" flag or leave it out.
- **Quote length.** The fetch tool returns verbatim excerpts of at most about 125 characters. Many "exact quotes" below are therefore exact excerpts from a sentence, not the whole sentence. Where I only had a summary of a provision, the label says "(paraphrase of fetched text)".
- **Primary vs. secondary.** Primary sources are statutes, regulations, enacted acts, and government agency publications. Secondary sources are labelled **SECONDARY**.
- **URL patterns:**
  - VA: `https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-NNNN/`
  - DC: `https://code.dccouncil.gov/us/dc/council/code/sections/42-NNNN`
  - MD: `https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-NNN&enactments=false`

### Changes that affect the build

1. **VA has two versions of several sections on LIS right now.** The versions "effective until July 1, 2027" and "effective July 1, 2027" cover §§ 55.1-1202, -1203, -1204, -1209, -1212 and -1245. § 55.1-1258 (retaliation) and §§ 55.1-1240 and -1244 change on **January 1, 2027**. The rule sheet needs an `effective_from` / `effective_until` field per rule.
2. **VA has no fixed "24-hour" entry notice in the statute.** § 55.1-1229 requires "notice of his intent to enter" at "reasonable times". It sets **72 hours** for routine maintenance the tenant did not request. Many secondary sites say "24 hours"; do not ship that number.
3. **DC's 5% late-fee cap is not new.** It dates from D.C. Law 21-172 (2016). I found **no 2024–2026 amendment** to § 42-3505.31. The 2025 DC law, the RENTAL Act (D.C. Law 26-80), changed evictions and TOPA, not late fees. The real 2026 DC change is the **Fair Housing Practices Amendment Act of 2026** (D.C. Law 26-156, Aug. 14, 2026). It bans "junk fees" for habitability-related services and adds a 45-day notice of claimed amounts after move-out.
4. **MD deposit cap is now 1 month's rent.** This comes from the Renters' Rights and Stabilization Act of 2024 (HB 693, Ch. 124). The old 2-month cap survives only for a narrow utility-assistance exception.
5. **MD now has a statewide entry rule** at RP § 8-221: 24 hours written notice, entry only 7 a.m.–7 p.m. Mon–Sat. It was enacted by 2025 Ch. 564 (HB 1076), effective Oct. 1, 2025.
6. **MD month-to-month notice from the landlord is 60 days,** not 30 (RP § 8-402(c)(2)(i)).

---

## 1. Virginia: Virginia Residential Landlord and Tenant Act (VRLTA), Va. Code § 55.1-1200 et seq.

Chapter index: https://law.lis.virginia.gov/vacode/title55.1/chapter12/ (VERIFIED; it lists dual-version sections with effective dates).

### 1.1 Security deposit cap: VERIFIED
- **Citation:** Va. Code § 55.1-1226(A). URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1226/
- **Quote:** "No landlord may demand or receive a security deposit, however denominated, in an amount or value in excess of two months' periodic rent." The words "in an amount or value in excess of two months' periodic rent" were seen verbatim. The lead-in words "however denominated" were confirmed in a search snippet.
- **Related cap:** § 55.1-1208(A)(7) bars a lease term making the tenant pay "a security deposit, insurance premiums for damage insurance, and insurance" (excerpt) before tenancy that together exceed two months' periodic rent (paraphrase of fetched text). VERIFIED.
- **Amendment history** on the page: last amended 2023. No 2024–2026 change to § 55.1-1226. VERIFIED.

### 1.2 Deposit return deadline: VERIFIED
- **Citation:** § 55.1-1226(A).
- **Quote:** "within 45 days after the termination date of the tenancy". The fetched summary says the 45 days run from termination or the date the tenant vacates, whichever is later (paraphrase of fetched text).
- **Final utility bill:** § 55.1-1226(C): "the landlord may withhold a reasonable portion of the security deposit". This applies to the final utility bill when prior written notice was given (paraphrase).

### 1.3 Itemization requirement: VERIFIED
- **§ 55.1-1226(A):** deductions "shall be itemized by the landlord in a written notice given to the tenant".
- **Move-out inspection, § 55.1-1226(G):** On request to vacate, or within 5 days after the tenant's notice to vacate, the landlord must tell the tenant in writing of the right to attend the move-out inspection. The inspection "must be made within 72 hours of delivery of possession" (exact excerpt; rest is paraphrase).
- **§ 55.1-1226(E)–(F):** deductions taken during the tenancy must be reported within 30 days. The landlord must keep itemized records for 2 years (paraphrase of fetched text).

### 1.4 Interest on deposits
- **VERIFIED (absence):** The current text of § 55.1-1226 contains **no interest requirement**. I fetched the page and the fetch reported "This section does not mention interest on security deposits."
- **UNVERIFIED:** The year Virginia repealed the old interest requirement (former § 55-248.15:1). The search did not surface the repealing act.

### 1.5 Landlord entry and notice to enter: VERIFIED
- **Citation:** § 55.1-1229(A). URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1229/
- **General rule:** "Except in case of emergency or if it is impractical to do so, the landlord shall give the tenant notice of his intent" … "to enter" and may enter only "at reasonable times".
- **Routine maintenance the tenant did not request:** "at least 72 hours' notice". The work must be done within 14 days, and the notice must state the last possible date (paraphrase).
- **Maintenance the tenant requested:** "the landlord is not required to provide notice to the tenant".
- **Emergency:** "may enter the dwelling unit without consent of the tenant in case of emergency".
- **No 24-hour rule:** The fetch confirmed the page has no general 24-hour notice requirement. The only "24 hours" appears in the definition of an emergency repair condition.
- **Abuse of access:** The landlord may not abuse the right of access or use it to harass (paraphrase). Remedies are in § 55.1-1210.
- **Amendment history:** latest is 2024, c. 46. VERIFIED.

### 1.6 Late fees and grace period: VERIFIED
- **Citation:** § 55.1-1204(E), version effective until July 1, 2027. URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204/
- **Cap:** A late charge is allowed only if the written lease provides for it. It may not exceed "the lesser of 10 percent of the periodic rent or 10 percent of the remaining balance due and owed by the tenant".
- **Grace period:** For written leases the statute sets **no grace period**; the lease controls. For **no written lease**, § 55.1-1204(C) default terms apply: rent "shall be considered late if not paid by the fifth of the month", and "the landlord shall be entitled to charge a late charge as provided in this chapter".

### 1.7 Required disclosures: VERIFIED unless marked
- **Move-in inspection report (§ 55.1-1214):** The landlord must act "within five days after occupancy of a dwelling unit". The report must itemize "damages to the dwelling unit existing at the time of occupancy". It is deemed correct unless the tenant objects "in writing within five days after receipt of the report".
- **Mold (§ 55.1-1215):** In the move-in report, "the landlord shall disclose whether there is any visible evidence of mold in areas readily accessible". If mold is disclosed, the tenant may terminate and not take possession. Remediation is due "no later than five business days" (excerpt).
- **Fee disclosure statement (§ 55.1-1204.1):** The itemized list of the deposit, rent and one-time charges must begin "on the first page of the written rental agreement". It must include the statement: "No additional security deposits or rent shall be charged unless they are listed below or incorporated into this agreement by way of a separate addendum after execution." History: "2024, cc. 788, 826; 2025, c. 567." **NEW 2024–2025.**
- **Statement of Tenant Rights and Responsibilities (§ 55.1-1204(B)):** The landlord must provide it, and both parties sign an acknowledgment (paraphrase of fetched text).
- **Receipts (§ 55.1-1204(J)):** The landlord "shall provide the tenant with a written receipt whenever the tenant pays rent in the form of cash" or money order (excerpt + paraphrase).
- **Other disclosure sections** (titles VERIFIED from the chapter index; I did not read the bodies):
  - § 55.1-1216 sale of premises
  - § 55.1-1217 property adjacent to a military air installation
  - § 55.1-1218 defective drywall
  - § 55.1-1219 property previously used to manufacture methamphetamine
  - § 55.1-1223 insecticide/pesticide notice
- **Lead (federal, applies in all three jurisdictions): VERIFIED via EPA.** https://www.epa.gov/lead/real-estate-disclosure. For pre-1978 housing, before a renter signs a lease, the landlord must:
  - "Give buyers and renter a copy of the Protect Your Family From Lead In Your Home (PDF) pamphlet"
  - "Disclose any known information about the presence of lead-based paint and lead-based paint hazards"
  - "Provide all available records and reports on the presence of lead-based paint and lead-based paint hazards"
  - Include a "Lead Warning Statement".

  Exemptions include "Leases for 100 days or less" and "Zero-bedroom units". The CFR cites (24 CFR 35 / 40 CFR 745 subpart F) are **UNVERIFIED** because the eCFR fetch was blocked.

### 1.8 Retaliation: VERIFIED
- **Citation:** § 55.1-1258. URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1258/
- **Current version (effective until Jan. 1, 2027):**
  - "a landlord may not retaliate by increasing rent or decreasing services". This also covers bringing or threatening an action for possession, or terminating, after the landlord learns of protected activity.
  - Protected activity: complaining to a code agency, complaining to or suing the landlord, joining a tenants' organization, or testifying (paraphrase).
  - The tenant bears "the burden of proving retaliatory intent".
  - There is no fixed time window or presumption.
- **NEW: version effective Jan. 1, 2027 (2026, c. 1111):**
  - Adds threats, harassment, coercion, selective enforcement, and material lease changes without consent.
  - Protects media complaints and fair-housing complaints.
  - Drops the tenant burden-of-proof sentence.
  - Expands landlord defenses to nine (paraphrase of fetched text).

### 1.9 Automatic renewal and notice to terminate: VERIFIED
- **Automatic renewal is allowed.** § 55.1-1204(A): the lease may contain "automatic renewal of the rental agreement, requirements for notice of intent to vacate or terminate the rental agreement".
- **No written lease:** § 55.1-1204(C)(2): "The duration of the rental agreement shall be for 12 months and shall not be subject to automatic renewal" (month-to-month excepted).
- **Default tenancy type:** § 55.1-1204(F): week-to-week for weekly rent payers, otherwise month-to-month (paraphrase).
- **Month-to-month:** § 55.1-1253(A): either party may terminate by written notice "at least 30 days prior to the next rent due date, unless the rental agreement provides for a different notice period". Week-to-week requires "at least seven days prior to the next rent due date". URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1253/
- **Large multifamily non-renewals:** § 55.1-1253(B): an owner that fails to renew a specified number of month-to-month tenancies within 30 days must "serve written notice on each such tenant at least 60 days prior to allowing such tenancy to expire".
- **Landlords with more than 4 units (fixed-term leases):** § 55.1-1204(K): "A landlord who owns more than four rental dwelling units" must give written notice of a rent increase and "written notice of nonrenewal to the tenant". "Such notices shall be provided to the tenant no less than 60 days prior to the end of the rental agreement term."
- **NEW, effective July 1, 2027 (2026, c. 1066):** The rent-increase notice moves to "at least 90 days prior to the end of the rental agreement term". It must include a tenant response deadline of at least 30 days. Nonrenewal notice stays at 60 days (paraphrase).
- **Holdover:** § 55.1-1253(C)–(D): liquidated damages are capped at 150% of per-diem rent, or per-diem rent for public/HUD housing (paraphrase).

### 1.10 Application fee: VERIFIED
- **Citation:** § 55.1-1203(C). URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1203/
- **Cap:** "An application fee shall not exceed $50, exclusive of any actual out-of-pocket expenses paid" to third parties for background or credit checks. The cap is **$32** for public housing and HUD-regulated units (paraphrase).
- **Refundable application deposit (§ 55.1-1203(A)):** "the landlord shall refund to the applicant within 20 days after the applicant's failure to rent the unit", minus itemized expenses. The refund is due in 10 days if the deposit was paid in cash or certified funds and the landlord rejected the applicant: "such refund shall be made within 10 days of the applicant's failure to rent the unit".
- **NEW, effective July 1, 2027 (2026, c. 1050 / HB379):** New subsection A requires notice "Prior to requesting or collecting any payment or information about a prospective tenant". The fee cap moves to subsection D.

### 1.11 Early termination: VERIFIED
- **Military (§ 55.1-1235):**
  - Applies on PCS orders, "temporary duty orders in excess of three months' duration", discharge, government quarters, or a stop-movement order (paraphrase).
  - Requires written notice plus a copy of the orders or a commanding officer's letter.
  - Termination date is "not less than 30 days after the first date on which the next rental payment is due and payable after the date on which the written notice is given."
  - "The landlord may not charge any liquidated damages."
  - Amended 2024 and 2026.
- **Family abuse, sexual abuse, criminal sexual assault, stalking, trafficking (§ 55.1-1236):**
  - Requires a protective order, conviction, or charging document.
  - Termination is "effective 28 days after the tenant serves the termination notice on the landlord".
  - "The landlord may not charge any liquidated damages."
  - Co-tenants remain liable.
  - Amended 2024, c. 302 and 2025, c. 593.
- **Federal SCRA also applies (VERIFIED):** 50 U.S.C. § 3955 via govinfo, https://www.govinfo.gov/content/pkg/USCODE-2023-title50/html/USCODE-2023-title50-chap50-subchapIII-sec3955.htm
  - Covers orders "for a permanent change of station or to deploy with a military unit" for 90+ days.
  - Termination of a monthly lease "is effective 30 days after the first date on which the next rental payment is due and payable".
  - "The lessor may not impose an early termination charge".

### 1.12 Prohibited lease clauses: VERIFIED
- **Citation:** § 55.1-1208. URL: https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1208/
- **Prohibited terms:**
  - A1 waiver of rights: "Agrees to waive or forgo rights or remedies under this chapter;"
  - A3 confession of judgment: "Authorizes any person to confess judgment on a claim arising out of the rental agreement;"
  - A4 landlord attorney fees: "Agrees to pay the landlord's attorney fees except as provided in this chapter;"
  - A5 liability waiver: "Agrees to the exculpation or limitation of any liability of the landlord to the tenant arising under law"
  - A7 deposit plus insurance over 2 months (see 1.1).
  - A8 SCRA waiver: "Agrees to waive remedies or rights under the Servicemembers Civil Relief Act, 50 U.S.C. § 3901 et seq.,"
- **Effect:** B: "Any provision prohibited by subsection A that is included in a rental agreement is unenforceable." If the landlord tries to enforce one, the tenant may recover actual damages and attorney fees (paraphrase).
- **Repair fees:** C: "Unless necessitated by the tenant's violation of a requirement of this chapter, no landlord shall require" … "a tenant to pay any fee for the maintenance or repair of any dwelling unit."
  - History: "2025, cc. 684, 688; 2026, cc. 722, 723."
  - **SECONDARY** (Gentry Locke law firm, https://www.gentrylocke.com/article/virginias-2026-general-assembly-session-brings-significant-changes-for-landlords-and-manufactured-home-park-owners/): before July 1, 2026, subsection C applied only to public housing authorities. UNVERIFIED against the enrolled act.
- **Jury-trial waiver:** **not listed** in § 55.1-1208. VERIFIED (absence on page). Flag it as a "check with an attorney" item, not as void.

---

## 2. District of Columbia: D.C. Code Title 42 (Rental Housing Act of 1985) and 14 DCMR ch. 3

Note: the official DCMR text on dcregs.dc.gov did not render through the fetch tool (metadata only). Regulation-level values are sourced from (a) the enacted text of D.C. Law 16-276, which rewrote 14 DCMR 309 and 311, and (b) Office of the Tenant Advocate (OTA) publications. Both are labelled below.

### 2.1 Security deposit cap
- **OTA, District of Columbia Tenant Bill of Rights** (2015, published on dc.gov under D.C. Law 20-147): "The amount of the security deposit may not exceed the amount of 1 month's rent." Cited there to 14 DCMR §§ 308-311. URL: https://apia.dc.gov/sites/default/files/dc/sites/apia/publication/attachments/261018445-Bill-of-Rights.pdf. **VERIFIED** (I read the PDF).
- **OTA "D.C. Renters' Rights 101"** (agency slide deck, undated c. 2012–2013, hosted by GWU): warns of "Any demand for a security deposit in excess of one month's rent, which is unenforceable." URL: https://offcampus.students.gwu.edu/sites/g/files/zaxdzs1161/f/downloads/OTA%20Renters%20Rights%20101%20Final.pdf. **VERIFIED.**
- **UNVERIFIED:** the exact regulatory text of 14 DCMR § 308 ("first full month's rent" wording was seen only in secondary snippets).
- **Statute:** D.C. Code § 42-3502.17(a) only says "Security deposits shall be collected pursuant to the Security Deposit Act". **VERIFIED.** It sets no cap of its own; the fetch confirmed "None appears in this text".

### 2.2 Deposit return deadline: VERIFIED (enacted text) and new 2026 notice
- **14 DCMR § 309.1, as amended by the Interest on Rental Security Deposits Amendment Act of 2006** (D.C. Law 16-276, eff. Mar. 14, 2007). Enacted PDF: https://code.dccouncil.gov/us/dc/council/laws/docs/16-276.pdf
  - "Within forty-five (45) days after the termination of the tenancy, the owner shall do one of the following:"
  - "(1) Tender payment to the tenant, without demand, any security deposit … and any interest due"; or
  - "(2) Notify the tenant in writing, to be delivered to the tenant personally or by certified mail at the tenant's last known address, of the owner's intention to withhold and apply the monies toward defraying the cost of expenses properly incurred …"
- **UNVERIFIED:** whether D.C. Law 19-140 (2012) later changed the wording.
- **NEW: D.C. Code § 42-3502.17(e)** (added by the Fair Housing Practices Amendment Act of 2026, D.C. Law 26-156, Aug. 14, 2026). URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3502.17. VERIFIED.
  - (e)(1): the provider must request "a forwarding mailing address or email address from the tenant".
  - (e)(2)(A): "Within 45 days after termination of the tenancy, the housing provider shall notify the tenant in writing" of claimed unpaid amounts (rent arrears, damage beyond ordinary wear and tear, removal of items).
  - (e)(2)(B): the notice must include "Photographs or other documentation supporting the housing provider's claim for alleged unpaid amounts" and a statement of the right to dispute.
  - (e)(3): "Tenants shall have 30 calendar days after the date the housing provider's notice is served" to dispute. The provider replies within 10 days (paraphrase).
  - (e)(4): proof of service must be kept at least 60 days before sending the debt to a collector (paraphrase).
- **Wear and tear:** § 42-3502.17(c)(1): "No housing provider shall withhold a security deposit for the replacement value of apartment items" damaged by ordinary wear and tear. (c)(3) defines it as "deterioration that results from the intended use of a dwelling unit".

### 2.3 Itemization: VERIFIED (enacted text)
- **14 DCMR § 309.2 (D.C. Law 16-276):** "The owner, within 30 days after notification to the tenant … shall tender a refund of the balance of the deposit or payment, including interest not used to defray such expenses, and at the same time give the tenant an itemized statement of the repairs and other uses to which the monies were applied and the cost of each repair or other use."
- **Effective maximum:** up to 45 + 30 = 75 days when withholding.

### 2.4 Interest on deposits: VERIFIED (enacted text)
- **14 DCMR § 311.1 (D.C. Law 16-276):** interest "shall accrue at not less than the statement savings rate then prevailing on January 1st and on July 1st for each 6-month period (or part thereof) of the tenancy". The rate is that of "the District of Columbia financial institution in which the escrow account is held".
- **Penalties (same law):**
  - Unpaid interest is owed, "or in the event of bad faith, for treble that amount".
  - A willful violation carries a "civil fine of not more than $5000 for each violation".
- **Posting duty, 14 DCMR § 308.7 (same law):** the provider must post annually where deposits are held and the rate for each 6-month period. "At the end of a tenant's tenancy, the housing provider shall list for the tenant the interest rate for each 6-month period during the tenancy."
- **Applicant disclosure:** D.C. Code § 42-3502.22(b)(1)(H)(ii) requires "The amount of any initial security deposit, the interest rate on the security deposit". **VERIFIED.**
- **UNVERIFIED (secondary snippets only):** that interest is owed only if the tenancy lasts 12+ months.

### 2.5 Landlord entry: VERIFIED
- **Citation:** D.C. Code § 42-3505.51 (added by D.C. Law 21-210, eff. Feb. 18, 2017; no 2024–2026 amendments listed). URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.51
- **Notice (a)(1):** "written notice provided to the tenant at least 48 hours before the time" of entry. It may be shorter if the tenant agrees in writing. "Written notice may include electronic communication, including email and mobile text messaging". Paper notice is required if the tenant does not acknowledge.
- **Hours (a)(3):** 9 a.m.–5 p.m., not on a Sunday or federal holiday, unless the tenant agrees to another time (paraphrase of fetched text). OTA's 2017 FAQ states the same: "the entry occurs between 9 am and 5 pm, and not on a Sunday or federal holiday".
- **Purpose (b)(1):** "may enter a rental unit during a tenancy only for a reasonable purpose".
- **Emergency (b)(1):** "Except in the event of an emergency for the protection or preservation of the premises" (or the safety of persons).
- **Remedy (b)(2):** injunction plus quiet-enjoyment damages (paraphrase).
- **Code-violation access (b)(3):** a tenant alleging code violations must allow access within 48 hours of a written request (paraphrase).

### 2.6 Late fees and grace period: VERIFIED
- **Citation:** D.C. Code § 42-3505.31 (added by D.C. Law 21-172, eff. Dec. 8, 2016). URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.31
- **Cap (a):** "a housing provider may charge a late fee of no more than 5% of the full amount of rent due by a tenant."
- **Grace period (b)(2):** the fee is allowed only if rent is unpaid "within 5 days, or any longer grace period that may be provided in the lease."
- **Lease disclosure (b)(1):** the lease must state "the maximum amount of the late fee that may be charged pursuant to this section."
- **Prohibitions (c):**
  - "Charge interest on a late fee."
  - "Deduct any amount of a late fee from a subsequent rent payment."
  - "Impose a late fee more than one time on each late payment;"
  - "Evict a tenant on the basis of the nonpayment of a late fee;"
  - No late fee on the subsidy portion of rent.
- **Collection (d):** after the grace period the provider may "issue a tenant an invoice to be paid within 30 days". If unpaid, the provider may "deduct from a tenant's security deposit, at the end of the tenancy, any unpaid, lawfully imposed late fees."
- **2024–2026 changes: none found.** The credits list nothing after the 2020–2021 COVID temporary acts. The RENTAL Act (D.C. Law 26-80) amends § 42-3505.01 and not § 42-3505.31; its list of amended sections is VERIFIED at https://code.dccouncil.gov/us/dc/council/laws/26-80. The "2025 late fee rule" in the brief could not be found and is **UNVERIFIED**.

### 2.7 Required disclosures and fees: VERIFIED unless marked
- **At application, § 42-3502.22(b)(1).** URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3502.22
  - "The applicable rent for the rental unit;"
  - pending petitions; surcharges
  - "The rent-controlled or exempt status of the housing accommodation"
  - housing-code violation reports; the Rent Administrator pamphlet
  - "The amount of any nonrefundable application fee"
  - deposit amount and interest rate
  - condo/co-op conversion status; ownership information
  - "Information known or that should have been known about the presence of indoor mold contamination"
  - "A Tenant Bill of Rights published by the Office of the Tenant Advocate"
  - Amended most recently by D.C. Law 26-55 (Dec. 6, 2025).
- **Penalty, § 42-3502.22(c):** rent may not be increased while the provider is in willful violation (paraphrase).
- **Pre-screening notice, § 42-3505.10(a):** the provider "shall first notify the prospective tenant in writing" of each fee and its refundability, "The specific criteria that will result in automatic denial of the application", and so on. URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.10
- **NEW 2026 junk-fee ban, § 42-3505.10(b-2)(1)(A)** (D.C. Law 26-156, Aug. 14, 2026): "A housing provider shall not charge a fee to a prospective tenant before move-in, during a tenancy, or after move-out" for services needed to maintain habitable conditions. This includes utilities, trash, locks, and admin fees for third-party billing (paraphrase). Deposits may still cover damage "beyond the standard of ordinary wear and tear".
- **NEW Jan. 1, 2027, § 42-3505.11:** a provider "shall not separately charge tenants, other than through monthly rent" for "the utility charges accrued by the housing accommodation for its common spaces or vacant units". Ratio utility billing (RUBS) remains allowed. URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.11
- **Receipts (14 DCMR § 306).** Per the OTA Tenant Bill of Rights (VERIFIED as OTA's statement; regulation text UNVERIFIED): "The landlord must provide you with a receipt for any money paid, except where the payment is made by personal check and is in full satisfaction of all amounts due."
- **Lead.** Per the OTA Tenant Bill of Rights (VERIFIED as OTA's statement; 20 DCMR § 3300 text UNVERIFIED): for pre-1978 properties the landlord must provide the DOEE tenant lead-rights form, give a lead "clearance report" to households with a child under 6 or a pregnant woman, and disclose known lead hazards. The federal rule also applies (see 1.7).
- **Mold.** Per the OTA Tenant Bill of Rights (D.C. Code § 8-241; statute text UNVERIFIED): after written notice the landlord "must inspect the premises within 7 days and remediate within 30 days".
- **Move-in inspection:** I found **no** DC statute or regulation requiring one. OTA "recommends the move-in inspection occur before move-in or within the first 5 days of occupancy" (OTA Renters' Rights 101, citing 14 DCMR § 302). Treat it as advice, not a rule. Separately, OTA says the landlord must give 10 days' notice of a move-out inspection (Renters' Rights 101, citing 14 DCMR 308–311; regulation text UNVERIFIED).

### 2.8 Retaliation: VERIFIED
- **Citation:** D.C. Code § 42-3505.02 (no amendments since 1985). URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.02
- **Prohibited (a):** seeking possession "not otherwise permitted by law", raising rent, cutting services, harassment, refusing to renew, "termination of a tenancy without cause", and "any other form of threat or coercion".
- **Presumption (b):** the trier of fact "shall presume retaliatory action has been taken" if protected activity occurred "within the 6 months preceding the housing provider's action". The provider must rebut by "clear and convincing evidence to rebut this presumption".
- **Protected acts:** repair requests, contacting officials, lawful rent withholding, tenant organizing, enforcing lease rights, and suing the provider.

### 2.9 Renewal and notice to terminate: VERIFIED
- **No termination at lease expiration.** D.C. Code § 42-3505.01(a)(1): a tenant may not be evicted "for any reason unless" given a statutory notice, "notwithstanding the expiration of the tenant's lease or rental agreement", so long as rent is paid. URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.01
  - OTA Tenant Bill of Rights: "After the initial lease term expires, you have the right to continue your tenancy month-to-month indefinitely on the same terms, except for lawful rent increases."
  - Landlord no-fault grounds and notice periods: personal use 90 days (d); sale for buyer's personal use 90 days (e); renovation 120 days (f); substantial rehab 120 days (h); demolition 180 days (g); discontinuance 180 days (i).
  - Lease violation: 30-day cure (b).
  - **NEW, RENTAL Act, D.C. Law 26-80, eff. Dec. 31, 2025:** 10-day notice to vacate for a dangerous crime or crime of violence, for cases filed after Dec. 31, 2025, with an expedited hearing ((c)(2)).
- **Tenant month-to-month notice.** § 42-3505.54(a): "A residential tenancy from month-to-month … may be terminated by a 30-day notice in writing only from the tenant to the housing provider." "The notice shall expire on the first day of the first month at least 30 days after the date of the notice." URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.54
- **Lease cannot require more notice from a month-to-month tenant.** § 42-3505.54(b): "A housing provider shall not place or cause to be placed in a residential lease or rental agreement" "a requirement that the tenant provide more than a 30-day notice …" "unless the lease or agreement also requires the housing provider to provide the tenant with a written notice" "of any rent increase that is at least 30 days more than that time period."
  - Amended by D.C. Law 25-65 (Nov. 28, 2023).
  - The OTA 2017 FAQ says "15 days longer". That FAQ is **outdated**; use 30.
- **End of initial term.** § 42-3505.53: a provision requiring more than 30 days' notice to vacate at the end of the initial term "shall be void and unenforceable". The exception is when the lease "explicitly states that the provision expires upon the expiration of the initial lease term". URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.53
- **Automatic renewal into another fixed term:** I found no DC statute on this. In practice, tenancies roll to month-to-month by operation of § 42-3505.01 (inference, UNVERIFIED as a rule).

### 2.10 Application fee: VERIFIED
- **Citation:** D.C. Code § 42-3505.10(b)–(c).
- **Cap (b)(1):** "A housing provider may require a prospective tenant to pay an application fee." "Such an application fee will be no more than $50."
- **CPI adjustment (b)(2):** "Beginning on January 1, 2024, the application fee … may be adjusted annually by the housing provider … commensurate with an increase in the Consumer Price Index for All Urban Consumers". **The current CPI-adjusted dollar amount is UNVERIFIED.**
- **No other pre-lease fees (b)(3):** "A housing provider shall not charge a prospective tenant any fee other than an application fee prior to signing a lease with the tenant."
- **Refund (c):** if no screening is done, the fee is refunded "within a reasonable time, not to exceed 14 days."
- **One fee for multiple units (b-1):** one fee covers multiple units of the same provider within 30 days (paraphrase).

### 2.11 Early termination: VERIFIED
- **Intrafamily offense (§ 42-3505.07).** URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3505.07
  - The tenant "shall be released from obligations under the rental agreement".
  - Requires a protection order or "documentation signed by a qualified third party showing that the tenant has reported the intrafamily offense".
  - Release is effective at the earlier of 14 days after notice or a new tenancy starting. The request must be made within 90 days of the incident. No lease penalties apply (paraphrase).
- **Military:** I found no DC-specific statute (UNVERIFIED absence). Federal SCRA 50 U.S.C. § 3955 applies (see 1.11; VERIFIED).
- **Duty to mitigate.** § 42-3505.52: if a tenant leaves early, damages "shall be subject to the duty of the housing provider to mitigate actual damages."

### 2.12 Prohibited lease clauses
- **14 DCMR § 304 ("Prohibited Waiver Clauses in Lease Agreements").** The regulation text is **UNVERIFIED** because the fetch failed. OTA's summary (Renters' Rights 101, VERIFIED as OTA's statement) lists these "Examples of unenforceable clauses":
  - "Tenant waiver of jury trial in the event of a dispute;"
  - "Authorization for someone other than the tenant to confess to a judgment against the tenant;"
  - "Tenant waiver of landlord's liability for personal injuries caused by housing conditions for which the landlord is responsible;"
  - "Tenant waiver of landlord's responsibility for basic maintenance;"
  - "Assignment of attorneys fees, notwithstanding court determinations."
  - "Tenant waiver of right to notice to quit, except for non-payment of rent;"
  - "Tenant waiver of right to judicial process prior to eviction;"
  - "Tenant waiver of District housing code enforcement;"
  - "Tenant waiver of rights under Tenant Opportunity to Purchase Act (TOPA);"
  - "Right of landlord to terminate lease for any cause;"
  - "Bankruptcy or foreclosure itself terminates lease"
- **Treble damages: VERIFIED.** D.C. Code § 42-3509.01(a-2): a provider who violates section 533, 534, or 535 (§§ 42-3505.53–.55) "or section 304 of Title 14 of the Housing Regulations" "shall be liable to the tenant for treble damages if the housing provider is found to have acted in bad faith." URL: https://code.dccouncil.gov/us/dc/council/code/sections/42-3509.01
- **Sublet:** § 42-3505.55: a provider may prohibit subletting only if "the prohibition is included in the lease". Otherwise consent is subject to reasonable rental qualifications. VERIFIED.

---

## 3. Maryland: Md. Code, Real Property (RP) Title 8

Note: the mgaleg statute pages show current text but no amendment history. Effective dates come from bill pages.

### 3.1 Security deposit cap: VERIFIED
- **Citation:** RP § 8-203(b). URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-203&enactments=false
- **Cap (b)(1):** "Except as provided in paragraph (2) of this subsection, a landlord may not impose a security deposit in excess of the equivalent of 1 month's rent per dwelling unit".
- **Exception (b)(2):** "A landlord may impose a security deposit in an amount equivalent to up to 2 months' rent if:" all three of these hold:
  - "(i) The tenant is eligible and has qualified for utility assistance through the Department of Human Services;"
  - "(ii) The lease agreement requires that the tenant make payments for utility services directly to the landlord; and"
  - "(iii) The tenant and landlord agree in writing to the amount of the security deposit."
- **Penalty (b)(3):** "the tenant may recover up to three times the extra amount charged, plus reasonable attorney's fees".
- **Surety bond alternative (i)(3)(i):** "may not exceed two months' rent per dwelling unit."
- **No waiver (l):** "No provision of this section may be waived in any lease."
- **NEW 2024:** The Renters' Rights and Stabilization Act of 2024 (HB 693, Ch. 124, approved 4/25/2024; effective dates "October 1, 2024; October 1, 2025") is described as "limiting the maximum security deposit required by a residential lease to 1 month's rent" "except under certain circumstances". VERIFIED: https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb0693?ys=2024RS. **UNVERIFIED:** whether the cap applies only to leases signed or renewed on or after Oct. 1, 2024 (secondary sources disagree).
- **Related, RP § 8-208(d)(11):** a lease may not require a move-in payment of "more than the sum of the security deposit under § 8–203(b)" and the first month's rent. VERIFIED.

### 3.2 Deposit return deadline: VERIFIED
- **RP § 8-203(e)(1):** "Within 45 days after the end of the tenancy, the landlord shall return the security deposit to the tenant" with interest, less lawful withholdings.
- **Penalty (e)(4):** "the tenant has an action of up to threefold of the withheld amount, plus reasonable attorney's fees".

### 3.3 Itemization: VERIFIED
- **RP § 8-203(g)(1):** "within 45 days after the termination of the tenancy, a written list" of damages, "together with an itemized statement of the cost incurred".
- **Forfeiture (g)(2):** if the list is late, "the landlord forfeits the right to withhold any part of the security deposit for damages".
- **Move-out inspection (f)(1)(ii):** "The tenant has the right to be present when the landlord or the landlord's agent inspects the premises".

### 3.4 Interest: VERIFIED
- **Rate, RP § 8-203(e)(1):** "simple interest which has accrued at the daily U.S. Treasury yield curve rate for 1 year" … "or 1.5% a year, whichever is greater".
- **Accrual (e)(2)–(3):** "interest shall accrue at monthly intervals from the day the tenant gives the landlord the security deposit". Interest is due only if the deposit was held at least 6 months: "Unless the landlord has held the security deposit for at least 6 months". "Interest shall be payable only on security deposits of $50 or more."
- **Escrow (d)(1):** deposits are kept "in federally insured financial institutions", in accounts "devoted exclusively to security deposits and bear interest". "A security deposit shall be deposited in an account within 30 days after the landlord receives it."

### 3.5 Landlord entry: VERIFIED (NEW 2025)
- **Citation:** RP § 8-221. URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-221&enactments=false
- **Notice:** written notice "at least 24 hours in advance of the time that the landlord intends to enter the leased premises". It must state the date, approximate time and purpose, and may be delivered by mail, on the door, or electronically if the tenant elected that (paraphrase).
- **Hours:** "Enter only between the hours of 7:00 a.m. and 7:00 p.m. Monday through Saturday", or another time the tenant agrees to in writing.
- **Emergency:** "in the event of an emergency to ensure the imminent protection or preservation of the property" (plus occupant safety).
- **Remedy:** "the court may issue an injunction to the landlord, assess appropriate damages against the landlord".
- **Enacting bill:** HB 1076 (2025), "Residential Real Property - Landlord and Tenant - Notice of Landlord Entry", **Chapter 564, approved May 13, 2025, effective October 1, 2025**. VERIFIED: https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb1076?ys=2025RS. The bill page lists the section as § 8-220; the code page shows it at § 8-221, which suggests renumbering (UNVERIFIED).
- **Pending:** SB 635 (2026), "Notice of Landlord Entry - Tenant Consent", would let the landlord enter without notice on the tenant's written repair request. Its page shows only a 2/19 Senate hearing and **no enactment**. VERIFIED status; treat it as not law.

### 3.6 Late fees: VERIFIED
- **RP § 8-208(d)(3)(i):** a lease may not set a late penalty "in excess of 5% of the amount of unpaid rent due".
- **Weekly leases (d)(3)(ii):** "more than $3 per week" or a total "no more than $12 per month".
- **Grace period:** I found **no** statewide statutory grace period (UNVERIFIED absence).

### 3.7 Required disclosures
- **Required lease contents, RP § 8-208(c): VERIFIED.** URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-208&enactments=false
  - "A statement that the premises will be made available in a condition permitting habitation"
  - "The landlord's and the tenant's specific obligations as to heat, gas, electricity, water" and repairs
  - "A receipt for the security deposit as specified in § 8–203.1 of this subtitle."
  - "A copy of the most current version of the Maryland Tenants' Bill of Rights." This was **NEW** under HB 693 (2024). **UNVERIFIED** whether this item took effect Oct. 1, 2024 or Oct. 1, 2025; HB 693 lists both dates.
- **Written lease, § 8-208(a)(1):** landlords offering 5+ units "may not rent a residential dwelling unit without using a written lease."
- **Proposed lease form, § 8-208(b):** on written request, the landlord must give the form "complete in every material detail" before signing (paraphrase). VERIFIED.
- **Deposit receipt, RP § 8-203(c)(1):** "The landlord shall give the tenant a receipt for the security deposit as specified in § 8–203.1 of this subtitle." VERIFIED.
- **Move-in inspection, RP § 8-203** (fetch reported subsection (i)(5)(i); the label is suspect and may belong to § 8-203.1, UNVERIFIED): the tenant "has the right to have the dwelling unit inspected by the landlord in the tenant's presence" "if the tenant requests an inspection by certified mail within 15 days of the tenant's occupancy". The quote is VERIFIED; the subsection label is not.
- **Mold / habitability:** the Tenant Safety Act of 2024 (HB 1117, **Ch. 125**, approved 4/25/2024, **effective Oct. 1, 2024**; amends RP §§ 8-211, 8-212) "clarifying that certain mold hazards constitute dangerous conditions and defects for which a tenant may obtain relief". It also deems a landlord "to warrant the dwelling fit for human habitation". VERIFIED: https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/hb1117?ys=2024RS and SB0946 page.
- **Lead:** the federal rule applies (1.7, VERIFIED). Maryland's own lead-registration law (Environment Art. Title 6, Subtitle 8) was not fetched; **UNVERIFIED**.

### 3.8 Retaliation: VERIFIED
- **Citation:** RP § 8-208.1. URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-208.1&enactments=false
- **Prohibited (a)(1):**
  - "Bring or threaten to bring an action for possession against a tenant;"
  - "Arbitrarily increase the rent or decrease the services to which a tenant has been entitled"
  - "Terminate a periodic tenancy."
- **Protected activity (a)(2):**
  - a good-faith complaint ("provided written or actual notice of a good faith complaint about an alleged violation of the lease")
  - lawsuits and testimony
  - tenants' organization participation
  - "summoned the assistance of law enforcement or emergency services to the property."
- **Damages (c)(1):** "damages not to exceed the equivalent of 3 months' rent, reasonable attorney fees, and court costs."
- **Limits:**
  - (d): the defense is "conditioned on the tenant being current on the rent due and owing to the landlord".
  - (e): no protection "if the alleged retaliatory action occurs more than 6 months after a tenant's action".

### 3.9 Automatic renewal and notice to terminate: VERIFIED
- **Auto-renewal disclosure, RP § 8-208(e).** An automatic-renewal clause (other than one of 1 month or less) must be "distinctly set apart from any other provision" with a space for the tenant's acknowledgment. Without the tenant's initials, signature or witnessed mark it "is unenforceable by the landlord".
- **Landlord notice to quit, RP § 8-402(c)(2)(i):** "a landlord shall provide written notice of the intent to terminate a tenancy:" "If the parties have a written lease for a stated term in excess of 1 week or a tenancy from month to month," "60 days before the expiration of the tenancy;". URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-402&enactments=false
  - Week-to-week: "7 days before the expiration of the tenancy" with a written lease, or 21 days without one.
  - Year-to-year: 90 days.
  - The enacting bill and year for the 60-day rule are **UNVERIFIED**. A 2023 DLS fiscal note already describes 60 days as current law: https://mgaleg.maryland.gov/2023RS/fnotes/bil_0004/hb0684.pdf (search snippet only).
- **Tenant notice, RP § 8-402(c)(3):** a tenant may give oral ("by parol") notice "at least 30 days before the expiration of the lease or tenancy". This does not apply to year-to-year tenancies, and "This paragraph shall not apply in Baltimore City". The **written** notice period for tenants is not separately stated in the excerpt I saw (UNVERIFIED).
- **Holdover, RP § 8-402(d):** with landlord consent the tenant becomes "a periodic month–to–month tenant" unless the lease says otherwise and the tenant initials it (paraphrase).
- **Lease notice periods, RP § 8-208(d)(5):** a lease may not set a tenant notice-to-quit period "less than that provided by applicable law".

### 3.10 Application fee: VERIFIED
- **Citation:** RP § 8-213. URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-213&enactments=false
- **Refund rule:** if non-deposit fees "exceed $25, then the landlord shall return the fees" "not later than 15 days following the date of occupancy or the written communication" that no tenancy will occur.
- **Retention:** "The landlord may retain only that portion of the fees actually expended for a credit check".
- **Penalty:** otherwise the landlord may "be liable for twice the amount of the fees in damages."
- **Exemption (c):** landlords offering 4 or fewer units at one location, and seasonal or condo rentals (paraphrase).
- **No dollar cap** on the fee itself (inference from text, UNVERIFIED).

### 3.11 Early termination: VERIFIED
- **Military, RP § 8-212.1.** Applies when "an active service member or the active service member's spouse enters into a residential lease" and later gets a change of assignment, including "Permanent change of station orders;". Liability after written notice and proof "may not exceed":
  - "Any rent or lawful charges then due and payable plus 30 days' rent."
  - plus tenant-caused damage.
  - SCRA (federal) also applies.
- **Victims of abuse, RP § 8-5A-02 / 8-5A-03.**
  - "if the tenant or legal occupant is a victim of abuse", after written notice, "the tenant shall have 30 days to vacate the leased premises".
  - The tenant is responsible for rent "up to a maximum of 30 days".
  - Documentation (8-5A-03): a protective order, a peace order, or "A copy of a report by a qualified third party" "signed by the qualified third party within the preceding 60 days".

### 3.12 Prohibited lease clauses: VERIFIED
- **RP § 8-208(d).** A landlord may not use a lease with a provision that:
  - (1) "Has the tenant authorize any person to confess judgment on a claim arising out of the lease."
  - (2) requires waiver of "any right or remedy provided by applicable law."
  - (3) sets a late fee over 5% (see 3.6)
  - (4) "Has the tenant waive the right to a jury trial."
  - (5) sets a shorter notice to quit than the law provides
  - (6) allows self-help possession
  - (7) is "against public policy and void under § 8–105 of this title" (see the § 8-105 bullet below)
  - (8) allows eviction "solely as retaliation" for organizing
  - (9) forces electronic rent-increase notices: "Requires the tenant to accept notice of rent increases under § 8–209" by electronic delivery
  - (10) "Limits the ability of a tenant to summon the assistance of law enforcement or emergency services." or penalizes a tenant because someone summoned help
  - (11) requires a move-in payment above deposit plus first month's rent
  - (12) "Waives or places conditions on a tenant's right of first refusal under § 8–119." (NEW via HB 693, 2024)
  - (13) shifts the District Court filing surcharge to the tenant
- **Liability waivers, RP § 8-105:** a clause to "indemnify the landlord, hold the landlord harmless" or "preclude or exonerate the landlord from any liability to the tenant" "arising from any omission, fault, negligence, or other misconduct of the landlord" in common areas "is considered to be against public policy and void." URL: https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=8-105&enactments=false
- **Effect, § 8-208(g):** a prohibited provision "shall be unenforceable by the landlord". The tenant "may recover any actual damages incurred", including "reasonable attorney's fees".
- **Landlord attorney fees:** **not** expressly listed in § 8-208(d) (VERIFIED absence in the fetched list). Do not flag it as void in MD on statute alone.

### 3.13 Montgomery County, MD: mostly UNVERIFIED
The county site (montgomerycountymd.gov) pages I fetched were navigation shells or returned 404. The American Legal code host returned 403. Everything below comes from search snippets of county pages and is **UNVERIFIED** until someone reads the County Code ch. 29 text.
- **24-hour entry notice:** a county DHCA page says tenants may "Receive at least 24 hours' notice prior to a landlord, agent, or contractor entering the premises, except in cases of emergency". A county document cites County Code § 29-26(q). This is now consistent with state RP § 8-221.
- **Lease summary:** a county lease-summary form is required by County Code § 29-27(w), per Executive Regulation 8-17 (eff. May 1, 2018). A lease must not "contain a waiver of notice to quit".
- **Rent stabilization (Bill 15-23; County Code §§ 29-58–29-62; Exec. Reg. 2-24):**
  - Units 23+ years old are covered.
  - The allowance is CPI-U (Washington area) plus 3%, capped at 6%.
  - The cap is 5.2% for the period effective July 1, 2026 and was 5.7% for July 23, 2025–June 30, 2026.
  - Rent increases require 90 days' written notice.
  - Sources disagree on the law's effective date (Oct. 23, 2023 vs. July 23, 2024).
- **2-year lease offer:** not confirmed in anything I fetched (UNVERIFIED).

---

## 4. Compact table (jurisdiction × rule)

Notes on the table:
- **Status:** V = VERIFIED, U = UNVERIFIED.
- **Units:** `days` are calendar days unless noted, and `pct` is a percent.
- **Effective dates:** an empty `effective_from` means the rule is long-standing; no recent change was found.

| jurisdiction | rule_key | value | unit/notes | citation | effective_from | effective_until | status |
|---|---|---|---|---|---|---|---|
| VA | deposit_cap_months | 2 | months of periodic rent; deposit + damage/renter's insurance combined ≤ 2 months | Va. Code §55.1-1226(A); §55.1-1208(A)(7) | | | V |
| VA | deposit_return_days | 45 | after tenancy ends or vacate, whichever later | §55.1-1226(A) | | | V |
| VA | deposit_itemization_required | true | written itemized notice; tenant may attend move-out inspection within 72h of possession | §55.1-1226(A),(G) | | | V |
| VA | deposit_interest_required | false | no interest in current text | §55.1-1226 | | | V |
| VA | entry_notice_hours | null | "notice of intent to enter", no fixed hours; 72h for routine maintenance not requested; none for tenant-requested | §55.1-1229(A) | | | V |
| VA | entry_allowed_times | "reasonable times" | | §55.1-1229(A) | | | V |
| VA | entry_emergency_exception | true | | §55.1-1229(A) | | | V |
| VA | late_fee_cap | min(10% periodic rent, 10% remaining balance) | only if in written lease | §55.1-1204(E) | | 2027-07-01 (section re-versioned) | V |
| VA | late_fee_grace_days | 0 (statute); 5 if no written lease | rent late after the 5th only in default terms | §55.1-1204(C) | | | V |
| VA | move_in_inspection_report | 5 | days after occupancy; tenant objects within 5 days | §55.1-1214 | | | V |
| VA | mold_disclosure | true | in move-in report; tenant may terminate if mold | §55.1-1215 | | | V |
| VA | fee_disclosure_first_page | true | itemized deposit/rent/one-time charges on page 1 | §55.1-1204.1 | 2024 (cc. 788, 826; 2025 c. 567) | | V (exact effective date U) |
| VA | receipts_required | cash and money order | | §55.1-1204(J) | | | V |
| VA | lead_disclosure | federal (pre-1978) | pamphlet + known hazards + warning statement | EPA Sec. 1018 rule | | | V |
| VA | retaliation_presumption | none; tenant bears burden | | §55.1-1258(B) | | 2027-01-01 | V |
| VA | retaliation_2027_rewrite | expanded acts, burden sentence removed | | §55.1-1258 (2026 c. 1111) | 2027-01-01 | | V |
| VA | auto_renewal_allowed | true | | §55.1-1204(A) | | | V |
| VA | mtm_notice_days_either_party | 30 | before next rent due date; lease may vary | §55.1-1253(A) | | | V |
| VA | nonrenewal_notice_days_landlord_gt4_units | 60 | before end of term (also rent-increase notice) | §55.1-1204(K) | | 2027-07-01 | V |
| VA | rent_increase_notice_days_landlord_gt4_units | 90 | + tenant response deadline ≥30 days | §55.1-1204(K) (2026 c. 1066) | 2027-07-01 | | V |
| VA | application_fee_cap_usd | 50 | excl. 3rd-party out-of-pocket; $32 public/HUD housing | §55.1-1203(C) | | | V |
| VA | early_term_military | true | ≥30 days after next rent due; no liquidated damages | §55.1-1235 | | | V |
| VA | early_term_dv | true | 28 days after notice; no liquidated damages; order/charging doc required | §55.1-1236 | | | V |
| VA | void_waiver_of_rights | true | | §55.1-1208(A)(1) | | | V |
| VA | void_confession_of_judgment | true | | §55.1-1208(A)(3) | | | V |
| VA | void_landlord_attorney_fees | true | except as chapter provides | §55.1-1208(A)(4) | | | V |
| VA | void_liability_waiver | true | | §55.1-1208(A)(5) | | | V |
| VA | void_jury_waiver | not in statute | | §55.1-1208 | | | V (absence) |
| VA | void_repair_fee | true | unless tenant violation | §55.1-1208(C) | 2026-07-01 (secondary) | | V text / U date |
| DC | deposit_cap_months | 1 | one month's rent | OTA Tenant Bill of Rights; 14 DCMR 308 | | | V (OTA) / U (reg text) |
| DC | deposit_return_days | 45 | return with interest OR written notice of withholding | 14 DCMR 309.1 (D.C. Law 16-276) | | | V |
| DC | deposit_itemization_days | 30 | after withholding notice; itemized statement (max 75 days total) | 14 DCMR 309.2 | | | V |
| DC | deposit_claim_notice_with_photos | 45 | days; photos/docs + dispute rights; tenant 30 days to dispute | D.C. Code §42-3502.17(e) | 2026-08-14 | | V |
| DC | deposit_interest_required | true | ≥ statement savings rate, reset Jan 1/Jul 1; treble if bad faith | 14 DCMR 311.1 | | | V (12-month threshold U) |
| DC | entry_notice_hours | 48 | written; email/text OK; shorter only by tenant's written consent | §42-3505.51(a)(1) | | | V |
| DC | entry_allowed_times | 09:00-17:00, not Sunday/federal holiday | unless tenant agrees | §42-3505.51(a)(3) | | | V |
| DC | entry_emergency_exception | true | | §42-3505.51(b)(1) | | | V |
| DC | late_fee_cap | 5% of full rent due | once per late payment; no interest; no eviction for late fee | §42-3505.31 | 2016-12-08 | | V |
| DC | late_fee_grace_days | 5 | or longer if lease says | §42-3505.31(b)(2) | | | V |
| DC | move_in_inspection_report | not required | OTA recommends within 5 days | OTA guidance | | | V (absence U) |
| DC | applicant_disclosures | rent, rent-control status, code violations, fees, deposit + interest rate, mold, Tenant Bill of Rights, etc. | | §42-3502.22(b)(1) | | | V |
| DC | habitability_fee_ban | true | no fees for utilities/trash/locks/admin billing etc. | §42-3505.10(b-2) | 2026-08-14 | | V |
| DC | common_area_utility_billing_ban | true | RUBS still allowed | §42-3505.11 | 2027-01-01 | | V |
| DC | receipts_required | true | except personal check paying in full | 14 DCMR 306 (per OTA) | | | V (OTA) / U (reg) |
| DC | lead_disclosure | federal + DC (DOEE form; clearance report if child <6/pregnant) | | 20 DCMR 3300 (per OTA) | | | V (OTA) / U (reg) |
| DC | retaliation_presumption_months | 6 | landlord rebuts by clear and convincing evidence | §42-3505.02(b) | | | V |
| DC | lease_expiry_ends_tenancy | false | tenancy continues; eviction only for statutory cause | §42-3505.01(a)(1) | | | V |
| DC | mtm_notice_days_tenant | 30 | expires 1st day of first month ≥30 days after notice | §42-3505.54(a) | | | V |
| DC | lease_tenant_notice_max_days | 30 | more only if landlord rent-increase notice ≥ that + 30 days | §42-3505.54(b) | 2023-11-28 | | V |
| DC | landlord_no_fault_notice_days | 90 / 120 / 180 | personal use or sale 90; renovation or rehab 120; demolition or discontinuance 180 | §42-3505.01(d)-(i) | | | V |
| DC | application_fee_cap_usd | 50 | CPI-adjustable annually from 2024-01-01; refund in 14 days if no screening | §42-3505.10(b),(c) | | | V (current CPI value U) |
| DC | pre_lease_other_fees_allowed | false | | §42-3505.10(b)(3) | | | V |
| DC | early_term_dv | true | release 14 days after notice; request within 90 days | §42-3505.07 | | | V |
| DC | early_term_military | federal SCRA only | 30 days after next rent due; no fee | 50 U.S.C. §3955 | | | V (no DC statute: U) |
| DC | void_waiver_of_rights | true | | 14 DCMR 304 (per OTA) | | | V (OTA) / U (reg) |
| DC | void_confession_of_judgment | true | | 14 DCMR 304 (per OTA) | | | V (OTA) / U (reg) |
| DC | void_landlord_attorney_fees | true | "Assignment of attorneys fees, notwithstanding court determinations" | 14 DCMR 304 (per OTA) | | | V (OTA) / U (reg) |
| DC | void_liability_waiver | true | | 14 DCMR 304 (per OTA) | | | V (OTA) / U (reg) |
| DC | void_jury_waiver | true | | 14 DCMR 304 (per OTA) | | | V (OTA) / U (reg) |
| DC | bad_faith_treble_damages | true | for 14 DCMR 304 and §§42-3505.53–.55 violations | §42-3509.01(a-2) | 2017-02-18 | | V |
| MD | deposit_cap_months | 1 | 2 only if utility-assistance tenant + pays utilities to landlord + written agreement | RP §8-203(b) | 2024-10-01 (HB 693 Ch. 124) | | V (lease-date applicability U) |
| MD | deposit_return_days | 45 | | RP §8-203(e)(1) | | | V |
| MD | deposit_itemization_days | 45 | late list → forfeit right to withhold for damages | RP §8-203(g) | | | V |
| MD | deposit_interest_required | true | max(1-yr Treasury yield, 1.5%) simple; held ≥6 months; deposit ≥$50 | RP §8-203(e) | | | V |
| MD | entry_notice_hours | 24 | written | RP §8-221 | 2025-10-01 (Ch. 564) | | V |
| MD | entry_allowed_times | 07:00-19:00 Mon-Sat | unless tenant agrees in writing | RP §8-221 | 2025-10-01 | | V |
| MD | late_fee_cap | 5% of unpaid rent due | weekly leases: $3/week, $12/month | RP §8-208(d)(3) | | | V |
| MD | late_fee_grace_days | null | no statewide grace period found | | | | U |
| MD | move_in_inspection_on_request_days | 15 | tenant requests by certified mail within 15 days of occupancy | RP §8-203 (subsection label U) | | | V |
| MD | lease_must_include_tenants_bill_of_rights | true | | RP §8-208(c)(4) | 2024-10-01 or 2025-10-01 | | V (date U) |
| MD | mold_dangerous_condition | true | Tenant Safety Act | RP §8-211 (HB 1117 Ch. 125) | 2024-10-01 | | V |
| MD | retaliation_window_months | 6 | tenant must be current on rent; damages ≤3 months' rent | RP §8-208.1 | | | V |
| MD | auto_renewal_allowed | true, if set apart + tenant acknowledgment | otherwise unenforceable | RP §8-208(e) | | | V |
| MD | mtm_notice_days_landlord | 60 | also for written leases >1 week | RP §8-402(c)(2)(i) | | | V (enacting year U) |
| MD | mtm_notice_days_tenant | 30 (oral notice) | not Baltimore City; written period U | RP §8-402(c)(3) | | | V / U |
| MD | application_fee_refund | fees > $25 refunded within 15 days less actual credit-check cost | 2x damages; ≤4-unit landlords exempt | RP §8-213 | | | V |
| MD | early_term_military | liability ≤ rent due + 30 days' rent | | RP §8-212.1 | | | V |
| MD | early_term_dv | 30 days to vacate; rent ≤30 days | order or third-party report ≤60 days old | RP §8-5A-02, 8-5A-03 | | | V |
| MD | void_waiver_of_rights | true | | RP §8-208(d)(2) | | | V |
| MD | void_confession_of_judgment | true | | RP §8-208(d)(1) | | | V |
| MD | void_landlord_attorney_fees | not in statute | | RP §8-208(d) | | | V (absence) |
| MD | void_liability_waiver | true | landlord negligence in common areas | RP §8-105; §8-208(d)(7) | | | V |
| MD | void_jury_waiver | true | | RP §8-208(d)(4) | | | V |
| MD | void_move_in_over_deposit_plus_first_month | true | | RP §8-208(d)(11) | | | V |
| MD-MontgomeryCo | rent_stabilization_cap_pct | 5.2 | CPI-U + 3%, max 6%; units ≥23 years old | County Code §§29-58–29-62 | 2026-07-01 | | U |
| MD-MontgomeryCo | rent_increase_notice_days | 90 | | County Code ch. 29 | | | U |
| MD-MontgomeryCo | entry_notice_hours | 24 | | County Code §29-26(q)? | | | U |

## Sources (all fetched 2026-10-24 unless marked)

- Virginia, https://law.lis.virginia.gov/vacode/title55.1/chapter12/: §§ 55.1-1203, -1204, -1204.1, -1208, -1214, -1215, -1226, -1229, -1235, -1236, -1253, -1258.
- DC Code, https://code.dccouncil.gov/: §§ 42-3502.17, 42-3502.22, 42-3505.01, 42-3505.02, 42-3505.07, 42-3505.10, 42-3505.11, 42-3505.31, 42-3505.51–.55, 42-3509.01.
- DC law pages: D.C. Law 26-80 (RENTAL Act), 26-156 (Fair Housing Practices Amendment Act of 2026), 21-210, 19-140.
- D.C. Law 16-276 enrolled text: https://code.dccouncil.gov/us/dc/council/laws/docs/16-276.pdf
- OTA, DC Tenant Bill of Rights (2015): https://apia.dc.gov/sites/default/files/dc/sites/apia/publication/attachments/261018445-Bill-of-Rights.pdf
- OTA, Residential Lease Clarification Act FAQ (Dec. 2017): https://ota.dc.gov/sites/default/files/dc/sites/ota/release_content/attachments/Residential%20Lease%20Law%20FAQ-FINAL.pdf. Its "15 days" rule is superseded by D.C. Law 25-65.
- OTA, D.C. Renters' Rights 101 (agency deck, third-party host): https://offcampus.students.gwu.edu/sites/g/files/zaxdzs1161/f/downloads/OTA%20Renters%20Rights%20101%20Final.pdf
- Maryland RP statute pages (mgaleg): §§ 8-105, 8-203, 8-208, 8-208.1, 8-212.1, 8-213, 8-221, 8-402, 8-5A-02, 8-5A-03.
- Maryland bill pages: HB 693 (2024), HB 1117 (2024), SB 946 (2024), HB 1076 (2025), SB 635 (2026).
- EPA lead disclosure: https://www.epa.gov/lead/real-estate-disclosure
- 50 U.S.C. § 3955 (govinfo, 2023 ed.): https://www.govinfo.gov/content/pkg/USCODE-2023-title50/html/USCODE-2023-title50-chap50-subchapIII-sec3955.htm
- SECONDARY: Gentry Locke, 2026 Virginia session summary, https://www.gentrylocke.com/article/virginias-2026-general-assembly-session-brings-significant-changes-for-landlords-and-manufactured-home-park-owners/
- Search snippets only (UNVERIFIED): Montgomery County DHCA tenant-rights and rent-stabilization pages; 2023 DLS fiscal note for HB 684.
