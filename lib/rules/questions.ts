import { RULE_SHEETS } from "@/lib/data/rule-sheets";
import type { ClauseType, LeaseCheck, PriceCheck, Question, ScamCheck, ScamFlagId } from "@/lib/types";
import { questionToSpanish } from "./questions-es";

const MAX = 6;

export const SCAM_Q: Partial<Record<ScamFlagId, Question>> = {
  noInPersonViewing: {
    text: "Can I see the unit in person, or on a live video call, before I pay anything?",
    why: "Rental scammers generally won't show the place (FTC).",
  },
  payBeforeViewing: {
    text: "Can I pay the deposit after I've seen the unit and signed a lease?",
    why: "Asking for money before a viewing is a common scam tactic (FTC).",
  },
  riskyPayment: {
    text: "Can I pay by check or credit card instead?",
    why: "Wire transfers, gift cards, crypto and payment apps are like sending cash: hard to get back (FTC, DC Attorney General).",
  },
  landlordAway: {
    text: "Who will meet me with the keys, and does their ID match the county property records?",
    why: "Fake owners usually claim to be out of the country (FTC).",
  },
  sensitiveInfoEarly: {
    text: "Why do you need my Social Security number or credit report before I've agreed to rent?",
    why: "Until you agree to rent, a landlord doesn't need them, and real landlords pull credit themselves (FTC).",
  },
  priceFarBelow: {
    text: "Why is the rent so far below similar places nearby?",
    why: "Prices well under the local benchmark are a classic bait (FTC).",
  },
};

export function leaseQuestion(type: ClauseType, severity: "conflict" | "ask", lease: LeaseCheck): Question | null {
  const sheet = lease.jurisdiction ? RULE_SHEETS[lease.jurisdiction] : null;
  const where = sheet?.name ?? "your state";
  switch (type) {
    case "landlord_entry":
      return {
        text: sheet?.entry.minHours
          ? `Will you change the entry clause to give me at least ${sheet.entry.minHours} hours' written notice?`
          : "Will you change the entry clause so you give notice before coming in, except in emergencies?",
        why: `${where} requires notice before a landlord enters.`,
      };
    case "waiver_of_rights":
      return { text: "Will you remove the clause where I waive your liability or my rights?", why: `${where} treats these waivers as unenforceable.` };
    case "attorney_fees":
      return { text: "Will you remove the attorney-fees clause or make it apply to both of us?", why: "One-sided fee clauses can cost you a lot in any dispute." };
    case "late_fee":
      return severity === "conflict"
        ? { text: `Can the late fee be lowered to ${where}'s legal limit?`, why: "This fee looks higher than the law allows." }
        : { text: "Exactly how much is the late fee, and how many days do I have before it applies?", why: "Late fees add up fast." };
    case "security_deposit":
      return { text: "Can the deposit be reduced to the legal cap?", why: `${where} limits how large a deposit can be.` };
    case "auto_renewal":
      return {
        text: "What's the exact date I need to give notice by if I don't want to renew, and how do I give it?",
        why: "Miss the deadline and you can be locked into another lease term.",
      };
    case "repairs_on_tenant":
      return { text: "Which repairs would I have to pay for?", why: "Routine upkeep is usually the landlord's job." };
    case "early_termination":
      return { text: "What would it cost me to leave early, and is it in writing?", why: "Early-termination fees are often the biggest surprise." };
    case "rent_increase":
      return { text: "How much can the rent go up at renewal, and how much notice will I get?", why: "Know your costs for next year before you commit." };
    case "other_fee":
      return { text: "Can you list every fee in writing before I sign?", why: "Unlisted fees are a common complaint." };
  }
}

export function buildQuestions(price: PriceCheck, scam: ScamCheck, lease: LeaseCheck, lang: "en" | "es" = "en"): Question[] {
  const out: Question[] = [];
  const add = (q: Question | null | undefined) => {
    if (q && !out.some((o) => o.text === q.text)) out.push(q);
  };

  for (const f of scam.flags) add(SCAM_Q[f.id]);
  for (const f of lease.findings) if (f.severity === "conflict" && f.evidence[0]?.counted) add(leaseQuestion(f.type, "conflict", lease));
  for (const f of lease.findings) if (f.severity === "ask" && f.evidence[0]?.counted) add(leaseQuestion(f.type, "ask", lease));
  if (lease.status === "not_provided")
    add({ text: "Can I read the full lease before I pay a deposit?", why: "Don't pay a security deposit until a lease is signed (DC Attorney General)." });
  if (price.status === "above")
    add({ text: "What's included in the rent: utilities, parking, amenities?", why: "It's well above HUD's local benchmark." });
  if (price.status === "rough")
    add({
      text: "What's included in the rent: utilities, furniture, parking, internet?",
      why: "Per-bedroom prices only allow a rough comparison with area averages, so compare 2–3 nearby listings.",
    });
  add({
    text: "If you search the address online, does the same unit show up with a different price, owner or as for sale?",
    why: "Same place with different contacts, or listed for sale, is a big red flag (FTC).",
  });
  add({
    text: "Who owns the property? Check the county's property records and compare the name with the landlord's ID.",
    why: "The FTC suggests checking tax-assessment records.",
  });
  const top = out.slice(0, MAX);
  return lang === "es" ? top.map(questionToSpanish) : top;
}
