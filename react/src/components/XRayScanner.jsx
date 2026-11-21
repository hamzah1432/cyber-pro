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
        // 1px inside the ring so revealed code never touches the lens edge
        filmRef.current.style.clipPath = `circle(${st.r - 1}px at ${st.x}px ${st.y}px)`;
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
      className="relative aspect-[16/10] w-full cursor-crosshair select-none overflow-hidden bg-[#0D0D0F]"
    >
      {/* Layer 1 — the clean, normal-looking surface */}
      <SurfaceMock />

      {/* Layer 2 — the X-ray, clipped to the lens */}
      <div
        ref={filmRef}
        className="film film-scanlines film-sweep absolute inset-0 overflow-hidden"
        style={{ clipPath: "circle(0px at 50% 50%)" }}
      >
        <XrayMock />
      </div>

      {/* The scanner lens / reticle */}
      <div
        ref={lensRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          boxShadow:
            "0 0 0 1px rgb(255 255 255 / 0.65), 0 0 36px 2px rgb(255 255 255 / 0.2), inset 0 0 44px rgb(255 255 255 / 0.07)",
        }}
      >
        <Crosshair
          size={16}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80"
        />
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[10px] tracking-wide text-white/50 backdrop-blur-sm">
        move across the panel to x-ray the app
      </div>
    </div>
  );
}

function Corner({ className }) {
  return (
    <span
      className={`pointer-events-none absolute h-4 w-4 border-white/40 ${className}`}
    />
  );
}

/* ── The normal surface: a trustworthy payment widget ────────────────────── */
function SurfaceMock() {
  return (
    <div className="absolute inset-0 grid grid-cols-5">
      {/* faux sidebar */}
      <div className="col-span-2 hidden flex-col gap-3 border-r border-white/10 bg-white/[0.02] p-5 sm:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/5">
            <ShieldCheck size={14} className="text-white" />
          </span>
          <span className="text-sm font-semibold text-white/90">VaultPay</span>
        </div>
        <div className="mt-2 space-y-2">
          {["Overview", "Transfers", "Cards", "Settings"].map((t, i) => (
            <div
              key={t}
              className={`rounded-md px-2.5 py-1.5 text-xs ${
                i === 1 ? "bg-white/10 text-white/90" : "text-white/40"
              }`}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* main panel */}
      <div className="col-span-5 flex items-center justify-center p-5 sm:col-span-3">
        <div className="w-full max-w-xs rounded-xl border border-white/10 bg-[#0D0D0F] p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                <Wallet size={15} className="text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Send money</p>
                <p className="text-[10px] text-white/40">VaultPay Wallet</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-medium text-white/70">
              <Lock size={9} /> Secure
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] text-white/40">Available balance</p>
            <p className="text-2xl font-bold tracking-tight text-white">
              $1,000<span className="ml-1 text-xs font-medium text-white/40">USD</span>
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <p className="text-[10px] text-white/40">Recipient</p>
              <p className="font-mono text-xs text-white/70">0x71C7…9A3F</p>
            </div>
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-semibold text-[#050505]">
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
    <div className="absolute inset-0 grid grid-cols-5 text-white/85">
      {/* wireframe sidebar bones */}
      <div className="col-span-2 hidden flex-col gap-3 border-r border-white/15 p-5 sm:flex">
        <div className="h-7 w-7 rounded-md border border-white/25" />
        <div className="mt-2 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-6 rounded-md border ${
                i === 1 ? "border-white/70 bg-white/10" : "border-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* exposed internals */}
      <div className="relative col-span-5 flex items-center justify-center p-4 sm:col-span-3">
        {/* wireframe of the card */}
        <div className="w-full max-w-xs rounded-xl border border-white/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-white/60">
              DOM: wallet-widget
            </span>
            <AlertTriangle size={13} className="animate-blip text-white" />
          </div>

          {/* the vulnerable code, exposed */}
          <pre className="rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[10px] leading-5">
            <div className="text-white/55">window.addEventListener(</div>
            <div className="text-white/55">  "message", (e) =&gt; {"{"}</div>
            <div className="relative -mx-1 my-0.5 rounded border-l-2 border-white bg-white/15 px-1 text-white">
              wallet.send(e.data.amount)
              <span className="ml-1 text-white/60">// no origin check</span>
              <span className="absolute -left-2 top-1/2 h-2 w-2 -translate-y-1/2 animate-blip rounded-full bg-white" />
            </div>
            <div className="text-white/55">  {"}"})</div>
          </pre>

          <div className="mt-3 flex items-center gap-1.5">
            <span className="rounded border border-white/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white/90">
              CWE-346
            </span>
            <span className="rounded border border-white/25 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white/70">
              ORIGIN NOT VALIDATED
            </span>
          </div>
        </div>

        {/* ticker */}
        <span className="absolute left-4 top-3 font-mono text-[9px] tracking-[0.25em] text-white/70">
          ▸ VULNERABILITY DETECTED
        </span>
      </div>
    </div>
  );
}
