import { Checker } from "@/components/Checker";

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
        <div className="mx-auto max-w-[1240px] px-4 pt-8 pb-8 lg:px-8 lg:pt-12">
          <h1 className="max-w-[18ch] text-[32px] leading-[1.1] font-extrabold tracking-tight sm:text-[44px]">
            Check a rental before you send money.
          </h1>
          <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
            Paste a listing or add a lease photo. We check the price, the scam warning signs and the lease clauses, and quote the words behind each one.
          </p>
        </div>
        <Checker />
      </main>
    </>
  );
}
