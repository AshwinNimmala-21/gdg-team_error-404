"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLang, useTr } from "./Lang";
import type { CheckResult, Overrides } from "@/lib/types";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/** "We read: …" with an inline editor. Saving reruns the rules only (no model call). */
export function FactsBar({ read, onSave, busy }: { read: CheckResult["read"]; onSave: (o: Overrides) => void; busy: boolean }) {
  const { t } = useLang();
  const tr = useTr();
  const [editing, setEditing] = useState(false);
  const [rent, setRent] = useState(read.rent?.toString() ?? "");
  const [beds, setBeds] = useState(read.bedrooms?.toString() ?? "");
  const [zip, setZip] = useState(read.zip ?? "");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const editRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // Return focus to the Edit button after Cancel / Escape / save.
  useEffect(() => {
    if (!editing && wasEditing.current) editRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const o: Overrides = {};
    const r = Number(rent.replace(/[$,\s]/g, ""));
    if (rent.trim()) {
      if (!Number.isFinite(r) || r <= 0) return setError("Enter the monthly rent as a number, like 1850.");
      o.rent = r;
    }
    if (beds !== "") o.bedrooms = Number(beds);
    if (zip.trim()) {
      if (!/^\d{5}$/.test(zip.trim())) return setError("Enter a 5-digit ZIP code.");
      o.zip = zip.trim();
    }
    setError(null);
    setEditing(false);
    onSave(o);
  }

  const item = (label: string, value: string | null) => (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[13px] text-ink-soft">{label}</dt>
      <dd className={`text-[16px] tabular-nums ${value ? "font-semibold" : "text-ink-soft"}`}>{value ?? t.notFound}</dd>
    </div>
  );

  if (!editing)
    return (
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-dashed border-rule py-3">
        <span className="text-[13px] font-semibold">{t.weRead}</span>
        <dl className="flex flex-wrap gap-x-5 gap-y-1">
          {item(t.rent, read.rent !== null ? `${money(read.rent)}${t.perMonth}${read.priceBasis === "per_bedroom" ? t.perBedroom : read.priceBasis === "per_person" ? t.perPerson : ""}` : null)}
          {item(t.size, read.bedrooms !== null ? `${read.bedrooms === 0 ? t.studio : t.bedroomN(read.bedrooms)}${read.priceBasis ? t.wholeUnit : ""}` : null)}
          {item(t.zip, read.zip ? `${read.zip}${read.areaName ? ` (${read.areaName})` : ""}` : null)}
        </dl>
        <button
          ref={editRef}
          type="button"
          onClick={() => setEditing(true)}
          aria-disabled={busy || undefined}
          className="sm:ml-auto inline-flex min-h-11 items-center px-2 text-[15px] font-semibold text-pen underline underline-offset-2 hover:text-pen-dark disabled:opacity-60"
        >
          {busy ? t.updating : t.editRead}
        </button>
      </div>
    );

  const field = "mt-1 block w-full rounded-xs border border-ink-soft bg-sheet px-2.5 py-2 text-[16px] tabular-nums";
  return (
    <form
      onSubmit={save}
      onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
      className="mt-4 border-y border-dashed border-rule py-3"
      aria-describedby={error ? `${id}-err` : undefined}
    >
      <p className="text-[14px] text-ink-soft">{t.editHelp}</p>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-[14px] font-semibold">
          {t.monthlyRent}
          <input className={field} inputMode="decimal" value={rent} onChange={(e) => setRent(e.target.value)} autoFocus />
        </label>
        <label className="text-[14px] font-semibold">
          {t.bedrooms}
          <select className={field} value={beds} onChange={(e) => setBeds(e.target.value)}>
            <option value="">{t.notSure}</option>
            <option value="0">{t.studio}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {t.bedroomN(n)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[14px] font-semibold">
          {t.zipLabel}
          <input className={field} inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value)} />
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-2 text-[14px] font-semibold text-stop">
          {tr(error)}
        </p>
      )}
      <div className="mt-3 flex gap-3">
        <button type="submit" className="min-h-11 rounded-xs bg-pen px-4 font-semibold text-sheet hover:bg-pen-dark">
          {t.update}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="min-h-11 px-3 font-semibold text-pen underline underline-offset-2">
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
