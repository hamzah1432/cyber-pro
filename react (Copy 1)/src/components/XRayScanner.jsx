import { useEffect, useRef } from "react";
import {
  Wallet,
  Send,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Crosshair,
} from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────────
   XRayScanner — the signature interaction.

   Two layers stacked in the same box:
     • SurfaceMock  — a normal, trustworthy-looking payment app.
     • XrayMock     — what's really underneath: the skeleton + the vulnerable
                      line glowing red, like a fracture on an X-ray film.

   A circular "lens" follows the pointer and clips the X-ray layer so you only
   see through where the scanner is. When the pointer is away, the lens drifts
   on a gentle idle sweep so the effect is alive on touch screens too.
   All motion is driven in one requestAnimationFrame loop mutating styles
   directly — no per-frame React re-renders.
   ─────────────────────────────────────────────────────────────────────────── */

export default function XRayScanner() {
  const wrapRef = useRef(null);
  const filmRef = useRef(null);
  const lensRef = useRef(null);
  const s = useRef({
    x: 0, y: 0, tx: 0, ty: 0, r: 130, active: false, t: 0, w: 0, h: 0,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const st = s.current;
      st.w = rect.width;
      st.h = rect.height;
      st.r = Math.max(84, Math.min(148, rect.width * 0.2));
      if (!st.active) {
        st.tx = rect.width / 2;
        st.ty = rect.height / 2;
      }
    };
    measure();
    window.addEventListener("resize", measure);

    let raf;
    const loop = () => {
      const st = s.current;
      if (!st.active) {
        st.t += 0.016;
        st.tx = st.w / 2 + Math.sin(st.t * 0.65) * st.w * 0.3;
        st.ty = st.h / 2 + Math.sin(st.t * 1.25) * st.h * 0.2;
      }
      st.x += (st.tx - st.x) * 0.16;
      st.y += (st.ty - st.y) * 0.16;
      if (filmRef.current) {
        filmRef.current.style.clipPath = `circle(${st.r}px at ${st.x}px ${st.y}px)`;
      }
      if (lensRef.current) {
        lensRef.current.style.width = `${st.r * 2}px`;
        lensRef.current.style.height = `${st.r * 2}px`;
        lensRef.current.style.left = `${st.x}px`;
        lensRef.current.style.top = `${st.y}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    s.current.tx = e.clientX - rect.left;
    s.current.ty = e.clientY - rect.top;
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerEnter={() => (s.current.active = true)}
      onPointerLeave={() => (s.current.active = false)}
      className="relative aspect-[16/10] w-full cursor-crosshair select-none overflow-hidden bg-slate-950"
    >
      {/* Layer 1 — the clean, normal-looking surface */}
      <SurfaceMock />

      {/* Layer 2 — the X-ray, clipped to the lens */}
      <div
        ref={filmRef}
        className="film film-scanlines film-sweep absolute inset-0"
        style={{ clipPath: "circle(0px at 50% 50%)" }}
      >
        <XrayMock />
      </div>

      {/* The scanner lens / reticle */}
      <div
        ref={lensRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          boxShadow:
            "0 0 0 1px rgb(45 212 191 / 0.55), 0 0 36px 2px rgb(45 212 191 / 0.18), inset 0 0 40px rgb(8 47 55 / 0.6)",
        }}
      >
        <Crosshair
          size={16}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-300/70"
        />
        <span className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[9px] tracking-[0.3em] text-teal-300/80">
          SCANNING
        </span>
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1 font-mono text-[10px] tracking-wide text-slate-400 backdrop-blur-sm">
        move across the panel to x-ray the app
      </div>
    </div>
  );
}

function Corner({ className }) {
  return (
    <span
      className={`pointer-events-none absolute h-4 w-4 border-teal-400/40 ${className}`}
    />
  );
}

/* ── The normal surface: a trustworthy payment widget ────────────────────── */
function SurfaceMock() {
  return (
    <div className="absolute inset-0 grid grid-cols-5">
      {/* faux sidebar */}
      <div className="col-span-2 hidden flex-col gap-3 border-r border-slate-800/80 bg-slate-900/40 p-5 sm:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10">
            <ShieldCheck size={14} className="text-emerald-400" />
          </span>
          <span className="text-sm font-semibold text-slate-200">VaultPay</span>
        </div>
        <div className="mt-2 space-y-2">
          {["Overview", "Transfers", "Cards", "Settings"].map((t, i) => (
            <div
              key={t}
              className={`rounded-md px-2.5 py-1.5 text-xs ${
                i === 1 ? "bg-slate-800/80 text-slate-200" : "text-slate-500"
              }`}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* main panel */}
      <div className="col-span-5 flex items-center justify-center p-5 sm:col-span-3">
        <div className="w-full max-w-xs rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10">
                <Wallet size={15} className="text-sky-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">Send money</p>
                <p className="text-[10px] text-slate-500">VaultPay Wallet</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
              <Lock size={9} /> Secure
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] text-slate-500">Available balance</p>
            <p className="text-2xl font-bold tracking-tight text-slate-50">
              $1,000<span className="ml-1 text-xs font-medium text-slate-500">USD</span>
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
              <p className="text-[10px] text-slate-500">Recipient</p>
              <p className="font-mono text-xs text-slate-300">0x71C7…9A3F</p>
            </div>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-slate-950">
              <Send size={12} /> Send $1,000
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── The X-ray: the skeleton + the fracture (vulnerable line) ────────────── */
function XrayMock() {
  return (
    <div className="absolute inset-0 grid grid-cols-5 text-teal-100">
      {/* wireframe sidebar bones */}
      <div className="col-span-2 hidden flex-col gap-3 border-r border-teal-400/20 p-5 sm:flex">
        <div className="h-7 w-7 rounded-md border border-teal-400/30" />
        <div className="mt-2 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-6 rounded-md border ${
                i === 1 ? "border-red-400/50 bg-red-500/10" : "border-teal-400/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* exposed internals */}
      <div className="relative col-span-5 flex items-center justify-center p-4 sm:col-span-3">
        {/* wireframe of the card */}
        <div className="w-full max-w-xs rounded-xl border border-teal-400/25 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-teal-300/70">
              DOM: wallet-widget
            </span>
            <AlertTriangle size={13} className="animate-blip text-red-400" />
          </div>

          {/* the vulnerable code, exposed */}
          <pre className="rounded-lg border border-teal-400/15 bg-black/40 p-3 font-mono text-[10px] leading-5">
            <div className="text-teal-200/70">window.addEventListener(</div>
            <div className="text-teal-200/70">  "message", (e) =&gt; {"{"}</div>
            <div className="relative -mx-1 my-0.5 rounded border-l-2 border-red-500 bg-red-500/20 px-1 text-red-300">
              wallet.send(e.data.amount)
              <span className="ml-1 text-red-400/80">// no origin check</span>
              <span className="absolute -left-2 top-1/2 h-2 w-2 -translate-y-1/2 animate-blip rounded-full bg-red-500" />
            </div>
            <div className="text-teal-200/70">  {"}"})</div>
          </pre>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="rounded border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-red-400">
              CWE-346
            </span>
            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-400">
              ORIGIN NOT VALIDATED
            </span>
          </div>
        </div>

        {/* ticker */}
        <span className="absolute left-4 top-3 font-mono text-[9px] tracking-[0.25em] text-red-400/80">
          ▸ VULNERABILITY DETECTED
        </span>
      </div>
    </div>
  );
}
