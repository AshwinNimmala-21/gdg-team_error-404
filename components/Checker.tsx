"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageError, prepareImage, type PreparedImage } from "@/lib/client/image";
import { redact } from "@/lib/client/redact";
import { normalizeContact, sha256Hex } from "@/lib/community";
import { leaseVerdict, priceVerdict, scamVerdict } from "@/lib/client/verdicts";
import type { CheckError, CheckRequest, CheckResult, Overrides, SampleId } from "@/lib/types";
import { CameraIcon } from "./Icons";
import { Report } from "./Report";

const SAMPLES: { id: SampleId; title: string; note: string; file: string }[] = [
  { id: "fine-arlington", title: "Arlington 1-bedroom", note: "A normal listing from a managed building", file: "/samples/fine-arlington.txt" },
  { id: "scam-facebook", title: "Facebook deal", note: "Cheap, owner overseas, wire the deposit", file: "/samples/scam-facebook.txt" },
  { id: "lease-photo", title: "Photo of a lease page", note: "Auto-renewal and entry without notice", file: "/samples/lease-page.jpg" },
  { id: "injection", title: "Hidden AI instructions", note: "A listing that tries to trick checkers", file: "/samples/injection.txt" },
];

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done" };

export function Checker() {
  const [text, setText] = useState("");
  const [zip, setZip] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<SampleId | undefined>();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [result, setResult] = useState<CheckResult | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [lastText, setLastText] = useState("");
  const [lastHashes, setLastHashes] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLHeadingElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const ids = { text: useId(), zip: useId(), file: useId(), privacy: useId(), err: useId() };

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

  async function check(opts?: { text?: string; image?: PreparedImage | null; sampleId?: SampleId; zip?: string }) {
    const rawText = opts?.text ?? text;
    const img = opts && "image" in opts ? opts.image : image;
    const z = (opts?.zip ?? zip).trim();
    if (!rawText.trim() && !img) {
      setFormError("Paste a listing or add a photo first, or try a sample below.");
      return;
    }
    if (z && !/^\d{5}$/.test(z)) {
      setFormError("ZIP codes have 5 digits. Leave it blank and we'll read it from the listing.");
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
    setAnnounce(img ? "Reading your photo with Gemma. This takes about 10 seconds." : "Checking your listing. This takes about 10 seconds.");
    resultsRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    const r = await send({
      text: safeText,
      image: img ? { mimeType: img.mimeType, data: img.data } : undefined,
      zip: z || undefined,
      sampleId: opts?.sampleId ?? sampleId,
      contactHashes,
    });
    if (r) {
      setResult(r);
      setStatus({ kind: "done" });
      setAnnounce(
        `Report ready. Price check: ${priceVerdict(r.price).word}. Scam risk: ${scamVerdict(r.scam).word}. Lease clauses: ${leaseVerdict(r.lease).word}.`,
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
    if (!file) return;
    setImageError(null);
    try {
      const img = await prepareImage(file);
      setImage(img);
      setSampleId(undefined);
    } catch (e) {
      setImageError(e instanceof ImageError ? e.message : "We couldn't use that image. Try a screenshot.");
    }
  }

  async function runSample(id: SampleId) {
    const s = SAMPLES.find((x) => x.id === id)!;
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

  const loading = status.kind === "loading";

  return (
    <div ref={(el) => el?.setAttribute("data-ready", "")} className="mx-auto grid max-w-[1240px] gap-6 px-4 pb-16 lg:grid-cols-[400px_1fr] lg:gap-10 lg:px-8">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
          aria-describedby={formError ? ids.err : undefined}
          noValidate
        >
          <label htmlFor={ids.text} className="block text-[15px] font-bold">
            Listing or lease text
          </label>
          <p className="text-[14px] text-ink-soft">Paste the ad, the landlord&apos;s message, or lease clauses.</p>
          <textarea
            id={ids.text}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSampleId(undefined);
            }}
            rows={7}
            maxLength={12000}
            className="mt-2 block w-full resize-y rounded-xs border border-ink-soft bg-sheet p-3 text-[16px] leading-relaxed placeholder:text-ink-soft/80"
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
              id={ids.zip}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              className="mt-2 block w-32 rounded-xs border border-ink-soft bg-sheet px-3 py-2 font-mono text-[16px]"
            />
          </div>

          {formError && (
            <p id={ids.err} role="alert" className="mt-4 text-[15px] font-semibold text-stop">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-describedby={ids.privacy}
            className="mt-5 min-h-12 w-full rounded-xs bg-pen px-5 text-[17px] font-bold text-white hover:bg-pen-dark disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Checking…" : "Check this listing"}
          </button>
          <details className="mt-3 text-[14px]" id={ids.privacy}>
            <summary className="min-h-11 py-2 text-ink-soft">
              <span className="text-ink">We don&apos;t save your text or photos.</span>{" "}
              <span className="font-semibold text-pen underline underline-offset-2">What we send</span>
            </summary>
            <div className="space-y-2 pb-2 text-ink-soft">
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

        <section aria-labelledby="samples-h" className="mt-6 border-t border-rule pt-5">
          <h2 id="samples-h" className="text-[15px] font-bold">
            Or try a fictional sample
          </h2>
          <ul className="mt-2 divide-y divide-rule border-y border-rule">
            {SAMPLES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => runSample(s.id)}
                  className="grid min-h-14 w-full grid-cols-[1.75rem_1fr] items-center gap-2 px-1 py-2.5 text-left hover:bg-sheet disabled:opacity-60"
                >
                  <span aria-hidden className="font-mono text-ink-soft">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-pen">{s.title}</span>
                    <span className="block text-[14px] text-ink-soft">{s.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div ref={resultsRef} className="min-w-0 scroll-mt-4">
        <div aria-live="polite" role="status" className="sr-only">
          {announce}
        </div>
        {status.kind === "loading" && <Loading elapsed={elapsed} photo={Boolean(image)} />}
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
          <Report ref={reportRef} result={result} onRescore={rescore} rescoring={rescoring} onAddLease={() => fileRef.current?.click()} />
        )}
        {status.kind === "idle" && <EmptyReport />}
      </div>
    </div>
  );
}

function Loading({ elapsed, photo }: { elapsed: number; photo: boolean }) {
  return (
    <div className="rounded-xs border border-rule bg-sheet" aria-busy="true">
      <div className="px-4 pt-5 pb-4 sm:px-8">
        <p className="text-xl font-extrabold">{photo ? "Reading your photo…" : "Reading your listing…"}</p>
        <p className="mt-1 text-[15px] text-ink-soft">
          Gemma pulls out the facts, then we check them against HUD, Census, FTC and state rules. {elapsed > 0 && <span className="font-mono">{elapsed} s</span>}
        </p>
      </div>
      {["Price check", "Scam risk", "Lease clauses"].map((t, i) => (
        <div key={t} className="grid grid-cols-[2rem_1fr] gap-x-3 border-t border-rule px-4 py-6 sm:grid-cols-[3rem_1fr] sm:px-8">
          <span aria-hidden className="font-mono text-2xl text-rule sm:text-3xl">
            {i + 1}
          </span>
          <div>
            <p className="font-bold text-ink-soft">{t}</p>
            <div className="skeleton mt-3 h-4 w-3/4 rounded-xs bg-paper" />
            <div className="skeleton mt-2 h-4 w-1/2 rounded-xs bg-paper" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyReport() {
  const rows = [
    ["Price check", "Compares the rent with HUD's benchmark rent and Census medians for that ZIP code."],
    ["Scam risk", "Looks for the FTC's rental-scam warning signs and quotes the exact words."],
    ["Lease clauses", "Reads a lease photo and flags clauses that may conflict with DC, Maryland or Virginia rules."],
  ];
  return (
    <div className="rounded-xs border-2 border-dashed border-rule p-5 sm:p-8">
      <p className="text-xl font-extrabold">Your pre-sign report will appear here</p>
      <p className="mt-1 text-[15px] text-ink-soft">Three checks, each with the evidence behind it, plus the questions to ask before you pay.</p>
      <ol className="mt-5 space-y-4">
        {rows.map(([t, d], i) => (
          <li key={t} className="grid grid-cols-[2rem_1fr] gap-x-3">
            <span aria-hidden className="font-mono text-2xl leading-none text-ink-soft">
              {i + 1}
            </span>
            <div>
              <p className="font-bold">{t}</p>
              <p className="text-[15px] text-ink-soft">{d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
