import { ArrowDown } from "lucide-react";
import BrandMark from "./BrandMark.jsx";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#/" aria-label="DOMino Security — home" className="flex items-center gap-1.5">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            DOMino <span className="text-white/50">Security</span>
          </span>
        </a>

        <a
          href="#labs"
          className="group inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[12px] font-medium tracking-wide text-white/80 transition-all duration-300 hover:border-white/35 hover:text-white"
        >
          LABS
          <ArrowDown size={13} className="text-white/50 transition-transform duration-300 group-hover:translate-y-0.5" />
        </a>
      </div>
    </nav>
  );
}
