import { FlaskConical, RotateCcw } from "lucide-react";
import ModeToggle from "./ModeToggle.jsx";

// Shared layout for every lab's "Try it" section: header bar with the
// Vulnerable/Fixed toggle, then a split-screen workspace — victim app on the
// left, attacker payloads + X-Ray Console on the right.
export default function SandboxShell({ mode, onModeChange, onReset, victim, attacker }) {
  const vulnerable = mode === "vulnerable";

  return (
    <div
      className={`rounded-2xl border bg-slate-900/60 backdrop-blur-md transition-all duration-300 ease-out ${
        vulnerable
          ? "border-red-500/25 shadow-lg shadow-red-500/10"
          : "border-emerald-500/25 shadow-lg shadow-emerald-500/10"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <FlaskConical size={15} className="text-slate-400" />
          <span className="font-medium">DOMino Interactive Sandbox</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle mode={mode} onChange={onModeChange} />
          <button
            onClick={onReset}
            title="Reset simulation"
            className="rounded-lg border border-slate-700 p-2 text-slate-400 transition-all duration-300 ease-out hover:border-slate-500 hover:text-slate-200"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium tracking-widest text-slate-500">
            VICTIM APP
          </p>
          {victim}
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium tracking-widest text-slate-500">
            ATTACKER PAYLOADS &amp; X-RAY CONSOLE
          </p>
          {attacker}
        </div>
      </div>
    </div>
  );
}
