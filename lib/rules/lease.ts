import type { Extraction } from "@/lib/ai/schema";
import { RULE_SHEETS, type RuleSheet } from "@/lib/data/rule-sheets";
import type { ClauseFinding, ClauseType, Jurisdiction, LeaseCheck } from "@/lib/types";
import { money } from "./price";
import { findQuote, numberInQuote, type Corpus } from "./quotes";

type Clause = Extraction["clauses"][number];
type Severity = ClauseFinding["severity"];

const TITLES: Record<ClauseType, Partial<Record<Severity, string>> & { default: string }> = {
  auto_renewal: { default: "Lease renews automatically", conflict: "Move-out notice is longer than the law allows" },
  landlord_entry: { default: "When the landlord can come in", conflict: "Landlord can enter without enough notice" },
  late_fee: { default: "Late fee", conflict: "Late fee is higher than the law allows", standard: "Late fee is within the legal limit" },
  security_deposit: { default: "Security deposit", conflict: "Deposit is higher than the legal cap", standard: "Deposit is within the legal cap" },
  early_termination: { default: "Cost of leaving early" },
  waiver_of_rights: { default: "You give up rights or the landlord's liability" },
  attorney_fees: { default: "You pay the landlord's legal fees" },
  repairs_on_tenant: { default: "Repairs are put on you" },
  rent_increase: { default: "Rent can go up" },
  other_fee: { default: "Extra fees" },
};

const ORDER: Record<Severity, number> = { conflict: 0, ask: 1, standard: 2 };

function judge(c: Clause, sheet: RuleSheet | null, rent: number | null): { severity: Severity; why: string } {
  if (!sheet) return { severity: "ask", why: "Add the ZIP code so we can compare this with your state's rules." };
  const where = sheet.name;
  switch (c.type) {
    case "landlord_entry": {
      const h = c.noticeHours;
      if (h === 0) return { severity: "conflict", why: `${where} requires notice before a landlord enters, except in an emergency.` };
      if (h !== null && sheet.entry.minHours !== null && h < sheet.entry.minHours)
        return { severity: "conflict", why: `${where} requires at least ${sheet.entry.minHours} hours' notice; this lease gives ${h}.` };
      if (h === null) return { severity: "ask", why: "The clause doesn't say how much notice you'll get. Ask for it in writing." };
      return { severity: "standard", why: `${h} hours' notice meets ${where}'s rule.` };
    }
    case "security_deposit": {
      if (c.amount === null || rent === null) return { severity: "ask", why: "We couldn't compare the deposit with the rent." };
      const cap = rent * sheet.depositCapMonths;
      const months = sheet.depositCapMonths === 1 ? "one month's" : `${sheet.depositCapMonths} months'`;
      return c.amount > cap + 0.5
        ? { severity: "conflict", why: `${money(c.amount)} is more than ${months} rent (${money(cap)}), the cap in ${where}.` }
        : { severity: "standard", why: `${money(c.amount)} is within ${where}'s cap of ${months} rent.` };
    }
    case "late_fee": {
      const pct = c.percent ?? (c.amount !== null && rent ? (c.amount / rent) * 100 : null);
      const grace = sheet.lateFeeMinGraceDays;
      if (grace !== null && c.graceDays !== null && c.graceDays < grace)
        return { severity: "conflict", why: `${where} doesn't allow a late fee until rent is ${grace} days late.` };
      if (pct === null) return { severity: "ask", why: "Ask exactly how much the late fee is and when it starts." };
      const shown = `${Math.round(pct * 10) / 10}%`;
      return pct > sheet.lateFeeCapPercent + 0.05
        ? { severity: "conflict", why: `This fee is ${shown} of the rent; ${where} caps late fees at ${sheet.lateFeeCapPercent}%.` }
        : { severity: "standard", why: `This fee is ${shown} of the rent, under ${where}'s ${sheet.lateFeeCapPercent}% cap.` };
    }
    case "waiver_of_rights":
      return { severity: "conflict", why: `${where} treats waivers like this as unenforceable, but signing it can still cause trouble.` };
    case "attorney_fees":
      return sheet.attorneyFeesProhibited
        ? { severity: "conflict", why: `${where} limits clauses that make you pay the landlord's lawyer.` }
        : { severity: "ask", why: "Ask whether this applies both ways and only when a court awards fees." };
    case "auto_renewal":
      if (sheet.autoRenewalMaxNoticeDays !== null && c.noticeDays !== null && c.noticeDays > sheet.autoRenewalMaxNoticeDays)
        return {
          severity: "conflict",
          why: `${where} voids clauses requiring more than ${sheet.autoRenewalMaxNoticeDays} days' notice at the end of the first term.`,
        };
      return {
        severity: "ask",
        why: c.noticeDays !== null ? `Put a reminder in your calendar: you must give ${c.noticeDays} days' notice or you're locked in again.` : "Ask how and when you have to give notice if you don't want to renew.",
      };
    case "repairs_on_tenant":
      if (sheet.maintenanceWaiverProhibited)
        return { severity: "conflict", why: `${where} doesn't let a lease shift the landlord's basic maintenance duties to you.` };
      if (sheet.blanketRepairsProhibited && BLANKET_REPAIRS.test(c.quote))
        return {
          severity: "conflict",
          why: `This puts all repairs on you, whatever the cause. ${where} makes the landlord responsible for repairs and basic systems, and doesn't let a landlord charge you for repairs you didn't cause.`,
        };
      return { severity: "ask", why: "Ask which repairs you'd pay for. Damage you cause is normal; routine upkeep usually isn't." };
    default:
      return { severity: "ask", why: "Ask the landlord to explain this in writing before you sign." };
  }
}

// A repair clause that covers everything, not just damage the tenant causes.
const BLANKET_REPAIRS = /\b(all|any and all|every)\s+(repairs?|maintenance)\b|regardless of (the )?(cause|fault|who)|whether or not (caused|the tenant)/i;

/** Lease text often states the deposit as a plain fact ("Security deposit: $3,000") rather than a clause. Check it anyway. */
function depositAsClause(x: Extraction, corpus: Corpus): Clause | null {
  if (x.clauses.some((c) => c.type === "security_deposit")) return null;
  const d = x.listing.deposit;
  if (d.amount === null || !findQuote(d.quote, corpus) || !numberInQuote(d.amount, d.quote)) return null;
  return {
    type: "security_deposit",
    quote: d.quote!,
    plain: `The lease asks for a ${money(d.amount)} security deposit.`,
    noticeHours: null,
    noticeDays: null,
    graceDays: null,
    amount: d.amount,
    percent: null,
  };
}

export function computeLease(x: Extraction, corpus: Corpus, jurisdiction: Jurisdiction | null, rent: number | null): LeaseCheck {
  const sheet = jurisdiction ? RULE_SHEETS[jurisdiction] : null;
  const hasLease = x.inputKinds.includes("lease") || x.clauses.length > 0;

  if (!hasLease) {
    return {
      status: "not_provided",
      headline: "No lease added",
      detail: "Add a photo of the lease to check its clauses against your state's rules before you sign.",
      jurisdiction,
      findings: [],
    };
  }

  const deposit = depositAsClause(x, corpus);
  const clauses = deposit ? [...x.clauses, deposit] : x.clauses;
  const findings: ClauseFinding[] = clauses.map((c) => {
    const where = findQuote(c.quote, corpus);
    const { severity, why } = judge(c, sheet, rent);
    const law = sheet?.laws[c.type] ?? null;
    const t = TITLES[c.type];
    return {
      type: c.type,
      severity: where ? severity : "ask",
      title: t[severity] ?? t.default,
      plain: c.plain,
      why: where ? why : "We couldn't match this clause to the exact text, so we didn't count it. Read the original wording.",
      law,
      evidence: [
        { label: "From your lease", quote: c.quote, quoteFrom: where ?? undefined, counted: where !== null, source: law ? { name: law.citation, url: law.url } : undefined },
      ],
    };
  });
  findings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  const counted = findings.filter((f) => f.evidence[0].counted);
  const conflicts = counted.filter((f) => f.severity === "conflict").length;
  const asks = counted.filter((f) => f.severity === "ask").length;
  const where = sheet?.name ?? "your state";

  if (conflicts > 0)
    return {
      status: "fix",
      headline: `${conflicts} clause${conflicts > 1 ? "s" : ""} may conflict with ${where} law`,
      detail: "Ask the landlord to remove or rewrite these before you sign. Get answers in writing.",
      jurisdiction,
      findings,
    };
  if (asks > 0)
    return {
      status: "ask",
      headline: `Ask about ${asks} clause${asks > 1 ? "s" : ""}`,
      detail: sheet ? "Nothing clearly conflicts with the rules we check, but these deserve a clear answer." : "Add the ZIP code to compare these with your state's rules.",
      jurisdiction,
      findings,
    };
  return {
    status: "standard",
    headline: findings.length ? "The clauses we check look standard" : "We didn't find the clauses we check",
    detail: "We check deposits, late fees, entry, renewal, waivers, legal fees, repairs and extra fees. Still read the whole lease.",
    jurisdiction,
    findings,
  };
}
