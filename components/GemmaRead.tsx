"use client";

import type { ReactNode } from "react";
import type { Extraction } from "@/lib/ai/schema";
import { highlightRanges } from "@/lib/client/highlight";
import { findQuote, makeCorpus } from "@/lib/rules/quotes";
import type { CheckResult } from "@/lib/types";
import { Caret } from "./Icons";

const SIGNAL_LABELS: Record<keyof Extraction["signals"], string> = {
  payBeforeViewing: "Money before a viewing or lease",
  riskyPayment: "Payment method",
  noInPersonViewing: "No in-person viewing",
  landlordAway: "Owner away",
  pressure: "Pressure to act fast",
  offPlatformContact: "Contact off the listing site",
  sensitiveInfoEarly: "SSN or credit report early",
};

interface Fact {
  label: string;
  value: string;
  quote: string | null;
}

const short = (q: string) => (q.length > 90 ? `${q.slice(0, 87).trimEnd()}…` : q);
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function factsOf(x: Extraction): Fact[] {
  const l = x.listing;
  const out: Fact[] = [];
  if (l.rent.amount !== null) out.push({ label: "Rent", value: `${usd(l.rent.amount)} a month`, quote: l.rent.quote });
  if (l.bedrooms.count !== null) out.push({ label: "Size", value: l.bedrooms.count === 0 ? "Studio" : `${l.bedrooms.count} bedroom`, quote: l.bedrooms.quote });
  if (l.zip.value) out.push({ label: "ZIP", value: l.zip.value, quote: l.zip.quote });
  if (l.deposit.amount !== null) out.push({ label: "Deposit", value: usd(l.deposit.amount), quote: l.deposit.quote });
  if (l.applicationFee.amount !== null) out.push({ label: "Application fee", value: usd(l.applicationFee.amount), quote: l.applicationFee.quote });
  for (const [id, s] of Object.entries(x.signals) as [keyof Extraction["signals"], Extraction["signals"][keyof Extraction["signals"]]][]) {
    if (s.present) out.push({ label: SIGNAL_LABELS[id], value: "Mentioned", quote: s.quote });
  }
  if (x.aiInstructions.present) out.push({ label: "Instructions aimed at AI tools", value: "Found and ignored", quote: x.aiInstructions.quote });
  return out;
}

/** The source text with every verified quote marked. Screen readers hear "quote start/end" around each mark. */
function Marked({ source, quotes }: { source: string; quotes: string[] }) {
  const ranges = highlightRanges(source, quotes);
  const parts: ReactNode[] = [];
  let at = 0;
  ranges.forEach(([s, e], i) => {
    if (s > at) parts.push(source.slice(at, s));
    parts.push(
      <mark key={i} className="rounded-[2px] bg-pen-tint px-0.5 text-ink">
        <span className="sr-only">[quote start] </span>
        {source.slice(s, e)}
        <span className="sr-only"> [quote end]</span>
      </mark>,
    );
    at = e;
  });
  if (at < source.length) parts.push(source.slice(at));
  return (
    <>
      <p className="mt-1 text-[13px] text-ink-soft">
        {ranges.length} passage{ranges.length === 1 ? "" : "s"} highlighted
      </p>
      <p className="mt-2 font-mono text-[13.5px] leading-relaxed break-words whitespace-pre-wrap text-ink">{parts}</p>
    </>
  );
}

export function GemmaRead({ result: r, sourceText, imageUrl }: { result: CheckResult; sourceText: string; imageUrl: string | null }) {
  const x = r.extraction;
  const corpus = makeCorpus(sourceText, x.imageTranscript);
  const facts = factsOf(x).map((f) => ({ ...f, where: findQuote(f.quote, corpus) }));
  const clauseQuotes = x.clauses.map((c) => ({ quote: c.quote, where: findQuote(c.quote, corpus) }));
  const verified = facts.filter((f) => f.where).length + clauseQuotes.filter((c) => c.where).length;
  const total = facts.length + clauseQuotes.length;
  const live = r.meta.mode === "live";
  const who = live ? `Gemma 4 (${r.meta.model})` : r.meta.mode === "saved" ? "Gemma 4 (saved answer)" : r.meta.mode === "rules-only" ? "Gemma 4 (earlier read)" : "Demo mode";
  const all = [...facts, ...clauseQuotes];
  const textQuotes = all.filter((f) => f.where === "text").map((f) => f.quote!);
  const imageQuotes = all.filter((f) => f.where === "image").map((f) => f.quote!);
  const hasText = sourceText.trim().length > 0;
  const transcript = x.imageTranscript;

  return (
    <section aria-labelledby="gemma-read-h" className="border-t border-rule px-4 pt-6 pb-7 sm:px-8">
      <h3 id="gemma-read-h" className="text-[20px] leading-tight font-bold tracking-[-0.01em]">
        What Gemma read
      </h3>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-soft">
        {who} turned your {transcript ? (hasText ? "text and photo" : "photo") : "text"} into the facts below, each with the exact words it came from. Our
        code checked every quote against what you shared ({verified} of {total} found) and made the verdicts. The model never sets a price, a score or a
        legal rule.
      </p>

      {facts.length > 0 && (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {facts.map((f, i) => (
            <div key={i} className="min-w-0 border-l-[3px] border-rule pl-3">
              <dt className="text-[13px] font-semibold tracking-wide text-ink-soft uppercase">{f.label}</dt>
              <dd className="text-[15px] font-semibold">
                {f.value}
                {!f.where && <span className="ml-2 text-[13px] font-normal text-ink-soft">(quote not found, not used)</span>}
              </dd>
              {f.quote && <dd className="mt-0.5 font-mono text-[13px] leading-snug break-words text-ink-soft">“{short(f.quote)}”</dd>}
            </div>
          ))}
        </dl>
      )}
      {facts.length === 0 && x.clauses.length === 0 && (
        <p className="mt-4 text-[15px]">Gemma didn&apos;t find rent, size, ZIP, scam signs or lease clauses in this input.</p>
      )}

      {x.clauses.length > 0 && (
        <p className="mt-4 text-[15px]">
          <span className="font-semibold">Lease clauses found ({x.clauses.length}):</span>{" "}
          {x.clauses.map((c) => c.type.replace(/_/g, " ")).join(", ")}. Each is explained in the lease section above, and highlighted below.
        </p>
      )}

      {(hasText || transcript) && (
        <details className="group mt-4">
          <summary className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-pen hover:text-pen-dark">
            <Caret className="caret transition-transform motion-reduce:transition-none" />
            Show the quotes in {transcript && !hasText ? "the photo" : "your text"}
          </summary>
          <div className="mt-2 space-y-5">
            {hasText && (
              <div>
                <p className="text-[14px] font-semibold">Your text, as sent (phone numbers and emails removed on your device)</p>
                <Marked source={sourceText} quotes={textQuotes} />
              </div>
            )}
            {transcript && (
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob or sample preview
                  <img src={imageUrl} alt="The photo you shared" className="w-32 rounded-xs border border-rule object-cover object-top" />
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">Text Gemma transcribed from the photo</p>
                  <Marked source={transcript} quotes={imageQuotes} />
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
