import { Fragment } from "react";
import { ArrowDown, Lock } from "lucide-react";
import XRayScanner from "../components/XRayScanner.jsx";
import LabPlates from "../components/LabPlates.jsx";

const TELEMETRY = [
  ["SANDBOX", "CLIENT-SIDE ISOLATED"],
  ["EXECUTION", "ZERO-BACKEND"],
  ["MODULES", "03 INTERACTIVE EXPLOITS"],
  ["MODE", "X-RAY INSPECTION"],
];

export default function Home() {
  return (
    <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grid items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-20">
        {/* Left — copy */}
        <div className="animate-rise mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] text-white sm:text-6xl">
            See beneath the{" "}
            <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              surface
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/55 lg:mx-0 lg:text-lg">
            Interactive client-side security labs — trigger real exploits,
            inspect the flawed line, and verify the fix.
          </p>

          <a
            href="#labs"
            className="group mt-8 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#050505] transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]"
          >
            Explore Labs
            <ArrowDown size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </div>

        {/* Right — the live widget, framed as a real app window */}
        <div className="animate-rise relative" style={{ animationDelay: "120ms" }}>
          {/* white spotlight so the frosted glass catches light */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-white/[0.07] blur-3xl"
          />
          <div className="glass overflow-hidden rounded-xl shadow-2xl shadow-black/60">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3.5 py-2.5">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </span>
              <div className="mx-auto flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-white/50">
                <Lock size={10} className="text-white/60" />
                vaultpay.app
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-white/70">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                LIVE
              </span>
            </div>
            <XRayScanner />
          </div>
        </div>
      </section>

      {/* ── Telemetry strip ─────────────────────────────────────────────── */}
      <div className="-mx-4 border-y border-white/10 bg-white/[0.02] sm:-mx-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-y-2 px-4 py-3 font-mono text-[10px] tracking-wider sm:px-6 sm:text-[11px]">
          {TELEMETRY.map(([k, v], i) => (
            <Fragment key={k}>
              {i > 0 && (
                <span className="mx-3 hidden h-3 w-px bg-white/15 sm:mx-5 sm:inline-block" />
              )}
              <span className="mx-2 sm:mx-0">
                <span className="text-white/35">{k}:</span>{" "}
                <span className="text-white/70">{v}</span>
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* ── The labs ────────────────────────────────────────────────────── */}
      <section id="labs" className="scroll-mt-20 py-20">
        <p className="font-mono text-xs font-medium tracking-[0.25em] text-white/50">
          THREE INTERACTIVE LABS
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          Vulnerabilities you can press on.
        </h2>

        <div className="mt-10">
          <LabPlates />
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center font-mono text-xs text-white/40">
        DOMino — every exploit here runs as a safe simulation in your own browser
        tab.
      </footer>
    </main>
  );
}
