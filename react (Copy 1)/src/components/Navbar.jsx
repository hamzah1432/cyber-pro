import { ScanLine, ArrowDown } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#070b14]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <ScanLine size={17} className="text-emerald-400" />
          </span>
          <span className="text-[15px] font-bold tracking-tight">
            DOMino <span className="text-emerald-400">Security</span>
          </span>
        </a>

        <a
          href="#labs"
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3.5 py-1.5 text-[13px] font-medium text-slate-200 transition-all duration-300 hover:border-slate-500"
        >
          Labs
          <ArrowDown size={13} className="text-slate-400 transition-transform duration-300 group-hover:translate-y-0.5" />
        </a>
      </div>
    </nav>
  );
}
