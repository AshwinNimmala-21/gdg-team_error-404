"use client";

import { forwardRef } from "react";
import type { CheckResult } from "@/lib/types";
import { Quote } from "./Evidence";
import { ToneIcon } from "./Icons";
import { useLang, useTr } from "./Lang";

/**
 * Shown instead of the report when the input is a question about renting, not a listing, message or lease.
 * Says what we can check and what to paste. If the question itself describes FTC warning signs, it lists them with
 * the matching questions: all of it is our rule text, never model-written advice.
 */
export const QuestionHelp = forwardRef<HTMLHeadingElement, { result: CheckResult; onPaste: () => void }>(function QuestionHelp(
  { result: r, onPaste },
  headingRef,
) {
  const { t } = useLang();
  const tr = useTr();
  const flags = r.scam.flags.filter((f) => f.evidence[0]?.counted);

  return (
    <article aria-labelledby="question-title" className="rounded-xs border border-rule bg-sheet">
      <div className="px-4 pt-5 pb-6 sm:px-8 sm:pt-7">
        <h2 id="question-title" ref={headingRef} tabIndex={-1} className="text-[22px] font-extrabold tracking-tight focus:outline-none sm:text-[26px]">
          {t.qH}
        </h2>
        <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed">{t.qWhat}</p>
        <p className="mt-2 max-w-[64ch] text-[16px] leading-relaxed text-ink-soft">{t.qPaste}</p>
        <button
          type="button"
          onClick={onPaste}
          className="mt-4 inline-flex min-h-11 items-center rounded-xs border-2 border-pen px-4 font-semibold text-pen hover:bg-pen hover:text-sheet"
        >
          {t.qPasteBtn}
        </button>
      </div>

      {flags.length > 0 && (
        <section aria-labelledby="question-flags" className="border-t border-rule px-4 pt-6 pb-7 sm:px-8">
          <h3 id="question-flags" className="text-[20px] leading-tight font-bold tracking-[-0.01em]">
            {t.qFlagsH}
          </h3>
          <ul className="mt-4 space-y-5">
            {flags.map((f) => (
              <li key={f.id} className="grid grid-cols-[1.25rem_1fr] gap-x-2.5">
                <ToneIcon tone={f.weight === 2 ? "stop" : "warn"} className={`mt-[3px] h-5 w-5 ${f.weight === 2 ? "text-stop" : "text-warn"}`} />
                <div className="min-w-0">
                  <p className="font-semibold">{tr(f.label)}</p>
                  {f.evidence[0]?.quote && <Quote text={f.evidence[0].quote} from={f.evidence[0].quoteFrom} />}
                  {f.evidence[0]?.source && (
                    <a className="mt-1 inline-block text-[14px] text-pen underline underline-offset-2 hover:text-pen-dark" href={f.evidence[0].source.url} target="_blank" rel="noreferrer">
                      {tr(f.evidence[0].source.name)}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {r.questions.length > 0 && (
            <>
              <h4 className="mt-6 text-[16px] font-bold">{t.qAskH}</h4>
              <ol className="mt-3 list-decimal space-y-3 pl-6 marker:font-semibold marker:text-ink-soft">
                {r.questions.map((q) => (
                  <li key={q.text} className="pl-1">
                    <p className="font-semibold">{q.text}</p>
                    <p className="text-[14px] leading-relaxed text-ink-soft">{q.why}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}

      <footer className="border-t border-rule bg-paper/50 px-4 py-5 text-[14px] sm:px-8">
        <p className="font-semibold">{t.notLegal}</p>
        <p className="mt-2 text-ink-soft">{t.freeHelp}:</p>
        <ul className="mt-1 space-y-1">
          {r.help.map((h) => (
            <li key={h.url}>
              <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={h.url} target="_blank" rel="noreferrer">
                {tr(h.label)}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
});
