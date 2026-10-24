"use client";

import { forwardRef, type ReactNode } from "react";
import { leaseVerdict, priceVerdict, scamVerdict, type Verdict } from "@/lib/client/verdicts";
import type { CheckResult, ClauseFinding, Overrides } from "@/lib/types";
import { EvidenceDrawer, Quote } from "./Evidence";
import type { MapsConfig } from "@/lib/server/maps-config";
import { Community } from "./Community";
import { FactsBar } from "./FactsBar";
import { ListingMap } from "./ListingMap";
import { ToneIcon } from "./Icons";
import { Stamp } from "./Stamp";

const TONE_TEXT = { ok: "text-ok", warn: "text-warn", stop: "text-stop", nil: "text-nil" } as const;

const SEVERITY: Record<ClauseFinding["severity"], Verdict> = {
  conflict: { word: "Fix before signing", tone: "stop" },
  ask: { word: "Ask about this", tone: "warn" },
  standard: { word: "Looks standard", tone: "ok" },
};

function Section({ n, title, verdict, delay, children }: { n: number; title: string; verdict: Verdict; delay: number; children: ReactNode }) {
  return (
    <section id={`s${n}`} aria-labelledby={`s${n}-h`} className="scroll-mt-4 grid grid-cols-[2rem_1fr] gap-x-3 border-t border-rule px-4 py-6 sm:grid-cols-[3rem_1fr] sm:px-8">
      <span aria-hidden className="pt-0.5 font-mono text-2xl leading-none text-ink-soft sm:text-3xl">
        {n}
      </span>
      <div className="min-w-0">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
          <h3 id={`s${n}-h`} className="pt-0.5 text-[19px] leading-tight font-bold">
            {title}
            <span className="sr-only">: {verdict.word}</span>
          </h3>
          <Stamp verdict={verdict} delay={delay} />
        </div>
        {children}
      </div>
    </section>
  );
}

function Lead({ headline, detail }: { headline: string; detail: string }) {
  return (
    <>
      <p className="mt-3 text-lg leading-snug font-semibold">{headline}</p>
      <p className="mt-1 max-w-prose text-[15px] leading-relaxed text-ink-soft">{detail}</p>
    </>
  );
}

interface Props {
  result: CheckResult;
  onRescore: (o: Overrides) => void;
  rescoring: boolean;
  onAddLease: () => void;
  maps: MapsConfig | null;
}

export const Report = forwardRef<HTMLHeadingElement, Props>(function Report({ result: r, onRescore, rescoring, onAddLease, maps }, headingRef) {
  const counted = r.lease.findings;
  return (
    <article aria-labelledby="report-title" aria-busy={rescoring || undefined} className={`rounded-xs border border-rule bg-sheet transition-opacity motion-reduce:transition-none ${rescoring ? "opacity-60" : ""}`}>
      <header className="px-4 pt-5 pb-4 sm:px-8 sm:pt-7">
        <h2 id="report-title" ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold tracking-tight focus:outline-none sm:text-[28px]">
          Your pre-sign report
        </h2>
        <ModeLine r={r} />
        <VerdictStrip r={r} />
        {r.aiInstructions.detected && (
          <div role="note" className="mt-4 flex gap-3 rounded-xs border-2 border-stop bg-stop-tint p-3 text-[15px]">
            <ToneIcon tone="stop" className="mt-0.5 shrink-0 text-stop" />
            <div>
              <p className="font-bold text-stop">This text contained instructions aimed at AI tools. We ignored them.</p>
              {r.aiInstructions.quote && <Quote text={r.aiInstructions.quote} />}
              <p className="mt-1 text-ink-soft">Real landlords don&apos;t hide notes for scam checkers. We count it as a red flag.</p>
            </div>
          </div>
        )}
        {r.meta.notes.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-[14px] text-ink-soft">
            {r.meta.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <FactsBar key={JSON.stringify(r.read)} read={r.read} onSave={onRescore} busy={rescoring} />
      </header>

      <Section n={1} title="Price check" verdict={priceVerdict(r.price)} delay={0}>
        <Lead headline={r.price.headline} detail={r.price.detail} />
        {maps && r.read.zip && <ListingMap config={maps} zip={r.read.zip} place={r.read.areaName} />}
        <EvidenceDrawer items={r.price.evidence} />
      </Section>

      <Section n={2} title="Scam risk" verdict={scamVerdict(r.scam)} delay={140}>
        <Lead headline={r.scam.headline} detail={r.scam.detail} />
        {r.scam.flags.length > 0 && (
          <ul className="mt-4 space-y-4">
            {r.scam.flags.map((f) => (
              <li key={f.id} className="flex gap-3">
                <ToneIcon tone={f.weight === 2 ? "stop" : "warn"} className={`mt-0.5 shrink-0 ${f.weight === 2 ? "text-stop" : "text-warn"}`} />
                <div className="min-w-0">
                  <p className="font-semibold">
                    {f.label}
                    <span className="sr-only">{f.weight === 2 ? " (strong warning sign)" : " (warning sign)"}</span>
                  </p>
                  {f.evidence[0]?.quote && <Quote text={f.evidence[0].quote} from={f.evidence[0].quoteFrom} />}
                  {!f.evidence[0]?.quote && f.evidence[0]?.value && <p className="mt-1 text-[15px] text-ink-soft">{f.id === "priceFarBelow" ? "See the price check above." : f.evidence[0].value}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
        {r.community && <Community data={r.community} />}
        <EvidenceDrawer
          label="Show sources"
          items={[
            ...r.scam.flags.flatMap((f) =>
              f.evidence.map((e) => ({ ...e, label: f.heuristic && !e.source ? `${f.label}. This is a Clearlease rule of thumb.` : f.label })),
            ),
            ...r.scam.dropped,
          ]}
        />
      </Section>

      <Section n={3} title="Lease clauses" verdict={leaseVerdict(r.lease)} delay={280}>
        <Lead headline={r.lease.headline} detail={r.lease.detail} />
        {r.lease.status === "not_provided" && (
          <button
            type="button"
            onClick={onAddLease}
            className="mt-3 inline-flex min-h-11 items-center rounded-xs border-2 border-pen px-4 font-semibold text-pen hover:bg-pen hover:text-white"
          >
            Add a photo of the lease
          </button>
        )}
        {counted.length > 0 && (
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {counted.map((f, i) => (
              <li key={i} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold">{f.title}</p>
                  <span className={`inline-flex items-center gap-1 text-[14px] font-semibold ${f.evidence[0].counted ? TONE_TEXT[SEVERITY[f.severity].tone] : "text-ink-soft"}`}>
                    <ToneIcon tone={f.evidence[0].counted ? SEVERITY[f.severity].tone : "nil"} className="h-4 w-4" />
                    {f.evidence[0].counted ? SEVERITY[f.severity].word : "Not counted"}
                  </span>
                </div>
                <p className="mt-1 text-[15px] leading-relaxed">{f.plain}</p>
                <Quote text={f.evidence[0].quote ?? ""} from={f.evidence[0].quoteFrom} />
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{f.why}</p>
                {f.law && (
                  <p className="mt-1 text-[14px] leading-relaxed">
                    <span className="text-ink-soft">{f.law.rule} </span>
                    <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={f.law.url} target="_blank" rel="noreferrer">
                      {f.law.citation}
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <section aria-labelledby="questions" className="border-t-2 border-ink px-4 py-6 sm:px-8">
        <h3 id="questions" className="text-[19px] font-bold">
          Questions to ask before you sign
        </h3>
        <ol className="mt-3 space-y-3">
          {r.questions.map((q, i) => (
            <li key={q.text} className="grid grid-cols-[1.75rem_1fr] gap-2">
              <span aria-hidden className="font-mono text-ink-soft">
                {i + 1}.
              </span>
              <div>
                <p className="font-semibold">{q.text}</p>
                <p className="text-[14px] text-ink-soft">{q.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-rule bg-paper/50 px-4 py-5 text-[14px] sm:px-8">
        <p className="font-semibold">This is not legal advice. Clearlease checks a few common rules; it can&apos;t see everything.</p>
        <p className="mt-2 text-ink-soft">Free help{r.read.jurisdiction ? ` in ${r.read.jurisdiction === "DC" ? "DC" : r.read.jurisdiction === "VA" ? "Virginia" : "Maryland"}` : ""}:</p>
        <ul className="mt-1 space-y-1">
          {r.help.map((h) => (
            <li key={h.url}>
              <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={h.url} target="_blank" rel="noreferrer">
                {h.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
});

/** All three verdicts at a glance (on a phone the stamps are a scroll apart). */
function VerdictStrip({ r }: { r: CheckResult }) {
  const rows = [
    ["Price", priceVerdict(r.price)],
    ["Scam risk", scamVerdict(r.scam)],
    ["Lease", leaseVerdict(r.lease)],
  ] as const;
  return (
    <ol aria-label="Summary" className="mt-4 grid gap-1.5 sm:grid-cols-3 sm:gap-3">
      {rows.map(([label, v], i) => (
        <li key={label}>
          <a href={`#s${i + 1}`} className={`inline-flex min-h-8 items-center gap-1.5 text-[15px] font-semibold hover:underline ${TONE_TEXT[v.tone]}`}>
            <ToneIcon tone={v.tone} className="h-4 w-4 shrink-0" />
            <span className="text-ink-soft">{label}:</span> {v.word}
          </a>
        </li>
      ))}
    </ol>
  );
}

function ModeLine({ r }: { r: CheckResult }) {
  const secs = (r.meta.latencyMs / 1000).toFixed(1);
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-[13px]">
      {r.meta.mode === "live" && (
        <span className="rounded-xs border border-rule px-2 py-0.5 text-ink-soft">
          Read by Gemma 4 (<code className="font-mono">{r.meta.model}</code>) in {secs} s
        </span>
      )}
      {r.meta.mode === "mock" && (
        <span className="rounded-xs border border-warn bg-warn-tint px-2 py-0.5 text-warn">
          Demo mode: no AI call. Sample answers are pre-recorded in Gemma&apos;s format.
        </span>
      )}
      {r.meta.mode === "rules-only" && <span className="rounded-xs border border-rule px-2 py-0.5 text-ink-soft">Updated with your edits (no new AI call)</span>}
      {!r.meta.dataLive && (
        <span className="rounded-xs border border-rule px-2 py-0.5 text-ink-soft">Saved figures: HUD FY2027 FMR, Census ACS 2020–2024 (live lookup unavailable)</span>
      )}
    </div>
  );
}
