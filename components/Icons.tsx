import type { Tone } from "@/lib/client/verdicts";

type P = { className?: string };
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const CheckIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.7 2.7L16.5 9.5" />
  </svg>
);
export const WarnIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 2.8 19.5h18.4z" />
    <path d="M12 10v4.2M12 17.2v.01" />
  </svg>
);
export const StopIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2z" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </svg>
);
export const DashIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h8" />
  </svg>
);
export const ToneIcon = ({ tone, className }: { tone: Tone; className?: string }) =>
  tone === "ok" ? <CheckIcon className={className} /> : tone === "warn" ? <WarnIcon className={className} /> : tone === "stop" ? <StopIcon className={className} /> : <DashIcon className={className} />;

export const Caret = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const CameraIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);
