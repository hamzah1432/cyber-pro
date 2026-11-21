import { Zap } from "lucide-react";

export default function PayloadButton({ index, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-left transition-all duration-300 ease-out hover:border-red-500/40 hover:bg-red-500/5"
    >
      <div className="flex items-center gap-2">
        <Zap
          size={13}
          className="text-slate-500 transition-colors duration-300 group-hover:text-red-400"
        />
        <span className="font-mono text-[11px] tracking-wide text-slate-500">
          PAYLOAD {index}
        </span>
      </div>
      <div className="mt-0.5 text-sm font-medium text-slate-200">{label}</div>
      {desc && <div className="mt-0.5 text-xs leading-5 text-slate-500">{desc}</div>}
    </button>
  );
}
