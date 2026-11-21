import { useEffect, useRef } from "react";
import { Lock, RotateCcw, Trash2 } from "lucide-react";

/* Shared building blocks for every lab's "Try it" sandbox. Outcome states are
   told apart by contrast, not colour: EXPLOITED is an inverted white chip,
   BLOCKED an outlined one, so the page stays strictly monochrome. */

export const logEntry = (fields) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  time: new Date().toLocaleTimeString("en-GB"),
  ...fields,
});

export function Workstation({ plate, mode, onModeChange, onReset, victim, payloads, console: consoleNode }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <span className="font-mono text-[10.5px] tracking-[0.2em] text-white/45">SANDBOX · PLATE {plate}</span>
        <div className="flex items-center gap-2">
          <ModeSwitch mode={mode} onChange={onModeChange} />
          <button
            type="button"
            onClick={onReset}
            title="Reset simulation"
            aria-label="Reset simulation"
            className="rounded-md border border-white/15 p-2 text-white/50 transition-colors duration-300 hover:border-white/40 hover:text-white"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.2em] text-white/35">VICTIM APP</p>
          {victim}
        </div>
        <div className="flex min-w-0 flex-col gap-2.5">
          <p className="font-mono text-[10px] tracking-[0.2em] text-white/35">PAYLOADS</p>
          {payloads}
          <div className="mt-1.5">{consoleNode}</div>
        </div>
      </div>
    </div>
  );
}

function ModeSwitch({ mode, onChange }) {
  const option = (value, label) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={mode === value}
      className={`rounded-[5px] px-3 py-1.5 font-mono text-[10.5px] tracking-[0.16em] transition-colors duration-300 ${
        mode === value ? "bg-white text-[#050505]" : "text-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div role="group" aria-label="Code version" className="flex rounded-md border border-white/15 bg-black/40 p-0.5">
      {option("vulnerable", "VULNERABLE")}
      {option("fixed", "PATCHED")}
    </div>
  );
}

const STATUS = {
  live: { label: "LIVE", cls: "text-white/60", dot: true },
  running: { label: "RUNNING", cls: "text-white", dot: true, pulse: true },
  exploited: { label: "EXPLOITED", cls: "bg-white px-1.5 text-[#050505]" },
  blocked: { label: "BLOCKED", cls: "border border-white/60 px-1.5 text-white" },
};

// A mini browser window. `pulse` is a counter: bump it to replay the
// exploit sweep (status "exploited") or the deflect ring (status "blocked").
export function VictimWindow({ url, status = "live", pulse = 0, children }) {
  const s = STATUS[status];
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[#0D0D0F] transition-colors duration-300 ${
        status === "exploited" ? "border-white/60" : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-2">
        <span className="flex shrink-0 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-white/20" />
          ))}
        </span>
        <span className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10.5px] text-white/50">
          <Lock size={9} className="shrink-0" />
          <span className="truncate">{url}</span>
        </span>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-[3px] py-0.5 font-mono text-[9.5px] tracking-[0.14em] ${s.cls}`}>
          {s.dot && <span className={`h-1.5 w-1.5 rounded-full bg-current ${s.pulse ? "animate-pulse" : ""}`} />}
          {s.label}
        </span>
      </div>

      <div className="relative">
        {children}
        {pulse > 0 && status === "exploited" && <div key={`scan-${pulse}`} className="victim-scan" />}
      </div>

      {pulse > 0 && status === "exploited" && (
        <div key={`flash-${pulse}`} className="victim-flash pointer-events-none absolute inset-0 rounded-xl" />
      )}
      {pulse > 0 && status === "blocked" && (
        <div key={`deflect-${pulse}`} className="victim-deflect pointer-events-none absolute inset-0 rounded-xl" />
      )}
    </div>
  );
}

export function PayloadButton({ n, title, code, tag, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group w-full rounded-lg border border-white/10 bg-white/[0.02] text-left transition-all duration-300 hover:border-white/40 hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-50 disabled:hover:border-white/10"
    >
      <span className="flex items-center justify-between px-3.5 pt-3 font-mono text-[10px] tracking-[0.18em]">
        <span className="text-white/40">
          PAYLOAD {n}
          {tag ? ` · ${tag}` : ""}
        </span>
        <span className="text-white/30 transition-colors duration-300 group-hover:text-white">FIRE →</span>
      </span>
      <span className="block px-3.5 pt-1 text-sm font-medium text-white">{title}</span>
      <code className="mx-3.5 mb-3 mt-2 block truncate rounded border border-white/[0.07] bg-black/40 px-2 py-1 font-mono text-[11px] text-white/55">
        {code}
      </code>
    </button>
  );
}

const CHIP = {
  EXPLOITED: "border-white bg-white text-[#050505]",
  HUNG: "border-white bg-white text-[#050505]",
  BLOCKED: "border-white/60 text-white",
  OK: "border-white/25 text-white/75",
  SENT: "border-white/15 text-white/55",
  INFO: "border-white/10 text-white/40",
};

export function Console({ logs, onClear }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/50">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-3 py-2">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/60">
          X-RAY CONSOLE
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
        </span>
        <button
          type="button"
          onClick={onClear}
          title="Clear console"
          aria-label="Clear console"
          className="rounded p-1 text-white/35 transition-colors duration-300 hover:text-white"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div ref={scrollRef} role="log" aria-live="polite" className="console-scroll h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="px-3 py-3 font-mono text-[11px] text-white/30">› waiting for a payload…</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="animate-log-in border-b border-white/[0.06] px-3 py-2.5 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-white/25">{log.time}</span>
                <span className="truncate text-white/55">{log.origin}</span>
                <span className={`ml-auto shrink-0 rounded-[3px] border px-1.5 py-px text-[9.5px] tracking-[0.12em] ${CHIP[log.status] ?? CHIP.INFO}`}>
                  {log.status}
                </span>
              </div>
              {log.payload && <p className="mt-1 break-all text-white/80">› {log.payload}</p>}
              {log.detail && <p className="mt-1 font-sans text-[11.5px] leading-5 text-white/50">{log.detail}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
