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

  let zip: string | null = overrides.zip ?? (formZip || null);
  if (!zip && x.listing.zip.value) {
    const where = findQuote(x.listing.zip.quote, corpus);
    if (where && x.listing.zip.quote?.includes(x.listing.zip.value)) zip = x.listing.zip.value;
    else notes.push("We couldn't confirm the ZIP code, so we left it out.");
  }

  return { rent, bedrooms, zip, rentEvidence, bedroomsEvidence, notes };
}

export function runRules(args: {
  extraction: Extraction;
  text: string;
  facts: ResolvedFacts;
  benchmarks: Benchmarks;
}): Omit<CheckResult, "meta" | "extraction" | "community"> & { notes: string[] } {
  const { extraction: x, text, facts, benchmarks } = args;
  const corpus = makeCorpus(text, x.imageTranscript);
  const jurisdiction = facts.zip ? (lookupZip(facts.zip)?.state ?? stateForZip(facts.zip)) : null;

  const basePrice = computePrice(facts, benchmarks);
  const scam = computeScam(x, corpus, basePrice, `${text}\n${x.imageTranscript ?? ""}`);
  const suspicious = scam.flags.some((f) => f.id === "priceFarBelow");
  const price = suspicious ? { ...basePrice, suspicious, detail: basePrice.detail.replace(FAR_BELOW_ALONE, FAR_BELOW_WITH_FLAGS) } : basePrice;
  const lease = computeLease(x, corpus, jurisdiction, facts.rent);
  const questions = buildQuestions(price, scam, lease);
  const ai = scam.flags.find((f) => f.id === "aiInstructions");

  return {
    read: {
      rent: facts.rent,
      bedrooms: facts.bedrooms,
      zip: facts.zip,
      kinds: x.inputKinds,
      jurisdiction,
      areaName: benchmarks.area?.place ?? null,
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
