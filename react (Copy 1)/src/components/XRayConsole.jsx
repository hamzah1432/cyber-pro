import { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";

// Factory for console entries so every lab logs the same shape.
export const logEntry = (fields) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  time: new Date().toLocaleTimeString("en-GB"),
  ...fields, // { origin, payload, status, detail? }
});

const STATUS_STYLES = {
  EXECUTED: "border-red-500/30 bg-red-500/10 text-red-400",
  BLOCKED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  SENT: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  INFO: "border-slate-700 bg-slate-800/60 text-slate-400",
};

export default function XRayConsole({ logs, onClear }) {
  const scrollRef = useRef(null);

  // Keep the newest entry in view without scrolling the whole page.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-black/50">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Terminal size={13} className="text-emerald-400" />
          X-Ray Console
          <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] text-slate-500">live</span>
        </div>
        <button
          onClick={onClear}
          title="Clear console"
          className="rounded p-1 text-slate-500 transition-all duration-300 ease-out hover:text-slate-300"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div ref={scrollRef} className="console-scroll h-56 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="px-3 py-3 font-mono text-xs text-slate-600">
            ▸ Awaiting events… fire a payload to trace it here.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="animate-log-in border-b border-slate-800/60 px-3 py-2 font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-600">{log.time}</span>
                <span className="text-slate-500">origin:</span>
                <span className="truncate text-slate-300">{log.origin}</span>
                <span
                  className={`ml-auto shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold ${
                    STATUS_STYLES[log.status] ?? STATUS_STYLES.INFO
                  }`}
                >
                  {log.status}
                </span>
              </div>
              {log.payload && (
                <div className="mt-1 truncate text-slate-400">
                  payload: <span className="text-amber-300/80">{log.payload}</span>
                </div>
              )}
              {log.detail && (
                <div className="mt-0.5 leading-5 text-slate-500">{log.detail}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
