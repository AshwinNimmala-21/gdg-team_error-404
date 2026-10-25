"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { DICTS, type Dict, type Lang } from "@/lib/i18n";
import { ruleToSpanish } from "@/lib/client/rules-es";

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: "en", t: DICTS.en, setLang: () => {} });

const KEY = "clearlease-lang";
const EVENT = "clearlease-lang";

// The saved choice lives in localStorage; useSyncExternalStore reads it without a hydration mismatch
// (the server and the first client render both use English).
let chosen: Lang | null = null; // this tab's choice; works even when storage is blocked
function readLang(): Lang {
  if (chosen) return chosen;
  try {
    return localStorage.getItem(KEY) === "es" ? "es" : "en";
  } catch {
    return "en"; // storage blocked
  }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Lang);
  useEffect(() => {
    document.documentElement.lang = lang; // screen readers switch voice and pronunciation
  }, [lang]);
  const setLang = (l: Lang) => {
    chosen = l;
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* storage blocked: the choice applies to this tab only */
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return <Ctx.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Translate a sentence produced by the rules or the server (hand-written templates in lib/client/rules-es.ts). */
export function useTr() {
  const { lang } = useContext(Ctx);
  return (s: string) => (lang === "es" ? ruleToSpanish(s) : s);
}

/** A static UI string from the dictionary, for server components. */
export function T({ k }: { k: { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict] }) {
  return <>{useLang().t[k]}</>;
}

/** EN / ES switch: two real buttons, the current one marked with aria-pressed. */
export function LangToggle() {
  const { lang, t, setLang } = useLang();
  const btn = (l: Lang, label: string, full: string) => (
    <button
      type="button"
      lang={l}
      aria-pressed={lang === l}
      onClick={() => setLang(l)}
      className={`min-h-11 min-w-11 px-2.5 text-[14px] font-semibold ${lang === l ? "bg-ink text-sheet" : "text-pen underline underline-offset-2 hover:text-pen-dark"}`}
    >
      {label}
      {/* The accessible name starts with the visible text (WCAG 2.5.3, label in name): "EN English". */}
      <span className="sr-only"> {full}</span>
    </button>
  );
  return (
    <div role="group" aria-label={t.langLabel} className="inline-flex items-center rounded-xs border border-ink-soft">
      {btn("en", "EN", "English")}
      {btn("es", "ES", "Español")}
    </div>
  );
}
