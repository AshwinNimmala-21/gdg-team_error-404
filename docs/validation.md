# Student validation

Two parts: short interviews (does the problem matter to students?) and a usability test on the live site (can someone find the answer fast?). Only real answers go here; nothing is invented or embellished. Participants are numbered, never named.

**Who we talked to (Sun Oct 25, 2026):** 3 people from Virginia Tech: two seniors and one recent graduate. All three are friends of the team, so this is **not a random sample**, and 3 people is a small number. Read it as an early signal, not proof.

**How it was recorded:**
- **Participant 1** answered by text message. Their answers below are **verbatim**, in quotation marks.
- **Participants 2 and 3** answered by phone. Their answers below are **Ashwin's paraphrase** of the calls, written without quotation marks. They are not their exact words.

---

## The questions

**Interview:**
1. Have you or a friend ever seen a rental listing you thought was fake? What tipped you off, or what almost fooled you?
2. Did you understand your lease before you signed it? Which clause or fee surprised you later?
3. If a free tool checked price, scam risk and lease clauses in 10 seconds, would you use it before paying a deposit? What would make you not trust it?

**Usability test:** on the live site, with the "Blacksburg summer sublet" sample: "A friend sent you this listing and wants to know: is this listing safe? Use this site to find out." Then: what did it tell you and why, what confused you, and how much would you trust it (1–5)?

---

## Responses

### Participant 1 (senior)
Friend. Text message, Sun Oct 25, about 9:55 AM. **Verbatim.**

- Seen a fake-seeming listing? "Yes"
- What tipped you off? "It was in a prime locality but the price was way off for that locality"
- Understood your lease before signing? "Yes it was easier as it was through the company rather than individual"
- Any clause or fee surprise you later? "There were a lot of hidden charges under the application"
- What would make you not trust the tool? "I think more than trusting it completely I would see it as more like a caution and be more careful"
- Usability (live site, Blacksburg sample; self-reported, not timed by us):
  - Verdict and time: "No, not safe. Almost gave answer in under a min"
  - What it told him: "It said it was not safe and likely a scam. Because of the pricing and the payments required before signing"
  - Confusing: "Nothing"
  - Trust: 3.5 / 5

### Participant 2 (recent graduate, about 1.5 years ago)
Friend. Phone call, Sun Oct 25, about 10 AM. **Paraphrase, not exact words.**

- Has seen a fake-seeming listing: yes. The red flag was being asked to send the deposit before the lease.
- Understood her lease before signing: yes, but it came with hidden charges.
- Trust: would use it with caution. She was comfortable with it once told that phone numbers and emails are removed before the AI sees the text.
- Usability (live site, Blacksburg sample): said it was not safe / likely a scam and gave the reasons. Nothing confusing. Trust 4 / 5. Time not recorded.

### Participant 3 (senior)
Friend. Phone call, Sun Oct 25, about 10 AM. **Paraphrase, not exact words.**

- Has seen a fake-seeming listing: yes, while finding housing for a co-op. The red flag was being asked to pay earlier than normal.
- Understood his lease before signing: no. It also came with hidden charges.
- Trust: same as Participant 2 (would use it with caution; comfortable once told that phone numbers and emails are removed before the AI sees the text).
- Usability (live site, Blacksburg sample): said it was not safe / likely a scam, with the reasons. Nothing confusing. Trust 3.5 / 5. Time not recorded.

---

## Summary

3 friends from Virginia Tech, not a random sample.

**The problem is real for them:**
- **3 of 3 had seen a fake-seeming listing.** Each red flag they named matches a check Clearlease already runs:

  | What tipped them off | Clearlease check |
  |---|---|
  | Price far below the area ("prime locality but the price was way off") | Price check (far below the local range, flagged when another warning sign is present) |
  | Deposit before the lease | "Asks for money before you've seen the place or signed a lease" |
  | Asked to pay earlier than normal | "Pushes you to decide or pay quickly" |

- **3 of 3 ran into hidden fees or charges.** Clearlease already extracts application fees.
- **2 of 3 understood their lease before signing.**

**The usability test worked:**
- **3 of 3** called the Blacksburg sample a likely scam, with correct reasons.
- **0 of 3** found anything confusing.
- **Mean trust 3.7 / 5** (3.5, 4 and 3.5).
- Only Participant 1 gave a time, self-reported: "under a min". We did not time anyone.

**How they would use it:** all three said they'd treat it as a caution, not a final answer. That matches how Clearlease presents itself: every report says "This is not legal advice" and links to free help.

**Privacy drives trust.** Participants 2 and 3 were comfortable using it once told that contact details are removed before the AI sees the text. Exactly what the browser removes before sending (`lib/client/redact.ts`):
- email addresses
- phone numbers
- SSN-format numbers (123-45-6789)
- long ID or account numbers (10 or more digits)

It does **not** remove names, street addresses, or anything inside a photo. The page asks users to cover names, signatures and account numbers in photos before adding them.

**What we did not test:** whether people understood the "What Gemma read" section, or the lease-photo and Spanish flows.
