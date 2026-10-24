import { connection } from "next/server";
import { Suspense } from "react";
import { Checker } from "@/components/Checker";
import { readMapsConfig } from "@/lib/server/maps-config";

// The page shell is prerendered. Runtime settings (the Maps key) are read per request and streamed in.
async function CheckerWithRuntimeConfig() {
  await connection();
  return <Checker maps={readMapsConfig()} />;
}

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-sheet focus:p-2">
        Skip to the checker
      </a>
      <header className="mx-auto flex max-w-[1240px] items-baseline justify-between gap-4 px-4 pt-5 lg:px-8">
        <p className="text-xl font-extrabold tracking-tight">Clearlease</p>
        <p className="text-right text-[14px] text-ink-soft">
          <span className="sm:hidden">DC, MD and VA renters</span>
          <span className="hidden sm:inline">For renters in DC, Maryland and Virginia</span>
        </p>
      </header>
      <main id="main">
        <div className="mx-auto max-w-[1240px] px-4 pt-6 pb-6 lg:px-8 lg:pt-12 lg:pb-9">
          <h1 className="max-w-[18ch] text-[30px] leading-[1.08] font-extrabold tracking-[-0.02em] sm:text-[46px]">
            Check a rental before you send money.
          </h1>
          <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
            Paste a listing or add a lease photo. We check the price, the scam warning signs and the lease clauses, and quote the words behind each one.
          </p>
        </div>
        <Suspense fallback={<Checker maps={null} />}>
          <CheckerWithRuntimeConfig />
        </Suspense>
      </main>
    </>
  );
}
