import type { Tone, Verdict } from "@/lib/client/verdicts";
import { ToneIcon } from "./Icons";

const TONE: Record<Tone, string> = {
  ok: "text-ok bg-ok-tint/70",
  warn: "text-warn bg-warn-tint/70",
  stop: "text-stop bg-stop-tint/70",
  nil: "text-nil bg-nil-tint/60 stamp--nil",
};

/**
 * The inspector's stamp, used once per report on the verdict board. Double ring with a roughened ink
 * edge (SVG filter on the rings only, so text stays crisp), a hand-set tilt, and a small "ring text"
 * line naming what was checked. Icon + word + color: never color alone.
 */
export function Stamp({ verdict, label, href, tilt, delay }: { verdict: Verdict; label: string; href: string; tilt: number; delay: number }) {
  return (
    <a
      href={href}
      className={`stamp group inline-flex max-w-full flex-col items-start px-4 pt-2.5 pb-3 no-underline sm:px-5 ${TONE[verdict.tone]}`}
      style={{ "--tilt": `${tilt}deg`, animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <span className="text-[13px] leading-none font-semibold">
        {label}
        <span className="sr-only">: </span>
      </span>
      <span className="mt-1.5 flex items-center gap-2 text-[22px] leading-tight font-black tracking-[-0.01em] sm:text-[24px]">
        <ToneIcon tone={verdict.tone} className="h-[1.05em] w-[1.05em] shrink-0" />
        <span className="group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">{verdict.word}</span>
      </span>
    </a>
  );
}

/** Rough ink edge for the stamp rings. Rendered once per report. */
export function InkFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="ink-edge" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain" />
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="4" result="speck" />
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.05" result="holes" />
        <feComposite in="rough" in2="holes" operator="in" />
      </filter>
    </svg>
  );
}
