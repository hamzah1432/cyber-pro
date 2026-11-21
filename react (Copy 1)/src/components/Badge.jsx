// Small pill badge used for OWASP / CWE categories and status labels.
const TONES = {
  slate: "border-slate-700 bg-slate-800/60 text-slate-300",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-400",
};

export default function Badge({ tone = "slate", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
