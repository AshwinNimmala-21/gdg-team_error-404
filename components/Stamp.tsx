import type { Tone, Verdict } from "@/lib/client/verdicts";
import { ToneIcon } from "./Icons";

const TONE: Record<Tone, string> = {
  ok: "text-ok bg-ok-tint border-ok",
  warn: "text-warn bg-warn-tint border-warn",
  stop: "text-stop bg-stop-tint border-stop",
  none: "text-none bg-none-tint border-none border-dashed",
};

/** The inspector's stamp: icon + word + color, never color alone. */
export function Stamp({ verdict, delay = 0 }: { verdict: Verdict; delay?: number }) {
  return (
    <span
      className={`stamp inline-flex max-w-full items-center gap-2 rounded-xs border-[2.5px] px-3 py-1.5 text-[17px] leading-tight font-extrabold sm:text-xl ${TONE[verdict.tone]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <ToneIcon tone={verdict.tone} className="shrink-0" />
      <span>{verdict.word}</span>
    </span>
  );
}
