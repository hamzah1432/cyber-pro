import { Braces, ArrowLeftRight, ExternalLink, ArrowDown, ArrowUpRight, Lock } from "lucide-react";
import XRayScanner from "../components/XRayScanner.jsx";

const LABS = [
  {
    num: "01",
    title: "DOM Clobbering",
    path: "/lab/dom-clobbering",
    icon: Braces,
    accent: "violet",
    summary: "Injected HTML overwrites the globals your JavaScript trusts — no <script> needed.",
    code: [
      ["tag", "<form "],
      ["attr", "id"],
      ["op", "="],
      ["str", '"config"'],
      ["tag", ">"],
    ],
    owasp: "OWASP A03: Injection",
    cwe: "CWE-79",
    challenge: true,
  },
  {
    num: "02",
    title: "Insecure postMessage",
    path: "/lab/postmessage",
    icon: ArrowLeftRight,
    accent: "sky",
    summary: "A handler that skips event.origin becomes an open API any page can call.",
    code: [
      ["fn", "postMessage"],
      ["op", "("],
      ["plain", "payload, "],
      ["str", '"*"'],
      ["op", ")"],
    ],
    owasp: "OWASP A01: Broken Access Control",
    cwe: "CWE-346",
    challenge: false,
  },
  {
    num: "03",
    title: "Reverse Tabnabbing",
    path: "/lab/tabnabbing",
    icon: ExternalLink,
    accent: "amber",
    summary: 'A _blank link with no rel="noopener" lets the new tab rewrite your page.',
    code: [
      ["plain", "window."],
      ["fn", "opener"],
      ["plain", "."],
      ["attr", "location"],
    ],
    owasp: "OWASP A04: Insecure Design",
    cwe: "CWE-1022",
    challenge: false,
  },
];

const CODE_TONE = {
  tag: "text-violet-300",
  attr: "text-sky-300",
  str: "text-amber-300",
  fn: "text-emerald-300",
  op: "text-slate-500",
  plain: "text-slate-300",
};

const ACCENT = {
  violet: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  sky: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  amber: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

export default function Home() {
  return (
    <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grid items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-20">
        {/* Left — copy */}
        <div className="animate-rise mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
            See beneath the{" "}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              surface
            </span>
            .
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-400 lg:mx-0 lg:text-lg">
            Interactive client-side security labs — trigger real exploits,
            inspect the flawed line, and verify the fix.
          </p>

          <a
            href="#labs"
            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            Explore Labs
            <ArrowDown size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>
        </div>

        {/* Right — the live widget, framed as a real app window */}
        <div className="animate-rise relative" style={{ animationDelay: "120ms" }}>
          {/* spotlight glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-emerald-500/10 blur-3xl"
          />
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/70 px-3.5 py-2.5">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              </span>
              <div className="mx-auto flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/70 px-3 py-1 font-mono text-[11px] text-slate-500">
                <Lock size={10} className="text-emerald-500/80" />
                vaultpay.app
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>
            <XRayScanner />
          </div>
        </div>
      </section>

      {/* ── The labs ────────────────────────────────────────────────────── */}
      <section id="labs" className="scroll-mt-20 border-t border-slate-800/70 py-20">
        <p className="font-mono text-xs font-semibold tracking-[0.25em] text-teal-400">
          THREE INTERACTIVE LABS
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Vulnerabilities you can press on.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LABS.map((lab) => {
            const Icon = lab.icon;
            return (
              <a
                key={lab.num}
                href={`#${lab.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="lift group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md hover:border-slate-600 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                {/* header */}
                <div className="flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${ACCENT[lab.accent]}`}>
                    <Icon size={19} />
                  </span>
                  <div className="flex items-center gap-2">
                    {lab.challenge && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-amber-400">
                        CHALLENGE
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-600">LAB {lab.num}</span>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight">{lab.title}</h3>
                <p className="mt-1.5 min-h-[2.5rem] text-sm leading-6 text-slate-400">
                  {lab.summary}
                </p>

                {/* mini code preview — signals a live sandbox */}
                <div className="mt-4 flex items-center gap-2 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <span className="font-mono text-[11px] text-slate-600">›</span>
                  <code className="truncate font-mono text-[11.5px]">
                    {lab.code.map(([tone, text], i) => (
                      <span key={i} className={CODE_TONE[tone]}>
                        {text}
                      </span>
                    ))}
                  </code>
                </div>

                {/* badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
                    {lab.owasp}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
                    {lab.cwe}
                  </span>
                </div>

                {/* full-width launch button — fills on card hover */}
                <span className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/40 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-300 group-hover:border-emerald-500 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                  Launch Lab
                  <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-800/70 py-8 text-center text-xs text-slate-500">
        DOMino — every exploit here runs as a safe simulation in your own browser
        tab.
      </footer>
    </main>
  );
}
