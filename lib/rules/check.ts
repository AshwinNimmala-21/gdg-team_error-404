import type { Extraction } from "@/lib/ai/schema";
import type { Benchmarks } from "@/lib/data/benchmarks";
import { helpLinksFor } from "@/lib/data/help";
import { lookupZip, stateForZip } from "@/lib/data/zip-areas";
import type { CheckResult, Evidence, Overrides } from "@/lib/types";
import { computeLease } from "./lease";
import { bedLabel, computePrice, FAR_BELOW_ALONE, FAR_BELOW_WITH_FLAGS, money } from "./price";
import { bedroomsInQuote, findQuote, makeCorpus, numberInQuote, type Corpus } from "./quotes";
import { buildQuestions } from "./questions";
import { computeScam } from "./scam";

export interface ResolvedFacts {
  rent: number | null;
  bedrooms: number | null;
  zip: string | null;
  rentEvidence?: Evidence;
  bedroomsEvidence?: Evidence;
  /** Rent is per bedroom or per person in a unit of `bedrooms` bedrooms (verified quotes). */
  perUnit?: { basis: "per_bedroom" | "per_person"; evidence: Evidence };
  /** Sublet, summer or short-term rental (verified quote). */
  shortTerm?: Evidence;
  notes: string[];
}

/** Decide which facts we trust: user overrides first, then model facts whose quotes check out. */
export function resolveFacts(x: Extraction, corpus: Corpus, overrides: Overrides = {}, formZip?: string): ResolvedFacts {
  const notes: string[] = [];

  let rent: number | null = null;
  let rentEvidence: Evidence | undefined;
  if (overrides.rent !== undefined) {
    rent = overrides.rent;
    rentEvidence = { label: "Rent you entered", value: `${money(rent)} a month`, counted: true };
  } else if (x.listing.rent.amount !== null) {
    const where = findQuote(x.listing.rent.quote, corpus);
    if (where && numberInQuote(x.listing.rent.amount, x.listing.rent.quote)) {
      rent = x.listing.rent.amount;
      rentEvidence = { label: "Asking rent we read", quote: x.listing.rent.quote!, quoteFrom: where, value: `${money(rent)} a month`, counted: true };
    } else notes.push("We couldn't confirm the rent in your text, so we left it out.");
  }

  let bedrooms: number | null = null;
  let bedroomsEvidence: Evidence | undefined;
  if (overrides.bedrooms !== undefined) {
    bedrooms = overrides.bedrooms;
    bedroomsEvidence = { label: "Bedrooms you entered", value: bedLabel(bedrooms), counted: true };
  } else if (x.listing.bedrooms.count !== null) {
    const where = findQuote(x.listing.bedrooms.quote, corpus);
    if (where && bedroomsInQuote(x.listing.bedrooms.count, x.listing.bedrooms.quote)) {
      bedrooms = x.listing.bedrooms.count;
      bedroomsEvidence = { label: "Size we read", quote: x.listing.bedrooms.quote!, quoteFrom: where, value: bedLabel(bedrooms), counted: true };
    } else notes.push("We couldn't confirm the number of bedrooms, so we left it out.");
  }

  // Per-bedroom / per-person rent: compare against the whole unit's benchmark, so the bedroom count we use is the unit's.
  let perUnit: ResolvedFacts["perUnit"];
  const basis = x.listing.priceBasis;
  if ((basis.value === "per_bedroom" || basis.value === "per_person") && findQuote(basis.quote, corpus)) {
    const ub = x.listing.unitBedrooms;
    const ubWhere = findQuote(ub.quote, corpus);
    if (overrides.bedrooms === undefined && ub.count !== null && ub.count >= 2 && ubWhere && bedroomsInQuote(ub.count, ub.quote)) {
      bedrooms = ub.count;
      bedroomsEvidence = { label: "Size of the whole unit we read", quote: ub.quote!, quoteFrom: ubWhere, value: bedLabel(ub.count), counted: true };
    }
    if (bedrooms !== null && bedrooms >= 2)
      perUnit = {
        basis: basis.value,
        evidence: {
          label: basis.value === "per_bedroom" ? "Rent is per bedroom" : "Rent is per person",
          quote: basis.quote!,
          quoteFrom: findQuote(basis.quote, corpus)!,
          counted: true,
        },
      };
  }
  const st = x.listing.shortTerm;
  const stWhere = st.present ? findQuote(st.quote, corpus) : null;
  const shortTerm: Evidence | undefined = stWhere ? { label: "Sublet or short-term rental", quote: st.quote!, quoteFrom: stWhere, counted: true } : undefined;

  let zip: string | null = overrides.zip ?? (formZip || null);
  if (!zip && x.listing.zip.value) {
    const where = findQuote(x.listing.zip.quote, corpus);
    if (where && x.listing.zip.quote?.includes(x.listing.zip.value)) zip = x.listing.zip.value;
    else notes.push("We couldn't confirm the ZIP code, so we left it out.");
  }

  return { rent, bedrooms, zip, rentEvidence, bedroomsEvidence, perUnit, shortTerm, notes };
}

export function runRules(args: {
  extraction: Extraction;
  text: string;
  facts: ResolvedFacts;
  benchmarks: Benchmarks;
  lang?: "en" | "es";
}): Omit<CheckResult, "meta" | "extraction" | "community"> & { notes: string[] } {
  const { extraction: x, text, facts, benchmarks, lang = "en" } = args;
  const corpus = makeCorpus(text, x.imageTranscript);
  const jurisdiction = facts.zip ? (lookupZip(facts.zip)?.state ?? stateForZip(facts.zip)) : null;

  const basePrice = computePrice(facts, benchmarks);
  const scam = computeScam(x, corpus, basePrice, `${text}\n${x.imageTranscript ?? ""}`);
  const suspicious = scam.flags.some((f) => f.id === "priceFarBelow");
  const price = suspicious ? { ...basePrice, suspicious, detail: basePrice.detail.replace(FAR_BELOW_ALONE, FAR_BELOW_WITH_FLAGS) } : basePrice;
  const lease = computeLease(x, corpus, jurisdiction, facts.rent);
  const questions = buildQuestions(price, scam, lease, lang);
  const ai = scam.flags.find((f) => f.id === "aiInstructions");
  // A question about renting ("is $600 for a room normal?") gets "what we can check" instead of three empty verdicts.
  // Only when nothing checkable was found, so a real listing the model mislabels still gets its report.
  const checkable = x.inputKinds.some((k) => k === "listing" || k === "message" || k === "lease");
  const question = !checkable && !(facts.rent !== null && facts.zip !== null) && x.clauses.length === 0 && !ai;

  return {
    inputType: question ? "question" : "check",
    read: {
      rent: facts.rent,
      bedrooms: facts.bedrooms,
      zip: facts.zip,
      kinds: x.inputKinds,
      jurisdiction,
      areaName: benchmarks.area?.place ?? null,
      priceBasis: facts.perUnit?.basis ?? null,
    },
    price,
    scam,
    lease,
    questions,
    aiInstructions: { detected: Boolean(ai), quote: ai?.evidence[0]?.quote ?? null },
    help: helpLinksFor(jurisdiction, facts.zip),
    notes: facts.notes,
  };
}
