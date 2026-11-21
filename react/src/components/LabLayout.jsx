import { ArrowRight, BookOpen, Link as LinkIcon, Newspaper } from "lucide-react";
import Badge from "./Badge.jsx";
import CodeBlock from "./CodeBlock.jsx";
import { nextLabOf } from "../lib/labsMeta.js";

function Section({ num, title, children }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-xs font-medium text-emerald-500/80">{num}</span>
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// Reusable 6-section lab page. Every lab passes the same props shape, so
// teammates can clone an existing lab file and swap in their own content.
export default function LabLayout({
  meta,       // entry from lib/labsMeta.js
  what,       // string | node — max 3 sentences
  vulnCode,   // { title, lines } for CodeBlock
  sandbox,    // node — the interactive sandbox (SandboxShell)
  why,        // string | node — 2–3 sentences
  incident,   // { title, text }
  fixCode,    // { title, lines } for CodeBlock
  sources,    // [{ label, href }]
}) {
  const next = nextLabOf(meta.id);
  const Icon = meta.icon;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      {/* Lab header */}
      <header className="flex items-start gap-4">
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60">
          <Icon size={20} className="text-emerald-400" />
        </span>
        <div>
          <p className="font-mono text-xs font-medium tracking-widest text-slate-500">
            LAB {meta.num}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{meta.subtitle}</p>
        </div>
      </header>

      <Section num="01" title="What it is">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge tone="amber">{meta.owasp}</Badge>
          <Badge tone="sky">{meta.cwe}</Badge>
        </div>
        <p className="max-w-3xl leading-7 text-slate-300">{what}</p>
      </Section>

      <Section num="02" title="The line">
        <CodeBlock title={vulnCode.title} lines={vulnCode.lines} />
      </Section>

      <Section num="03" title="Try it — The DOMino Interactive Sandbox">
        {sandbox}
      </Section>

      <Section num="04" title="Why it matters">
        <p className="max-w-3xl leading-7 text-slate-300">{why}</p>
        <div className="mt-4 max-w-3xl rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-400">
            <Newspaper size={13} />
            REAL-WORLD INCIDENT
          </div>
          <p className="mt-2 text-sm font-medium text-slate-200">{incident.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{incident.text}</p>
        </div>
      </Section>

      <Section num="05" title="The fix">
        <CodeBlock title={fixCode.title} lines={fixCode.lines} />
      </Section>

      <Section num="06" title="Sources">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <ul className="space-y-2">
            {sources.map((src) => (
              <li key={src.href}>
                <a
                  href={src.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-300 hover:text-emerald-400"
                >
                  <LinkIcon size={13} />
                  {src.label}
                </a>
              </li>
            ))}
          </ul>

          {next ? (
            <a
              href={`#${next.path}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all duration-300 ease-out hover:bg-white hover:shadow-lg hover:shadow-emerald-500/10"
            >
              Next Lab: {next.title.split(" ").slice(0, 2).join(" ")}
              <ArrowRight size={15} />
            </a>
          ) : (
            <a
              href="#/"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all duration-300 ease-out hover:bg-white hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <BookOpen size={15} />
              Back to all labs
            </a>
          )}
        </div>
      </Section>
    </main>
  );
}
