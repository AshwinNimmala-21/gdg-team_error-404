"use client";

import { useEffect, useSyncExternalStore } from "react";
import { THEME_KEY } from "@/lib/client/theme-init";
import { useLang } from "./Lang";

export type Theme = "light" | "dark";

const KEY = THEME_KEY;
const EVENT = "clearlease-theme";

let chosen: Theme | null = null; // this tab's choice; works even when storage is blocked
function saved(): Theme | null {
  if (chosen) return chosen;
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null; // storage blocked
  }
}
function readTheme(): Theme {
  return saved() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  mq.addEventListener("change", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
    mq.removeEventListener("change", cb);
  };
}

/** The theme in effect: the reader's choice, else the system setting. The server render assumes light. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
}

function setTheme(t: Theme) {
  chosen = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    // storage blocked: the choice still holds for this tab
  }
  document.documentElement.dataset.theme = t;
  window.dispatchEvent(new Event(EVENT));
}

const Sun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </svg>
);
const Moon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);

/** Light / Dark switch: two real buttons; the one in effect is marked with aria-pressed. */
export function ThemeToggle() {
  const theme = useTheme();
  const { t } = useLang();
  // Keep <html data-theme> in sync when the system setting changes and no choice was saved.
  useEffect(() => {
    if (!saved()) delete document.documentElement.dataset.theme;
  }, [theme]);
  const btn = (value: Theme, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      aria-pressed={theme === value}
      title={label}
      onClick={() => setTheme(value)}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center ${theme === value ? "bg-ink text-sheet" : "text-pen hover:text-pen-dark"}`}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
  return (
    <div role="group" aria-label={t.themeLabel} className="inline-flex items-center rounded-xs border border-ink-soft">
      {btn("light", t.themeLight, <Sun />)}
      {btn("dark", t.themeDark, <Moon />)}
    </div>
  );
}
