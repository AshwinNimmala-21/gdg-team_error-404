"use client";

import { useState } from "react";
import type { CheckResult } from "@/lib/types";
import { useLang } from "./Lang";

const C = {
  en: {
    address: "this address", contact: "this contact",
    others: (n: number, what: string, first: string | null) => `${n} other ${n === 1 ? "person has" : "people have"} flagged ${what} on Clearlease${first ? `, first on ${first}` : ""}.`,
    none: "No one else has flagged this address or contact on Clearlease yet.",
    anon: "Flags are anonymous. We keep a one-way fingerprint of the street address or phone/email and a count, never your text.",
    thanks: "Thanks. Your flag is counted.", flagging: "Flagging…", flag: "Flag this as a likely scam", failed: "Couldn't save your flag right now. Try again later.",
  },
  es: {
    address: "esta dirección", contact: "este contacto",
    others: (n: number, what: string, first: string | null) => `${n} ${n === 1 ? "persona más ha" : "personas más han"} marcado ${what} en Clearlease${first ? `, la primera vez el ${first}` : ""}.`,
    none: "Nadie más ha marcado esta dirección o contacto en Clearlease todavía.",
    anon: "Las marcas son anónimas. Guardamos una huella irreversible de la dirección o del teléfono/correo y un conteo, nunca su texto.",
    thanks: "Gracias. Su marca quedó contada.", flagging: "Marcando…", flag: "Marcar como probable estafa", failed: "No pudimos guardar su marca ahora. Intente más tarde.",
  },
};

const STORE_KEY = "clearlease:flagged";

function readFlagged(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Anonymous community counter: "N other people flagged this". Shown only when the counter is on. */
export function Community({ data }: { data: NonNullable<CheckResult["community"]> }) {
  const [mine] = useState(() => (typeof window === "undefined" ? false : data.ids.some((id) => readFlagged().includes(id))));
  const [state, setState] = useState<"idle" | "sending" | "done" | "failed">(mine ? "done" : "idle");
  const { lang } = useLang();
  if (data.ids.length === 0) return null;

  // Don't count this browser's own earlier flag as "other people".
  const others = Math.max(data.address, data.contact) - (mine ? 1 : 0);
  const c = C[lang];
  const what = data.address >= data.contact ? c.address : c.contact;

  async function flag() {
    setState("sending");
    try {
      const res = await fetch("/api/flag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: data.ids, token: data.token }) });
      if (!res.ok) throw new Error();
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify([...new Set([...readFlagged(), ...data.ids])].slice(-200)));
      } catch {
        /* private mode: fine */
      }
      setState("done");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="mt-5 border-t border-dashed border-rule pt-4">
      <p className="font-semibold">
        {others > 0 ? c.others(others, what, data.firstSeen) : c.none}
      </p>
      <p className="mt-1 text-[14px] text-ink-soft">
        {c.anon}
      </p>
      {state === "done" ? (
        <p role="status" className="mt-2 text-[15px] font-semibold text-ok">
          {c.thanks}
        </p>
      ) : (
        <button
          type="button"
          onClick={flag}
          disabled={state === "sending"}
          className="mt-2 inline-flex min-h-11 items-center rounded-xs border-2 border-stop px-4 font-semibold text-stop hover:bg-stop hover:text-sheet disabled:opacity-60"
        >
          {state === "sending" ? c.flagging : c.flag}
        </button>
      )}
      {state === "failed" && (
        <p role="alert" className="mt-2 text-[14px] text-stop">
          {c.failed}
        </p>
      )}
    </div>
  );
}
