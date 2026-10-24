import type { Evidence } from "@/lib/types";
import { Caret } from "./Icons";

export function Quote({ text, from }: { text: string; from?: "text" | "image" }) {
  return (
    <figure className="mt-1">
      <blockquote className="border-l-[3px] border-rule bg-paper/60 py-1 pr-2 pl-3 font-mono text-[13.5px] leading-relaxed break-words text-ink">
        “{text}”
      </blockquote>
      {from === "image" && <figcaption className="mt-0.5 text-[13px] text-ink-soft">From your photo, as read by Gemma</figcaption>}
    </figure>
  );
}

export function EvidenceItem({ e }: { e: Evidence }) {
  return (
    <li className="py-2.5">
      <p className={`text-[15px] font-semibold ${e.counted ? "text-ink" : "text-ink-soft"}`}>{e.label}</p>
      {e.value && <p className="text-[15px] text-ink">{e.value}</p>}
      {e.quote && <Quote text={e.quote} from={e.quoteFrom} />}
      {e.source && (
        <p className="mt-1 text-[13px]">
          Source:{" "}
          <a className="text-pen underline underline-offset-2 hover:text-pen-dark" href={e.source.url} target="_blank" rel="noreferrer">
            {e.source.name}
          </a>
        </p>
      )}
    </li>
  );
}

export function EvidenceDrawer({ items, label = "Show evidence" }: { items: Evidence[]; label?: string }) {
  if (!items.length) return null;
  return (
    <details className="group mt-3">
      <summary className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-pen hover:text-pen-dark">
        <Caret className="caret transition-transform motion-reduce:transition-none" />
        {label} ({items.length})
      </summary>
      <ul className="mt-1 divide-y divide-rule border-t border-rule">
        {items.map((e, i) => (
          <EvidenceItem key={i} e={e} />
        ))}
      </ul>
    </details>
  );
}
