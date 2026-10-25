import type { Evidence } from "@/lib/types";
import { Caret } from "./Icons";
import { useLang, useTr } from "./Lang";

export function Quote({ text, from }: { text: string; from?: "text" | "image" }) {
  const { t } = useLang();
  return (
    <figure className="mt-1">
      {/* Quotes stay in the original language so they can be checked against the input. */}
      {t.original && <p className="text-[12px] font-semibold text-ink-soft">{t.original}</p>}
      <blockquote data-quote className="border-l-[3px] border-rule bg-paper/60 py-1 pr-2 pl-3 font-mono text-[13.5px] leading-relaxed break-words text-ink">
        “{text}”
      </blockquote>
      {from === "image" && <figcaption className="mt-0.5 text-[13px] text-ink-soft">{t.fromPhoto}</figcaption>}
    </figure>
  );
}

export function EvidenceItem({ e }: { e: Evidence }) {
  const { t } = useLang();
  const tr = useTr();
  return (
    <li className="py-2.5">
      <p className={`text-[15px] font-semibold ${e.counted ? "text-ink" : "text-ink-soft"}`}>{tr(e.label)}</p>
      {e.value && <p className="text-[15px] text-ink">{tr(e.value)}</p>}
      {e.quote && <Quote text={e.quote} from={e.quoteFrom} />}
      {e.source && (
        <p className="mt-1 text-[13px]">
          {t.source}{" "}
          <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={e.source.url} target="_blank" rel="noreferrer">
            {tr(e.source.name)}
          </a>
        </p>
      )}
    </li>
  );
}

export function EvidenceDrawer({ items, label }: { items: Evidence[]; label?: string }) {
  const { t } = useLang();
  if (!items.length) return null;
  return (
    <details className="group mt-3">
      <summary className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-pen hover:text-pen-dark">
        <Caret className="caret transition-transform motion-reduce:transition-none" />
        {label ?? t.showEvidence} ({items.length})
      </summary>
      <ul className="mt-1 divide-y divide-rule border-t border-rule">
        {items.map((e, i) => (
          <EvidenceItem key={i} e={e} />
        ))}
      </ul>
    </details>
  );
}
