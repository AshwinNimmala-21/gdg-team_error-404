"use client";

import { useState } from "react";
import type { CheckResult } from "@/lib/types";

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
  if (data.ids.length === 0) return null;

  // Don't count this browser's own earlier flag as "other people".
  const others = Math.max(data.address, data.contact) - (mine ? 1 : 0);
  const what = data.address >= data.contact ? "this address" : "this contact";

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
        {others > 0
          ? `${others} other ${others === 1 ? "person has" : "people have"} flagged ${what} on Clearlease${data.firstSeen ? `, first on ${data.firstSeen}` : ""}.`
          : "No one else has flagged this address or contact on Clearlease yet."}
      </p>
      <p className="mt-1 text-[14px] text-ink-soft">
        Flags are anonymous. We keep a one-way fingerprint of the street address or phone/email and a count, never your text.
      </p>
      {state === "done" ? (
        <p role="status" className="mt-2 text-[15px] font-semibold text-ok">
          Thanks. Your flag is counted.
        </p>
      ) : (
        <button
          type="button"
          onClick={flag}
          disabled={state === "sending"}
          className="mt-2 inline-flex min-h-11 items-center rounded-xs border-2 border-stop px-4 font-semibold text-stop hover:bg-stop hover:text-white disabled:opacity-60"
        >
          {state === "sending" ? "Flagging…" : "Flag this as a likely scam"}
        </button>
      )}
      {state === "failed" && (
        <p role="alert" className="mt-2 text-[14px] text-stop">
          Couldn&apos;t save your flag right now. Try again later.
        </p>
      )}
    </div>
  );
}
