import { ShieldOff, ShieldCheck } from "lucide-react";

// Prominent segmented toggle: Vulnerable Mode vs Fixed Mode.
export default function ModeToggle({ mode, onChange }) {
  const base =
    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-300 ease-out";
  return (
    <div className="inline-flex gap-1 rounded-lg border border-slate-700 bg-slate-950/70 p-1">
      <button
        onClick={() => onChange("vulnerable")}
        aria-pressed={mode === "vulnerable"}
        className={`${base} ${
          mode === "vulnerable"
            ? "bg-red-500/15 text-red-400 shadow-sm shadow-red-500/10 ring-1 ring-red-500/30"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <ShieldOff size={14} />
        Vulnerable Mode
      </button>
      <button
        onClick={() => onChange("fixed")}
        aria-pressed={mode === "fixed"}
        className={`${base} ${
          mode === "fixed"
            ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/30"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <ShieldCheck size={14} />
        Fixed Mode
      </button>
    </div>
  );
}
