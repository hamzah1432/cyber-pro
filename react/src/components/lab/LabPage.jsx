import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { SPECIMENS } from "../LabPlates.jsx";
import { nextLabOf } from "../../lib/labsMeta.js";
import CodeFilm from "./CodeFilm.jsx";

const SECTIONS = [
  ["what", "What it is"],
  ["line", "The line"],
  ["try", "Try it"],
  ["why", "Why it matters"],
  ["fix", "The fix"],
  ["sources", "Sources"],
];

const jump = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const owaspLabel = (lab) =>
  lab.owaspCode ? `OWASP ${lab.owaspCode} · ${lab.owaspName}` : `OWASP attack class · ${lab.owaspName}`;

/* One lab = one film plate taken off the homepage light-box and read in full.
   Props carry the lab's content; the page owns layout, navigation and motion. */
export default function LabPage({ lab, what, line, sandbox, why, incident, fix, sources, onVerifyFix }) {
  const articleRef = useRef(null);

  useEffect(() => {
    const previous = document.title;
    document.title = `${lab.title} — DOMino Security`;
    return () => {
      document.title = previous;
    };
  }, [lab.title]);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ── Plate header ─────────────────────────────────────────────────── */}
      <header className="grid items-center gap-12 pb-14 pt-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 lg:pt-14">
        <div className="animate-rise">
          <a
            href="#labs"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/45 transition-colors duration-300 hover:text-white"
          >
            <ArrowLeft size={13} /> LIGHT-BOX
          </a>
          <div className="mt-8 flex items-center gap-3">
            <p className="font-mono text-xs tracking-[0.25em] text-white/50">PLATE {lab.num}</p>
            {lab.challenge && (
              <span className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[9px] tracking-wide text-white/75">
                CHALLENGE
              </span>
            )}
          </div>
          <h1 className="font-display mt-3 text-4xl font-bold leading-[1.02] text-white sm:text-6xl">{lab.title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/55 sm:text-lg">{lab.subtitle}</p>

          <dl className="mt-8 grid max-w-xl grid-cols-1 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 font-mono text-[10.5px] tracking-wide sm:grid-cols-3">
            {[
              ["CLASS", lab.klass],
              ["WEAKNESS", lab.cwe],
              ["OWASP", lab.owaspCode ?? "ATTACK CLASS"],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#0b0b0d] px-3 py-2.5">
                <dt className="text-white/35">{k}</dt>
                <dd className="mt-0.5 text-white/85">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeaderFilm lab={lab} />
      </header>

      <SectionStrip articleRef={articleRef} />

      {/* ── The six sections ─────────────────────────────────────────────── */}
      <div ref={articleRef}>
        <Section id="what" n={1} title="What it is">
          <div className="max-w-2xl text-lg leading-8 text-white/75">{what}</div>
          <p className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] tracking-wide">
            <span className="rounded-full border border-white/20 px-2.5 py-1 text-white/75">{owaspLabel(lab)}</span>
            <span className="rounded-full border border-white/20 px-2.5 py-1 text-white/75">{lab.cwe}</span>
          </p>
        </Section>

        <Section id="line" n={2} title="The line">
          <CodeFilm {...line} />
        </Section>

        <Section id="try" n={3} title="Try it" wide>
          <p className="-mt-3 mb-6 max-w-2xl text-sm leading-6 text-white/55">
            Fire a payload and watch the app react. Then switch to <span className="font-mono text-white/80">PATCHED</span>{" "}
            and fire the same payload again — it should fail.
          </p>
          {sandbox}
        </Section>

        <Section id="why" n={4} title="Why it matters">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <div className="max-w-2xl text-lg leading-8 text-white/75">{why}</div>
            <IncidentCard {...incident} />
          </div>
        </Section>

        <Section id="fix" n={5} title="The fix">
          <CodeFilm {...fix} />
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                onVerifyFix?.();
                jump("try");
              }}
              className="group inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#050505] transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]"
            >
              Verify the patch in the sandbox
              <ArrowUp size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
            <span className="font-mono text-[11px] tracking-wide text-white/40">switches the sandbox to PATCHED</span>
          </div>
        </Section>

        <Section id="sources" n={6} title="Sources">
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {sources.map((s, i) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-3.5"
                >
                  <span className="font-mono text-[11px] text-white/30">[{String(i + 1).padStart(2, "0")}]</span>
                  <span className="min-w-0 text-sm text-white/80 transition-colors duration-300 group-hover:text-white">
                    {s.label}
                  </span>
                  <span className="ml-auto hidden shrink-0 font-mono text-[11px] text-white/35 sm:inline">
                    {new URL(s.href).hostname.replace(/^www\./, "")}
                  </span>
                  <ArrowUpRight size={14} className="shrink-0 text-white/35 transition-colors duration-300 group-hover:text-white" />
                </a>
              </li>
            ))}
          </ol>
          <NextPlate lab={lab} />
        </Section>
      </div>

      <footer className="border-t border-white/10 py-8 text-center font-mono text-xs text-white/40">
        DOMino — every exploit here runs as a safe simulation in your own browser tab.
      </footer>
    </main>
  );
}

/* The homepage plate, now on the viewer: it lands on SURFACE, then scans
   itself to X-RAY. The toggle lets the reader flip between the two. */
function HeaderFilm({ lab }) {
  const { Surface, Xray, tag } = SPECIMENS[lab.id];
  const [xray, setXray] = useState(false);

  useEffect(() => {
    setXray(false);
    const t = setTimeout(() => setXray(true), 700);
    return () => clearTimeout(t);
  }, [lab.id]);

  const view = (on, label) => (
    <button
      type="button"
      onClick={() => setXray(on)}
      aria-pressed={xray === on}
      className={`rounded-[5px] py-1.5 transition-colors duration-300 ${
        xray === on ? "bg-white text-[#050505]" : "text-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <figure
      className="plate animate-rise w-full max-w-sm justify-self-center pt-1.5 lg:max-w-none"
      style={{ "--on": xray ? 1 : 0, animationDelay: "120ms" }}
    >
      <div className="glass relative rounded-xl px-3 pb-3">
        <span className="absolute left-1/2 top-0 h-2.5 w-12 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-white/20 bg-[#141417]" />
        <div className="flex items-center justify-between px-1 pb-2.5 pt-4 font-mono text-[10px] tracking-[0.2em]">
          <span className="text-white/45">PLATE {lab.num}</span>
          <span className="flex items-center gap-2">
            <span className="relative inline-grid text-right">
              <span className="plate-state-off col-start-1 row-start-1 text-white/30">SURFACE</span>
              <span className="plate-state-on col-start-1 row-start-1 text-white">EXPOSED</span>
            </span>
            <span className="plate-led h-1.5 w-1.5 rounded-[1px]" />
          </span>
        </div>

        <div aria-hidden className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[#0c0c0e]">
          <div className="absolute inset-0 p-4">
            <Surface />
          </div>
          <div className="plate-xr film-scanlines absolute inset-0 p-4">
            <span className="absolute right-3 top-3 z-10 rounded-[3px] border border-white/40 bg-black/60 px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.16em] text-white">
              {tag}
            </span>
            <Xray />
          </div>
          <div className="plate-scan pointer-events-none absolute inset-0" />
        </div>

        <div
          role="group"
          aria-label="Film view"
          className="mt-3 grid grid-cols-2 gap-1 rounded-md border border-white/10 bg-black/30 p-0.5 font-mono text-[10.5px] tracking-[0.16em]"
        >
          {view(false, "SURFACE")}
          {view(true, "X-RAY")}
        </div>
      </div>
    </figure>
  );
}

/* Sticky index of the six sections. The active one follows the reader, and a
   1px scan line along the bottom edge tracks progress through the plate. */
function SectionStrip({ articleRef }) {
  const [active, setActive] = useState("what");
  const barRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = articleRef.current;
      if (!el || !barRef.current) return;
      // 0 when the first section reaches the strip, 1 at the bottom of the page
      const start = el.getBoundingClientRect().top + window.scrollY - 120;
      const end = document.documentElement.scrollHeight - window.innerHeight;
      const p = (window.scrollY - start) / Math.max(end - start, 1);
      barRef.current.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [articleRef]);

  return (
    <nav
      aria-label="Lab sections"
      className="sticky top-16 z-40 -mx-4 border-y border-white/10 bg-[#050505]/85 backdrop-blur-md sm:-mx-6"
    >
      <div className="mx-auto flex max-w-6xl items-center overflow-x-auto px-4 [scrollbar-width:none] sm:px-6">
        {SECTIONS.map(([id, label], i) => (
          <button
            key={id}
            type="button"
            onClick={() => jump(id)}
            aria-current={active === id ? "location" : undefined}
            className={`flex shrink-0 items-center gap-2 px-3 py-3 font-mono text-[10.5px] tracking-[0.16em] transition-colors duration-300 first:pl-0 ${
              active === id ? "text-white" : "text-white/40 hover:text-white/75"
            }`}
          >
            <span className={active === id ? "text-white" : "text-white/25"}>0{i + 1}</span>
            {label.toUpperCase()}
          </button>
        ))}
      </div>
      <span
        ref={barRef}
        aria-hidden
        className="absolute -bottom-px left-0 h-px w-full origin-left bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </nav>
  );
}

function Section({ id, n, title, wide, children }) {
  return (
    <section id={id} className="relative scroll-mt-28 border-t border-white/10 py-14 first:border-t-0 sm:py-16">
      <span aria-hidden className="pointer-events-none absolute -left-1 -top-[11px] select-none font-mono text-sm text-white/25">
        +
      </span>
      <div className={wide ? "" : "grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12"}>
        <header className={wide ? "mb-6" : ""}>
          <p className="font-mono text-xs tracking-[0.25em] text-white/40">0{n}</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function IncidentCard({ label, title, text, href, linkLabel }) {
  return (
    <aside className="glass relative self-start rounded-xl p-5">
      <span aria-hidden className="pointer-events-none absolute -left-2 -top-3 select-none font-mono text-sm text-white/25">+</span>
      <span aria-hidden className="pointer-events-none absolute -right-2 -top-3 select-none font-mono text-sm text-white/25">+</span>
      <p className="font-mono text-[10.5px] tracking-[0.2em] text-white/45">REAL WORLD · {label}</p>
      <p className="font-display mt-2 text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-white/55 transition-colors duration-300 hover:text-white"
        >
          {linkLabel} <ArrowUpRight size={12} />
        </a>
      )}
    </aside>
  );
}

function NextPlate({ lab }) {
  const next = nextLabOf(lab.id);
  return (
    <a
      href={next ? `#${next.path}` : "#labs"}
      className="group mt-12 flex items-center justify-between gap-6 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-5 transition-colors duration-300 hover:border-white/40"
    >
      <span className="min-w-0">
        <span className="block font-mono text-[10.5px] tracking-[0.2em] text-white/40">
          {next ? `NEXT PLATE ${next.num}` : "END OF SERIES"}
        </span>
        <span className="font-display mt-1.5 block text-xl font-bold text-white sm:text-2xl">
          {next ? next.title : "Back to the light-box"}
        </span>
        <span className="mt-1 block text-sm text-white/50">
          {next ? next.summary : "All three plates are on the homepage viewer."}
        </span>
      </span>
      <ArrowRight
        size={20}
        className="shrink-0 text-white/45 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
      />
    </a>
  );
}
