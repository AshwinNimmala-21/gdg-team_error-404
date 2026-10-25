"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageError, prepareImage, type PreparedImage } from "@/lib/client/image";
import { redact } from "@/lib/client/redact";
import { leaseVerdict, priceVerdict, scamVerdict } from "@/lib/client/verdicts";
import { normalizeContact, sha256Hex } from "@/lib/community";
import type { CheckError, CheckRequest, CheckResult, Overrides, SampleId } from "@/lib/types";
import type { MapsConfig } from "@/lib/server/maps-config";
import { CameraIcon } from "./Icons";
import { Report } from "./Report";

const SAMPLES: { id: SampleId; title: string; note: string; file: string }[] = [
  { id: "blacksburg-sublet", title: "Blacksburg summer sublet", note: "Near VT, Zelle before you see it", file: "/samples/blacksburg-sublet.txt" },
  { id: "lease-photo", title: "Photo of a lease page", note: "Auto-renewal and entry without notice", file: "/samples/lease-page.jpg" },
  { id: "fine-arlington", title: "Arlington 1-bedroom", note: "A normal listing from a managed building", file: "/samples/fine-arlington.txt" },
  { id: "scam-facebook", title: "Facebook deal", note: "Cheap, owner overseas, wire the deposit", file: "/samples/scam-facebook.txt" },
  { id: "injection", title: "Hidden AI instructions", note: "A listing that tries to trick checkers", file: "/samples/injection.txt" },
];

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done" };

export function Checker({ maps }: { maps: MapsConfig | null }) {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<SampleId | undefined>();
  const [running, setRunning] = useState<SampleId | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [result, setResult] = useState<CheckResult | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [lastText, setLastText] = useState("");
  const [lastHashes, setLastHashes] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [formError, setFormError] = useState<{ field: "text" | "zip"; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLHeadingElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const addingLease = useRef(false);
  const ids = { text: useId(), zip: useId(), file: useId(), privacy: useId(), err: useId() };
  const loading = status.kind === "loading";

  useEffect(() => {
    if (status.kind !== "loading") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status.kind === "done" && result && !rescoring) reportRef.current?.focus();
  }, [status.kind, result, rescoring]);

  async function send(body: CheckRequest): Promise<CheckResult | null> {
    try {
      const res = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json().catch(() => null)) as CheckResult | CheckError | null;
      if (!res.ok || !json || "error" in json) {
        const message = json && "error" in json ? json.error.message : "Something went wrong. Try again in a moment.";
        setStatus({ kind: "error", message });
        setAnnounce(message);
        return null;
      }
      return json;
    } catch {
      const message = "You seem to be offline, or our server didn't answer. Check your connection and try again.";
      setStatus({ kind: "error", message });
      setAnnounce(message);
      return null;
    }
  }

  async function check(opts?: { text?: string; image?: PreparedImage | null; sampleId?: SampleId | null; zip?: string }) {
    if (loading) return;
    const rawText = opts?.text ?? text;
    const img = opts && "image" in opts ? opts.image : image;
    const z = (opts?.zip ?? zip).trim();
    if (!rawText.trim() && !img) {
      setFormError({ field: "text", message: "Paste a listing or add a photo first, or try a sample below." });
      textRef.current?.focus();
      return;
    }
    if (z && !/^\d{5}$/.test(z)) {
      setFormError({ field: "zip", message: "ZIP codes have 5 digits. Leave it blank and we'll read it from the listing." });
      zipRef.current?.focus();
      return;
    }
    setFormError(null);
    const { text: safeText, contacts } = redact(rawText);
    // Contacts never leave the device: only their SHA-256 goes to the server, for the community counter.
    const contactHashes = await Promise.all(
      [...new Set(contacts.map(normalizeContact).filter((x): x is string => Boolean(x)))].slice(0, 5).map(sha256Hex),
    );
    setLastText(safeText);
    setLastHashes(contactHashes);
    setStatus({ kind: "loading" });
    setElapsed(0);
    const sid = opts && "sampleId" in opts ? (opts.sampleId ?? undefined) : sampleId;
    const what = sid === "lease-photo" ? "lease photo" : "photo";
    setAnnounce(img ? `Reading your ${what} with Gemma. This takes about 30 seconds.` : "Checking your listing. This takes about 10 seconds.");
    // Photos are slow: tell screen-reader users it's still working.
    const slow = img ? setTimeout(() => setAnnounce(`Still reading your ${what}. A full page takes about 30 seconds.`), 20_000) : undefined;
    resultsRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    const r = await send({
      text: safeText,
      image: img ? { mimeType: img.mimeType, data: img.data } : undefined,
      zip: z || undefined,
      sampleId: sid,
      contactHashes,
    });
    clearTimeout(slow);
    setRunning(null);
    if (r) {
      setResult(r);
      setStatus({ kind: "done" });
      setAnnounce(
        `${r.meta.mode === "saved" ? "Showing a saved result: the AI model didn't respond. " : ""}Report ready. Price check: ${priceVerdict(r.price).word}. Scam risk: ${scamVerdict(r.scam).word}. Lease clauses: ${leaseVerdict(r.lease).word}.`,
      );
    }
  }

  async function rescore(overrides: Overrides) {
    if (!result) return;
    setRescoring(true);
    const r = await send({ text: lastText, extraction: result.extraction, overrides, contactHashes: lastHashes });
    setRescoring(false);
    if (r) {
      setResult(r);
      setStatus({ kind: "done" });
      setAnnounce(`Report updated. Price check: ${priceVerdict(r.price).word}. Scam risk: ${scamVerdict(r.scam).word}.`);
    }
  }

  async function onFile(file: File | undefined) {
    const fromReport = addingLease.current;
    addingLease.current = false;
    if (!file) return;
    setImageError(null);
    try {
      const img = await prepareImage(file);
      setImage(img);
      setSampleId(undefined);
      // "Add a photo of the lease" in the report re-runs the check with the listing text plus the photo.
      if (fromReport) await check({ image: img, sampleId: null });
    } catch (e) {
      setImageError(e instanceof ImageError ? e.message : "We couldn't use that image. Try a screenshot.");
    }
  }

  async function runSample(id: SampleId) {
    if (loading) return;
    const s = SAMPLES.find((x) => x.id === id)!;
    setRunning(id);
    setSampleId(id);
    setZip("");
    setImageError(null);
    if (s.file.endsWith(".txt")) {
      const t = await (await fetch(s.file)).text();
      setText(t);
      setImage(null);
      await check({ text: t, image: null, sampleId: id, zip: "" });
    } else {
      const blob = await (await fetch(s.file)).blob();
      const img = await prepareImage(blob);
      setText("");
      setImage(img);
      await check({ text: "", image: img, sampleId: id, zip: "" });
    }
  }

  const samples = (headingId: string) => <SampleList headingId={headingId} onRun={runSample} running={running} busy={loading} />;

  return (
    <div ref={(el) => el?.setAttribute("data-ready", "")} className="mx-auto grid max-w-[1240px] gap-6 px-4 pb-16 lg:grid-cols-[400px_1fr] lg:gap-10 lg:px-8">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-3 text-[15px] lg:hidden">
          No listing handy?{" "}
          <a href="#samples-h" className="font-semibold text-pen underline underline-offset-2">
            Try a sample
          </a>
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
          noValidate
        >
          <label htmlFor={ids.text} className="block text-[15px] font-bold">
            Listing or lease text
          </label>
          <p className="text-[14px] text-ink-soft">Paste the ad, the landlord&apos;s message, or lease clauses.</p>
          <textarea
            ref={textRef}
            id={ids.text}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSampleId(undefined);
            }}
            aria-invalid={formError?.field === "text" || undefined}
            aria-describedby={formError?.field === "text" ? ids.err : undefined}
            rows={5}
            maxLength={12000}
            className="mt-2 block min-h-32 w-full resize-y rounded-xs border border-ink-soft bg-sheet p-3 text-[16px] leading-relaxed placeholder:text-ink-soft sm:min-h-44"
            placeholder="1BR in Clarendon, $1,650/month. Owner overseas…"
          />

          <div className="mt-4">
            <span className="block text-[15px] font-bold" id={ids.file}>
              Photo or screenshot <span className="font-normal text-ink-soft">(optional)</span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-labelledby={ids.file}
              tabIndex={-1}
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {image ? (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={image.previewUrl} alt="Your uploaded photo (preview)" className="h-20 w-16 rounded-xs border border-rule object-cover object-top" />
                <div className="text-[14px]">
                  <p>Photo ready ({Math.max(1, Math.round(image.bytes / 1024))} KB, resized on your device)</p>
                  <button type="button" onClick={() => setImage(null)} className="min-h-11 font-semibold text-pen underline underline-offset-2">
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xs border-2 border-dashed border-ink-soft bg-sheet px-4 font-semibold hover:border-pen hover:text-pen"
              >
                <CameraIcon />
                Add a photo
              </button>
            )}
            {imageError && (
              <p role="alert" className="mt-2 text-[14px] font-semibold text-stop">
                {imageError}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor={ids.zip} className="block text-[15px] font-bold">
              ZIP code <span className="font-normal text-ink-soft">(optional, we&apos;ll read it from the listing)</span>
            </label>
            <input
              ref={zipRef}
              id={ids.zip}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              aria-invalid={formError?.field === "zip" || undefined}
              aria-describedby={formError?.field === "zip" ? ids.err : undefined}
              className="mt-2 block w-32 rounded-xs border border-ink-soft bg-sheet px-3 py-2 text-[16px] tabular-nums"
            />
          </div>

          {formError && (
            <p id={ids.err} role="alert" className="mt-4 text-[15px] font-semibold text-stop">
              {formError.message}
            </p>
          )}

          <button
            type="submit"
            aria-disabled={loading || undefined}
            className="mt-5 min-h-12 w-full rounded-xs bg-pen px-5 text-[17px] font-bold text-white hover:bg-pen-dark aria-disabled:cursor-wait aria-disabled:bg-pen-dark"
          >
            {loading ? "Checking…" : "Check this listing"}
          </button>
          <details className="mt-3 text-[14px]">
            <summary className="min-h-11 py-2 text-ink-soft">
              <span className="text-ink">We don&apos;t save your text or photos.</span>{" "}
              <span className="font-semibold text-pen underline underline-offset-2">What we send</span>
            </summary>
            <div className="space-y-2 pb-2 text-ink-soft" id={ids.privacy}>
              <p>No account and no logs of your text. Your photo is resized on your device (which also strips location data) and dropped after the check.</p>
              <p>
                Before sending, we remove phone numbers, emails and long ID or account numbers from your text. To read it, we send the text and photo
                to Google&apos;s Gemma 4 model through the free Gemini API, where Google may review inputs to improve its products. Cover names,
                signatures and account numbers in photos first.
              </p>
              <p>
                If you flag a listing as a scam, we store only a one-way fingerprint of its street address or contact and a count, so others can see
                how many people flagged it. Never the text itself.
              </p>
            </div>
          </details>
        </form>

        {/* On desktop the samples sit in the empty report until the first check. */}
        <div className={status.kind === "idle" ? "lg:hidden" : ""}>{samples("samples-h")}</div>
      </div>

      <div ref={resultsRef} className="min-w-0 scroll-mt-4">
        <div aria-live="polite" role="status" className="sr-only">
          {announce}
        </div>
        {status.kind === "loading" && <Loading elapsed={elapsed} photo={Boolean(image)} lease={running === "lease-photo"} />}
        {status.kind === "error" && (
          <div role="alert" className="rounded-xs border-2 border-stop bg-sheet p-5">
            <p className="text-lg font-bold text-stop">We couldn&apos;t finish this check</p>
            <p className="mt-1">{status.message}</p>
            <button type="button" onClick={() => check()} className="mt-4 min-h-11 rounded-xs bg-pen px-4 font-semibold text-white hover:bg-pen-dark">
              Try again
            </button>
          </div>
        )}
        {status.kind === "done" && result && (
          <Report
            ref={reportRef}
            result={result}
            onRescore={rescore}
            rescoring={rescoring}
            maps={maps}
            sourceText={lastText}
            imageUrl={image?.previewUrl ?? null}
            onAddLease={() => {
              addingLease.current = true;
              fileRef.current?.click();
            }}
          />
        )}
        {status.kind === "idle" && <EmptyReport samples={samples("samples-h-empty")} />}
      </div>
    </div>
  );
}

function SampleList({ headingId, onRun, running, busy }: { headingId: string; onRun: (id: SampleId) => void; running: SampleId | null; busy: boolean }) {
  return (
    <section aria-labelledby={headingId} className="mt-7 scroll-mt-4 lg:mt-0">
      <h2 id={headingId} className="text-[15px] font-bold">
        Try a fictional sample
      </h2>
      <ul className="mt-2 border-t border-rule">
        {SAMPLES.map((s) => {
          const active = running === s.id;
          return (
            <li key={s.id} className="border-b border-rule">
              <button
                type="button"
                aria-disabled={busy || undefined}
                aria-current={active || undefined}
                onClick={() => onRun(s.id)}
                className={`block min-h-14 w-full px-1 py-2.5 text-left hover:bg-sheet ${busy && !active ? "cursor-wait" : ""} ${active ? "bg-sheet" : ""}`}
              >
                <span className="block font-semibold text-pen underline-offset-2 hover:underline">{s.title}</span>
                <span className="block text-[14px] text-ink-soft">{active ? "Checking…" : s.note}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const CHECKS = [
  ["Price check", "Rent against Census and HUD figures for the same size unit in that ZIP code."],
  ["Scam risk", "The FTC's rental-scam warning signs, with the exact words quoted."],
  ["Lease clauses", "Clauses that may conflict with DC, Maryland or Virginia rules."],
] as const;

/** Unstamped slots: a preview of the verdict board (dashed, waiting for ink). */
function GhostSlots({ pulsing }: { pulsing: boolean }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-3">
      {CHECKS.map(([t, d]) => (
        <li key={t} className="rounded-[3px] border-2 border-dashed border-rule px-4 pt-2.5 pb-3">
          <p className="text-[13px] leading-none font-semibold text-ink-soft">{t}</p>
          {pulsing ? (
            <div className="skeleton mt-2.5 h-5 w-3/4 rounded-xs bg-paper" />
          ) : (
            <p className="mt-1.5 text-[14px] leading-snug text-ink-soft">{d}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Honest wait: photos take about 30 s, text about 10 s. The message changes as time passes. */
function Loading({ elapsed, photo, lease }: { elapsed: number; photo: boolean; lease: boolean }) {
  const stage =
    elapsed >= 45 || (!photo && elapsed >= 20)
      ? "Taking longer than usual. If the model doesn't answer, we retry automatically."
      : photo && elapsed >= 20
        ? "Still reading. A full page takes about 30 seconds."
        : photo
          ? "This takes about 30 seconds. Gemma reads every line, then we check it against HUD, Census, FTC and state rules."
          : "Gemma pulls out the facts, then we check them against HUD, Census, FTC and state rules.";
  return (
    <div className="rounded-xs border border-rule bg-sheet px-4 pt-5 pb-6 sm:px-8 sm:pt-7" aria-busy="true">
      <p className="text-[22px] font-extrabold tracking-tight sm:text-[26px]">
        {photo ? `Reading your ${lease ? "lease photo" : "photo"}…` : "Reading your listing…"}
      </p>
      <p className="mt-1 text-[15px] text-ink-soft">
        {stage} {elapsed > 0 && <span className="tabular-nums">{elapsed}&nbsp;s</span>}
      </p>
      <GhostSlots pulsing />
    </div>
  );
}

function EmptyReport({ samples }: { samples: React.ReactNode }) {
  return (
    <div className="rounded-xs border border-rule bg-sheet/60 px-4 pt-5 pb-6 sm:px-8 sm:pt-7">
      <p className="text-[22px] font-extrabold tracking-tight sm:text-[26px]">Your pre-sign report will appear here</p>
      <p className="mt-1 text-[15px] text-ink-soft">Three verdicts, the evidence behind each one, and the questions to ask before you pay.</p>
      <GhostSlots pulsing={false} />
      <div className="mt-7 hidden lg:block">{samples}</div>
    </div>
  );
}
