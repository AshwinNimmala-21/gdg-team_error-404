"use client";

import { forwardRef, useState, type ReactNode } from "react";
import { leaseVerdict, priceVerdict, scamVerdict, type Tone, type Verdict } from "@/lib/client/verdicts";
import type { MapsConfig } from "@/lib/server/maps-config";
import type { CheckResult, ClauseFinding, Overrides } from "@/lib/types";
import { Community } from "./Community";
import { AiBanner, EvidenceDrawer, Quote } from "./Evidence";
import { FactsBar } from "./FactsBar";
import { GemmaRead } from "./GemmaRead";
import { useLang, useTr } from "./Lang";
import { ToneIcon } from "./Icons";
import { ListingMap } from "./ListingMap";
import { InkFilter, Stamp } from "./Stamp";

const TONE_TEXT: Record<Tone, string> = { ok: "text-ok", warn: "text-warn", stop: "text-stop", nil: "text-nil" };

const GROUPS: { severity: ClauseFinding["severity"]; key: "fix" | "askAbout" | "standard"; tone: Tone }[] = [
  { severity: "conflict", key: "fix", tone: "stop" },
  { severity: "ask", key: "askAbout", tone: "warn" },
  { severity: "standard", key: "standard", tone: "ok" },
];

/** Quiet verdict reminder next to a section title: icon + word, no border. The stamp lives on the board. */
function ToneTag({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[15px] font-semibold ${TONE_TEXT[verdict.tone]}`}>
      <ToneIcon tone={verdict.tone} className="h-4 w-4 shrink-0" />
      {verdict.word}
    </span>
  );
}

function Section({ id, title, verdict, children }: { id: string; title: string; verdict: Verdict; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-4 border-t border-rule px-4 pt-6 pb-7 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={`${id}-h`} className="text-[20px] leading-tight font-bold tracking-[-0.01em]">
          {title}
          <span className="sr-only">: {verdict.word}</span>
        </h3>
        <span aria-hidden>
          <ToneTag verdict={verdict} />
        </span>
      </div>
      {children}
    </section>
  );
}

function Lead({ headline, detail }: { headline: string; detail: string }) {
  return (
    <>
      <p className="mt-3 max-w-[60ch] text-[18px] leading-snug font-semibold">{headline}</p>
      <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-ink-soft">{detail}</p>
    </>
  );
}

interface Props {
  result: CheckResult;
  onRescore: (o: Overrides) => void;
  rescoring: boolean;
  onAddLease: () => void;
  maps: MapsConfig | null;
  /** The text exactly as sent (after on-device redaction), for highlighting quotes. */
  sourceText: string;
  /** Local preview of the photo, if one was sent. */
  imageUrl: string | null;
}

export const Report = forwardRef<HTMLHeadingElement, Props>(function Report({ result: r, onRescore, rescoring, onAddLease, maps, sourceText, imageUrl }, headingRef) {
  const { t, lang } = useLang();
  const price = priceVerdict(r.price, lang);
  const scam = scamVerdict(r.scam, lang);
  const lease = leaseVerdict(r.lease, lang);
  const tr = useTr();

  return (
    <article
      aria-labelledby="report-title"
      aria-busy={rescoring || undefined}
      className={`rounded-xs border border-rule bg-sheet transition-opacity motion-reduce:transition-none ${rescoring ? "opacity-60" : ""}`}
    >
      <InkFilter />
      <header className="px-4 pt-5 pb-5 sm:px-8 sm:pt-7">
        <h2 id="report-title" ref={headingRef} tabIndex={-1} className="text-[22px] font-extrabold tracking-tight focus:outline-none sm:text-[26px]">
          {t.reportH}
        </h2>

        {/* The verdict board: the one bold moment. */}
        <ul aria-label={t.verdictsLabel} className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-5">
          <li>
            <Stamp verdict={price} label={t.priceH} href="#s1" tilt={-2.5} delay={60} />
          </li>
          <li>
            <Stamp verdict={scam} label={t.scamH} href="#s2" tilt={1.5} delay={240} />
          </li>
          <li>
            <Stamp verdict={lease} label={t.leaseH} href="#s3" tilt={-1} delay={420} />
          </li>
        </ul>

        <ModeLine r={r} />

        {r.meta.mode === "saved" && (
          <div role="note" className="mt-5 flex gap-3 rounded-xs border-l-4 border-warn bg-warn-tint/60 py-3 pr-3 pl-3.5 text-[15px]">
            <ToneIcon tone="warn" className="mt-0.5 shrink-0 text-warn" />
            <div className="min-w-0">
              <p className="font-bold">{t.savedH}</p>
              <p className="mt-1 text-ink-soft">
                {t.savedP}
              </p>
            </div>
          </div>
        )}

        <AiBanner ai={r.aiInstructions} className="mt-5" />
        {r.meta.notes.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-[14px] text-ink-soft">
            {r.meta.notes.map((n) => (
              <li key={n}>{tr(n)}</li>
            ))}
          </ul>
        )}
        <FactsBar key={JSON.stringify(r.read)} read={r.read} onSave={onRescore} busy={rescoring} />
      </header>

      <Section id="s1" title={t.priceH} verdict={price}>
        <Lead headline={tr(r.price.headline)} detail={tr(r.price.detail)} />
        {maps && r.read.zip && <ListingMap config={maps} zip={r.read.zip} place={r.read.areaName} />}
        <EvidenceDrawer items={r.price.evidence} label={t.showEvidence} />
      </Section>

      <Section id="s2" title={t.scamH} verdict={scam}>
        <Lead headline={tr(r.scam.headline)} detail={tr(r.scam.detail)} />
        {r.scam.flags.length > 0 && (
          <ul className="mt-5 space-y-5">
            {r.scam.flags.map((f) => (
              <li key={f.id} className="grid grid-cols-[1.25rem_1fr] gap-x-2.5">
                <ToneIcon tone={f.weight === 2 ? "stop" : "warn"} className={`mt-[3px] h-5 w-5 ${f.weight === 2 ? "text-stop" : "text-warn"}`} />
                <div className="min-w-0">
                  <p className="font-semibold">
                    {tr(f.label)}
                    <span className="sr-only">{f.weight === 2 ? t.strong : t.sign}</span>
                  </p>
                  {f.evidence[0]?.quote && <Quote text={f.evidence[0].quote} from={f.evidence[0].quoteFrom} />}
                  {!f.evidence[0]?.quote && f.evidence[0]?.value && (
                    <p className="mt-1 text-[15px] text-ink-soft">{f.id === "priceFarBelow" ? t.seePrice : tr(f.evidence[0].value)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {r.community && <Community data={r.community} />}
        <EvidenceDrawer
          label={t.showSources}
          items={[
            ...r.scam.flags.flatMap((f) =>
              f.evidence.map((e) => ({ ...e, label: f.heuristic && !e.source ? `${f.label}. This is a Clearlease rule of thumb.` : f.label })),
            ),
            ...r.scam.dropped,
          ]}
        />
      </Section>

      <Section id="s3" title={t.leaseH} verdict={lease}>
        <Lead headline={tr(r.lease.headline)} detail={tr(r.lease.detail)} />
        {r.lease.status === "not_provided" && (
          <button
            type="button"
            onClick={onAddLease}
            className="mt-4 inline-flex min-h-11 items-center rounded-xs border-2 border-pen px-4 font-semibold text-pen hover:bg-pen hover:text-sheet"
          >
            {t.addLease}
          </button>
        )}
        <LeaseGroups findings={r.lease.findings} />
      </Section>

      <GemmaRead result={r} sourceText={sourceText} imageUrl={imageUrl} />

      <section aria-labelledby="questions" className="border-t-2 border-ink px-4 pt-6 pb-7 sm:px-8">
        <h3 id="questions" className="text-[20px] font-bold tracking-[-0.01em]">
          {t.questionsH}
        </h3>
        <ol className="mt-4 list-decimal space-y-3.5 pl-6 marker:font-semibold marker:text-ink-soft">
          {r.questions.map((q) => (
            <li key={q.text} className="pl-1">
              <p className="font-semibold">{q.text}</p>
              <p className="text-[14px] leading-relaxed text-ink-soft">{q.why}</p>
            </li>
          ))}
        </ol>
        {r.questions.length > 0 && <CopyQuestions questions={r.questions.map((q) => q.text)} />}
      </section>

      <footer className="border-t border-rule bg-paper/50 px-4 py-5 text-[14px] sm:px-8">
        <p className="font-semibold">{t.notLegal}</p>
        {t.rulesEnglish && <p className="mt-1 text-ink-soft">{t.rulesEnglish}</p>}
        <p className="mt-2 text-ink-soft">
          {t.freeHelp}{r.read.jurisdiction ? ` ${t.in} ${r.read.jurisdiction === "DC" ? "DC" : r.read.jurisdiction === "VA" ? "Virginia" : "Maryland"}` : ""}:
        </p>
        <ul className="mt-1 space-y-1">
          {r.help.map((h) => (
            <li key={h.url}>
              <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={h.url} target="_blank" rel="noreferrer">
                {tr(h.label)}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-ink-soft">
          <span lang="en">{t.censusNotice}</span>
          {t.censusNoticeEs && <span className="mt-0.5 block">{t.censusNoticeEs}</span>}
        </p>
      </footer>
    </article>
  );
});

/** Lease clauses grouped by what the renter should do, so the verdict isn't repeated on every clause. */
function LeaseGroups({ findings }: { findings: ClauseFinding[] }) {
  const { t } = useLang();
  if (findings.length === 0) return null;
  const uncounted = findings.filter((f) => !f.evidence[0]?.counted);
  return (
    <div className="mt-6 space-y-7">
      {GROUPS.map((g) => {
        const items = findings.filter((f) => f.severity === g.severity && f.evidence[0]?.counted);
        if (!items.length) return null;
        return (
          <section key={g.severity} aria-label={`${t[g.key]}: ${items.length}`}>
            <h4 className={`flex items-center gap-1.5 border-b-2 border-current pb-1.5 text-[16px] font-bold ${TONE_TEXT[g.tone]}`}>
              <ToneIcon tone={g.tone} className="h-[18px] w-[18px] shrink-0" />
              {t[g.key]} <span className="font-semibold">({items.length})</span>
            </h4>
            <ul className="mt-1 space-y-6 pt-3">
              {items.map((f, i) => (
                <ClauseItem key={i} f={f} />
              ))}
            </ul>
          </section>
        );
      })}
      {uncounted.length > 0 && (
        <section aria-label={`${t.notCounted}: ${uncounted.length}`}>
          <h4 className="flex items-center gap-1.5 border-b-2 border-current pb-1.5 text-[16px] font-bold text-nil">
            <ToneIcon tone="nil" className="h-[18px] w-[18px] shrink-0" />
            {t.notCounted} <span className="font-semibold">({uncounted.length})</span>
          </h4>
          <ul className="mt-1 space-y-6 pt-3">
            {uncounted.map((f, i) => (
              <ClauseItem key={i} f={f} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ClauseItem({ f }: { f: ClauseFinding }) {
  const tr = useTr();
  return (
    <li>
      <p className="font-bold">{tr(f.title)}</p>
      {/* Gemma writes `plain` in the chosen language; our own deposit template goes through tr(). */}
      <p className="mt-0.5 max-w-[68ch] text-[15px] leading-relaxed">{tr(f.plain)}</p>
      <Quote text={f.evidence[0].quote ?? ""} from={f.evidence[0].quoteFrom} />
      <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-soft">{tr(f.why)}</p>
      {f.law && (
        <p className="mt-1 max-w-[68ch] text-[14px] leading-relaxed">
          <span className="text-ink-soft">{tr(f.law.rule)} </span>
          <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={f.law.url} target="_blank" rel="noreferrer">
            {f.law.citation}
          </a>
        </p>
      )}
    </li>
  );
}

function ModeLine({ r }: { r: CheckResult }) {
  const { t } = useLang();
  const secs = (r.meta.latencyMs / 1000).toFixed(1);
  return (
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink-soft">
      {r.meta.mode === "live" && (
        // Links to "What Gemma read" and moves focus there, so keyboard and screen-reader users land on it too.
        <a
          href="#gemma-read-h"
          onClick={() => document.getElementById("gemma-read-h")?.focus({ preventScroll: true })}
          className="text-ink-soft underline underline-offset-2 hover:text-pen-dark"
        >
          {t.readBy} (<code className="font-mono text-ink">{r.meta.model}</code>) {t.in} {secs}&nbsp;s
        </a>
      )}
      {r.meta.mode === "mock" && (
        <span className="rounded-xs bg-warn-tint px-2 py-0.5 text-warn">{t.demoMode}</span>
      )}
      {r.meta.mode === "rules-only" && <span>{t.rulesOnly}</span>}
      {!r.meta.dataLive && <span>{t.savedFigures}</span>}
    </div>
  );
}

/** "Copy these questions": a short, polite message to the landlord, in the current language. */
function CopyQuestions({ questions }: { questions: string[] }) {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "copied" | "blocked">("idle");
  const message = [t.copyHello, "", ...questions.map((q, i) => `${i + 1}. ${q}`), "", t.copyThanks].join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setState("copied");
    } catch {
      setState("blocked"); // insecure context, permission denied or no clipboard API: show the text to copy by hand
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center rounded-xs border-2 border-pen px-4 font-semibold text-pen hover:bg-pen hover:text-sheet"
      >
        {t.copyQs}
      </button>
      <p aria-live="polite" className="mt-2 text-[14px] text-ink-soft">
        {state === "copied" ? t.copied : state === "blocked" ? t.copyBlocked : ""}
      </p>
      {state === "blocked" && (
        <textarea
          readOnly
          aria-label={t.copyQs}
          value={message}
          rows={Math.min(12, questions.length + 4)}
          onFocus={(e) => e.currentTarget.select()}
          ref={(el) => el?.select()}
          className="mt-2 block w-full rounded-xs border border-ink-soft bg-sheet p-3 font-mono text-[14px] leading-relaxed"
        />
      )}
    </div>
  );
}
