import { connection } from "next/server";
import { Suspense } from "react";
import { Checker } from "@/components/Checker";
import { LangProvider, LangToggle, T } from "@/components/Lang";
import { ThemeToggle } from "@/components/Theme";
import { readMapsConfig } from "@/lib/server/maps-config";

// The page shell is prerendered. Runtime settings (the Maps key) are read per request and streamed in.
async function CheckerWithRuntimeConfig() {
  await connection();
  return <Checker maps={readMapsConfig()} />;
}

export default function Home() {
  return (
    <LangProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-sheet focus:p-2">
        <T k="skip" />
      </a>
      <header className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-5 lg:px-8">
        <p className="text-xl font-extrabold tracking-tight">Clearlease</p>
        <div className="contents sm:flex sm:items-center sm:gap-3">
          {/* On a phone the tagline drops to its own line, so the two switches fit beside the name. */}
          <p className="order-last w-full text-[14px] text-ink-soft sm:order-none sm:w-auto sm:text-right">
            <span className="sm:hidden">
              <T k="tagShort" />
            </span>
            <span className="hidden sm:inline">
              <T k="tagLong" />
            </span>
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LangToggle />
          </div>
        </div>
      </header>
      <main id="main">
        <div className="mx-auto max-w-[1240px] px-4 pt-6 pb-6 lg:px-8 lg:pt-12 lg:pb-9">
          <h1 className="max-w-[18ch] text-[30px] leading-[1.08] font-extrabold tracking-[-0.02em] sm:text-[46px]">
            <T k="h1" />
          </h1>
          <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
            <T k="lede" />
          </p>
        </div>
        <Suspense fallback={<Checker maps={null} />}>
          <CheckerWithRuntimeConfig />
        </Suspense>
      </main>
    </LangProvider>
  );
}
