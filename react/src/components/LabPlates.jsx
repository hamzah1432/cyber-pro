import { useEffect, useRef } from "react";
import { ArrowUpRight, Lock, LoaderCircle } from "lucide-react";
import { LABS } from "../lib/labsMeta.js";

/* The three labs as X-ray films clipped onto a light-box viewer. Each plate
   shows an ordinary UI; hovering (or focusing) it switches on the backlight
   and a scan line exposes the mechanism of the flaw underneath. Reveal and
   dimming mechanics live in index.css under "Lab plates". */
export default function LabPlates() {
  const boxRef = useRef(null);

  // Touch screens can't hover, so each plate runs its scan once as it
  // scrolls into view instead.
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.dataset.exposed = "";
          io.unobserve(e.target);
        }
      },
      { threshold: 0.6 }
    );
    boxRef.current?.querySelectorAll(".plate").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="lightbox relative rounded-2xl p-3 sm:p-5">
      <Tick className="-left-3 -top-3" />
      <Tick className="-right-3 -top-3" />
      <Tick className="-bottom-3 -left-3" />
      <Tick className="-bottom-3 -right-3" />

      <div className="mb-5 flex items-center justify-between px-1 font-mono text-[10px] tracking-[0.2em] text-white/35">
        <span>LIGHT-BOX · 03 PLATES</span>
        <span className="flex items-center gap-4">
          <span className="hover-only">HOVER TO EXPOSE</span>
          <span className="flex items-center gap-2.5">
            {LABS.map((lab) => (
              <span key={lab.id} className="flex items-center gap-1.5">
                <span data-plate={lab.num} className="rail-led h-1.5 w-1.5 rounded-[1px]" />
                {lab.num}
              </span>
            ))}
          </span>
        </span>
      </div>

      <div className="mx-auto grid max-w-md gap-6 lg:max-w-none lg:grid-cols-3 lg:gap-4">
        {LABS.map((lab) => {
          const { Surface, Xray, tag } = SPECIMENS[lab.id];
          return (
            <a
              key={lab.id}
              href={`#${lab.path}`}
              target="_blank"
              rel="noopener noreferrer"
              data-plate={lab.num}
              aria-label={`Launch Lab ${lab.num}: ${lab.title} (opens in a new tab)`}
              className="plate group block pt-1.5 outline-none"
            >
              <div className="plate-film relative flex h-full flex-col rounded-xl">
                {/* film clip */}
                <span className="absolute left-1/2 top-0 h-2.5 w-12 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-white/20 bg-[#141417]" />

                {/* plate header */}
                <div className="flex items-center justify-between px-4 pb-2.5 pt-4 font-mono text-[10px] tracking-[0.2em]">
                  <span className="text-white/45">PLATE {lab.num}</span>
                  <span className="flex items-center gap-2">
                    <span className="relative inline-grid text-right">
                      <span className="plate-state-off col-start-1 row-start-1 text-white/30">SURFACE</span>
                      <span className="plate-state-on col-start-1 row-start-1 text-white">EXPOSED</span>
                    </span>
                    <span className="plate-led h-1.5 w-1.5 rounded-[1px]" />
                  </span>
                </div>

                {/* specimen: surface UI + x-ray layer + scan line */}
                <div
                  aria-hidden
                  className="relative mx-3 aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-[#0c0c0e]"
                >
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

                {/* label */}
                <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold leading-tight text-white">
                      {lab.title}
                    </h3>
                    {lab.challenge && (
                      <span className="mt-0.5 shrink-0 rounded-full border border-white/25 px-2 py-0.5 font-mono text-[9px] tracking-wide text-white/75">
                        CHALLENGE
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-white/55">{lab.summary}</p>

                  <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 pt-0 font-mono text-[10px] tracking-wide">
                    <div className="bg-[#0b0b0d] px-2.5 py-2">
                      <dt className="text-white/35">CLASS</dt>
                      <dd className="mt-0.5 text-white/80">{lab.klass}</dd>
                    </div>
                    <div className="bg-[#0b0b0d] px-2.5 py-2">
                      <dt className="text-white/35">WEAKNESS</dt>
                      <dd className="mt-0.5 text-white/80">{lab.cwe}</dd>
                    </div>
                  </dl>
                </div>

                {/* launch strip */}
                <span className="plate-cta flex items-center justify-between rounded-b-xl border-t border-white/10 px-4 py-3 font-mono text-[11px] tracking-[0.18em] text-white/70">
                  LAUNCH LAB
                  <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Tick({ className }) {
  return (
    <span className={`pointer-events-none absolute select-none font-mono text-sm text-white/25 ${className}`}>
      +
    </span>
  );
}

/* ── Specimens: one ordinary surface + its exposed skeleton per lab ──────── */

const line = "h-1.5 rounded-full";

function ClobberSurface() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5">
        <span className="h-8 w-8 rounded-full border border-white/15 bg-white/10" />
        <div>
          <p className="text-[12px] font-semibold text-white/90">ada_lovelace</p>
          <p className="text-[10px] text-white/40">Member since 2019</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-white/55">
        Building small tools for the web. Portfolio below.
      </p>
      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded border border-white/15 px-2 py-0.5 text-[10px] text-white/70">
        my portfolio ↗
      </span>
      <p className="mt-auto flex items-center gap-1.5 text-[10px] text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-white/50" /> config loaded · api ready
      </p>
    </div>
  );
}

function ClobberXray() {
  return (
    <div className="flex h-full flex-col font-mono text-[10px] leading-[1.75] text-white/50">
      <p>body</p>
      <p>└─ div.bio</p>
      <p className="pl-[3ch]">
        └─{" "}
        <span className="rounded-[3px] bg-white/15 px-1 text-white ring-1 ring-white/60">a#config</span>{" "}
        <span className="text-white/40">name="apiUrl"</span>
      </p>
      <div className="mt-auto space-y-1 border-t border-dashed border-white/20 pt-2.5">
        <p>
          <span className="text-white/80">window.config</span> → <span className="text-white">&lt;a#config&gt;</span>
        </p>
        <p>
          <span className="text-white/80">config.apiUrl</span> → <span className="text-white">"//evil.example"</span>
        </p>
      </div>
    </div>
  );
}

function RedosSurface() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[12px] font-semibold text-white/90">Create account</p>
      <p className="mt-3 text-[10px] text-white/40">Username</p>
      <div className="mt-1 flex items-center rounded-md border border-white/15 bg-black/30 px-2.5 py-1.5 font-mono text-[10.5px] text-white/80">
        <span className="truncate">aaaaaaaaaaaaaaaaaaaaaaaa!</span>
        <span className="ml-px h-3 w-px shrink-0 animate-pulse bg-white/70" />
      </div>
      <div className="mt-2.5 flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#050505]">
        Check availability
        <LoaderCircle size={12} className="animate-spin" />
      </div>
      <p className="mt-auto text-[10px] text-white/40">checking…</p>
    </div>
  );
}

// steps ≈ 2ⁿ for n = 17…24, normalised to the last bar
const BARS = [17, 18, 19, 20, 21, 22, 23, 24].map((n) => 100 / 2 ** (24 - n));

function RedosXray() {
  return (
    <div className="flex h-full flex-col font-mono">
      <p className="text-[10px] text-white/45">pattern</p>
      <p className="text-[15px] leading-tight text-white">/^(a+)+$/</p>
      <div className="mt-3 flex flex-1 items-end gap-1.5 border-b border-l border-white/20 pl-1.5">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={`plate-bar min-h-[2px] flex-1 rounded-t-[1px] ${i === BARS.length - 1 ? "bg-white" : "bg-white/55"}`}
            style={{ height: `${h}%`, "--d": `${380 + i * 70}ms` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-white/35">
        <span>n=17</span>
        <span>input length</span>
        <span>n=24</span>
      </div>
      <p className="mt-1.5 text-[10px] text-white/60">
        24 × "a" + "!" → <span className="text-white">≈ 2²⁴ steps</span>
      </p>
    </div>
  );
}

function PaywallSurface() {
  return (
    <div className="relative flex h-full flex-col">
      <p className="font-mono text-[9px] tracking-[0.25em] text-white/40">THE LEDGER</p>
      <p className="font-display mt-1.5 text-[14px] font-bold leading-tight text-white/90">
        How the merger really happened
      </p>
      <div className="mt-2.5 space-y-1.5">
        <div className={`${line} w-full bg-white/25`} />
        <div className={`${line} w-11/12 bg-white/25`} />
      </div>
      <div className="mt-1.5 space-y-1.5 blur-[3px]">
        <div className={`${line} w-full bg-white/25`} />
        <div className={`${line} w-10/12 bg-white/25`} />
        <div className={`${line} w-full bg-white/25`} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[52%] items-end justify-center bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/95 to-transparent">
        <div className="flex items-center gap-2.5 rounded-md border border-white/15 bg-[#111114] px-3 py-2">
          <Lock size={12} className="text-white/70" />
          <span className="text-[10px] text-white/70">Subscribers only</span>
          <span className="rounded bg-white px-1.5 py-0.5 text-[9.5px] font-semibold text-[#050505]">
            Unlock · $4.99
          </span>
        </div>
      </div>
    </div>
  );
}

function PaywallXray() {
  return (
    <div className="flex h-full flex-col font-mono text-[10px]">
      <p className="text-[9px] tracking-[0.2em] text-white/40">article.premium</p>
      <p className="font-display mt-1.5 text-[14px] font-bold leading-tight text-white">
        How the merger really happened
      </p>
      <div className="mt-2.5 space-y-1.5">
        {["w-full", "w-11/12", "w-full", "w-10/12", "w-full"].map((w, i) => (
          <div key={i} className={`${line} ${w} bg-white/60`} />
        ))}
      </div>
      <div className="mt-auto space-y-0.5 rounded border border-dashed border-white/35 px-2 py-1.5 text-white/45">
        <p>
          div.paywall {"{"} <span className="text-white">filter: blur(6px)</span> {"}"}
        </p>
        <p>
          if (!<span className="text-white">user.isPremium</span>) showPaywall()
        </p>
      </div>
    </div>
  );
}

export const SPECIMENS = {
  lab01: { Surface: ClobberSurface, Xray: ClobberXray, tag: "GLOBAL SHADOWED" },
  lab02: { Surface: RedosSurface, Xray: RedosXray, tag: "MAIN THREAD BLOCKED" },
  lab03: { Surface: PaywallSurface, Xray: PaywallXray, tag: "FULL TEXT IN DOM" },
};
