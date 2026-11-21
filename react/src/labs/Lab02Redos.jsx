import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import LabPage from "../components/lab/LabPage.jsx";
import { Workstation, VictimWindow, PayloadButton, Console, logEntry } from "../components/lab/Workstation.jsx";
import { LABS } from "../lib/labsMeta.js";

const lab = LABS[1];

/* ─────────────────────────────────────────────────────────────────────────
   REAL catastrophic backtracking.

   Every payload runs the actual pattern with RegExp.test — but inside a
   throwaway Web Worker, so a run that would hang for minutes can be killed
   after BUDGET_MS instead of freezing this page. Times shown are measured on
   the visitor's own device; the "full runtime" figure is extrapolated from
   the growth measured between n=22 and n=24.
   ───────────────────────────────────────────────────────────────────────── */

const PATTERNS = {
  vulnerable: "^([a-zA-Z0-9]+)*$",
  fixed: "^[a-zA-Z0-9]{3,20}$",
};
const BUDGET_MS = 1500;
const NEAR_MISS = "a".repeat(40) + "!";
const CONTROL = "adalovelace";
const SWEEP = [16, 18, 20, 22, 24, 26, 28];

const WORKER_SRC =
  "self.onmessage=(e)=>{const{source,input}=e.data;const re=new RegExp(source);" +
  "const t=performance.now();const ok=re.test(input);self.postMessage({ok,ms:performance.now()-t});};";

function runRegex(source, input) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
    const worker = new Worker(url);
    const start = performance.now();
    const done = (r) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(() => done({ timedOut: true, ms: performance.now() - start }), BUDGET_MS);
    worker.onmessage = (e) => done({ ...e.data, timedOut: false });
    worker.onerror = () => done({ error: true, ms: 0 });
    worker.postMessage({ source, input });
  });
}

// ms for the vulnerable pattern at length n, from the growth between 22→24.
async function estimateMs(n) {
  const a = await runRegex(PATTERNS.vulnerable, "a".repeat(22) + "!");
  const b = await runRegex(PATTERNS.vulnerable, "a".repeat(24) + "!");
  if (a.timedOut || b.timedOut || !(a.ms > 0.5)) return null;
  const perChar = Math.min(Math.max(Math.sqrt(b.ms / a.ms), 1.5), 2.5);
  return b.ms * perChar ** (n - 24);
}

function fmt(ms) {
  if (ms == null) return "—";
  if (ms < 0.1) return "<0.1 ms";
  if (ms < 10) return `${ms.toFixed(2)} ms`;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`;
  if (ms < 86_400_000) return `${(ms / 3_600_000).toFixed(1)} h`;
  return `${(ms / 86_400_000).toFixed(1)} days`;
}
const shortMs = (b) => (b.timedOut ? "≥1.5s" : b.ms < 0.1 ? "<0.1" : b.ms < 10 ? b.ms.toFixed(1) : Math.round(b.ms));

function RedosSandbox({ mode, onModeChange }) {
  const [username, setUsername] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [bars, setBars] = useState([]);
  const [status, setStatus] = useState("live");
  const [pulse, setPulse] = useState(0);
  const [logs, setLogs] = useState([]);
  const epoch = useRef(0);
  const runStart = useRef(0);

  const addLog = useCallback((f) => setLogs((l) => [...l, logEntry(f)]), []);
  const hit = (s) => {
    setStatus(s);
    setPulse((p) => p + 1);
  };

  // Live timer while a run is in flight (this page's main thread stays free).
  useEffect(() => {
    if (!running) return;
    let raf;
    const tick = () => {
      setElapsed(performance.now() - runStart.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const reset = useCallback(() => {
    epoch.current += 1; // results from in-flight runs are dropped
    setUsername("");
    setRunning(false);
    setVerdict(null);
    setBars([]);
    setStatus("live");
    setLogs([
      logEntry({
        origin: "sandbox",
        status: "INFO",
        detail:
          mode === "fixed"
            ? `PATCHED build — USERNAME = /${PATTERNS.fixed}/`
            : `VULNERABLE build — USERNAME = /${PATTERNS.vulnerable}/`,
      }),
    ]);
  }, [mode]);

  useEffect(() => {
    reset();
  }, [reset]);

  const timed = async (input) => {
    setUsername(input);
    runStart.current = performance.now();
    return runRegex(PATTERNS[mode], input);
  };

  const fireNearMiss = async () => {
    const e = epoch.current;
    setRunning(true);
    setStatus("running");
    setVerdict(null);
    addLog({
      origin: "signup form → username",
      payload: '"a" × 40 + "!"',
      status: "SENT",
      detail: "A near miss: forty valid characters, then one that can never match.",
    });
    const r = await timed(NEAR_MISS);
    if (e !== epoch.current) return;

    if (r.timedOut) {
      setRunning(false);
      setVerdict({ kind: "hung", ms: r.ms });
      hit("exploited");
      const est = await estimateMs(NEAR_MISS.length - 1);
      if (e !== epoch.current) return;
      addLog({
        origin: "USERNAME.test()",
        payload: `/${PATTERNS.vulnerable}/.test(input)`,
        status: "HUNG",
        detail: `Still backtracking after ${fmt(r.ms)}, so the sandbox killed it.${
          est ? ` Growth measured on this device puts the full check at ≈ ${fmt(est)} of frozen tab.` : ""
        }`,
      });
    } else {
      setRunning(false);
      setVerdict({ kind: r.ok ? "ok" : "rejected", ms: r.ms });
      hit("blocked");
      addLog({
        origin: "USERNAME.test()",
        payload: `/${PATTERNS[mode]}/.test(input)`,
        status: "BLOCKED",
        detail: `Rejected in ${fmt(r.ms)}. No nested quantifier, and the 20-character cap rules the input out at once.`,
      });
    }
  };

  const fireSweep = async () => {
    const e = epoch.current;
    setRunning(true);
    setStatus("running");
    setVerdict(null);
    setBars(SWEEP.map((n) => ({ n, ms: null })));
    addLog({
      origin: "signup form → username",
      payload: `"a" × n + "!"  for n = ${SWEEP[0]}…${SWEEP[SWEEP.length - 1]}`,
      status: "SENT",
      detail: "Same near miss, growing two characters at a time. Each length runs for real.",
    });

    const results = [];
    let hung = false;
    for (const n of SWEEP) {
      // Once one length hits the budget, every longer one would too.
      const r = hung ? { timedOut: true, ms: BUDGET_MS } : await timed("a".repeat(n) + "!");
      if (e !== epoch.current) return;
      hung = hung || r.timedOut;
      results.push({ n, ms: r.timedOut ? BUDGET_MS : r.ms, timedOut: r.timedOut });
      setBars(SWEEP.map((m, i) => results[i] ?? { n: m, ms: null }));
    }
    setRunning(false);

    const first = results[0];
    const last = results.filter((r) => !r.timedOut).at(-1) ?? first;
    if (mode === "vulnerable") {
      hit("exploited");
      addLog({
        origin: "USERNAME.test() × 7",
        status: "EXPLOITED",
        detail: `${fmt(first.ms)} at ${first.n} characters → ${fmt(last.ms)} at ${last.n}${
          hung ? `, then past the ${fmt(BUDGET_MS)} budget` : ""
        }. Every two extra characters roughly quadruple the work.`,
      });
    } else {
      hit("blocked");
      addLog({
        origin: "USERNAME.test() × 7",
        status: "BLOCKED",
        detail: `Flat: ${fmt(Math.max(...results.map((r) => r.ms)))} or less at every length. A flat character class is checked once per character.`,
      });
    }
  };

  const fireControl = async () => {
    const e = epoch.current;
    setRunning(true);
    setVerdict(null);
    const r = await timed(CONTROL);
    if (e !== epoch.current) return;
    setRunning(false);
    setStatus("live");
    setVerdict({ kind: r.ok ? "ok" : "rejected", ms: r.ms });
    addLog({
      origin: "signup form → username",
      payload: `"${CONTROL}"`,
      status: "OK",
      detail: `Matched in ${fmt(r.ms)}. Ordinary input is fast in both builds — only crafted near misses explode.`,
    });
  };

  const maxBar = Math.max(...bars.map((b) => b.ms ?? 0), mode === "fixed" ? 1 : BUDGET_MS);
  const statusLine = running
    ? `checking… ${fmt(elapsed)}`
    : verdict?.kind === "hung"
      ? `no answer after ${fmt(verdict.ms)} — killed`
      : verdict?.kind === "ok"
        ? `✓ available · ${fmt(verdict.ms)}`
        : verdict?.kind === "rejected"
          ? `✕ letters and numbers only · ${fmt(verdict.ms)}`
          : "";

  return (
    <Workstation
      plate={lab.num}
      mode={mode}
      onModeChange={onModeChange}
      onReset={reset}
      victim={
        <VictimWindow url="vaultpay.app/signup" status={status} pulse={pulse}>
          <div className="relative p-5">
            <p className="text-sm font-semibold text-white/90">Create account</p>
            <p className="mt-4 text-[11px] text-white/40">Username</p>
            <div className="mt-1.5 flex items-center rounded-md border border-white/15 bg-black/40 px-3 py-2 font-mono text-[12px] text-white/85">
              <span className="truncate">{username || <span className="text-white/25">choose a username</span>}</span>
              <span className="ml-px h-3.5 w-px shrink-0 animate-pulse bg-white/70" />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md bg-white px-3 py-2 text-[12px] font-semibold text-[#050505]">
              Check availability
              {running && <LoaderCircle size={13} className="animate-spin" />}
            </div>
            <p className="mt-3 h-4 font-mono text-[11px] text-white/55">{statusLine}</p>

            {running && elapsed > 250 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#0D0D0F]/85 text-center backdrop-blur-[2px]">
                <p className="font-mono text-[10px] tracking-[0.2em] text-white/50">REGEX STILL RUNNING</p>
                <p className="font-display text-3xl font-bold tabular-nums text-white">{fmt(elapsed)}</p>
                <p className="max-w-[16rem] text-[11px] leading-4 text-white/45">
                  On a real page the tab is frozen this whole time.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-white/15 px-5 py-4">
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.16em] text-white/40">
              <span>X-RAY · BACKTRACKING COST</span>
              <span className="truncate normal-case tracking-normal text-white/55">/{PATTERNS[mode]}/</span>
            </div>
            {bars.length === 0 ? (
              <p className="mt-3 h-28 text-[11.5px] leading-5 text-white/35">
                Fire payload 02 to measure how the cost grows with input length.
              </p>
            ) : (
              <>
                <div className="mt-3 flex h-28 items-end gap-2 border-b border-l border-white/20 pl-2">
                  {bars.map((b) => (
                    <div key={b.n} className="flex h-full flex-1 flex-col items-center justify-end">
                      {b.ms != null && <span className="mb-1 font-mono text-[9px] text-white/55">{shortMs(b)}</span>}
                      <span
                        className={`w-full rounded-t-[1px] transition-[height] duration-500 ease-out ${b.timedOut ? "bg-white" : "bg-white/55"}`}
                        style={{ height: b.ms == null ? 0 : `${Math.max((b.ms / maxBar) * 100, 1.5)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex gap-2 pl-2 font-mono text-[9px] text-white/35">
                  {bars.map((b) => (
                    <span key={b.n} className="flex-1 text-center">
                      {b.n}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-center font-mono text-[9px] text-white/30">input length (ms above each bar)</p>
              </>
            )}
          </div>
        </VictimWindow>
      }
      payloads={
        <>
          <PayloadButton n="01" title="Paste a near-miss username" code={'"a".repeat(40) + "!"'} onClick={fireNearMiss} disabled={running} />
          <PayloadButton n="02" title="Sweep the input length" code={'"a".repeat(n) + "!"  // n = 16…28'} onClick={fireSweep} disabled={running} />
          <PayloadButton n="03" tag="CONTROL" title="A normal username" code={`"${CONTROL}"`} onClick={fireControl} disabled={running} />
        </>
      }
      console={<Console logs={logs} onClear={() => setLogs([])} />}
    />
  );
}

const LINE = {
  file: "signup.js — vulnerable",
  lines: [
    { code: "// signup.js — live username check as the user types" },
    {
      code: "const USERNAME = /^([a-zA-Z0-9]+)*$/;",
      mark: "fracture",
      note: "The group ([a-zA-Z0-9]+) sits inside another quantifier, *. When the input almost matches, the engine tries every way to split the letters between the two — about 2ⁿ attempts for n characters.",
    },
    { code: "" },
    { code: 'input.addEventListener("input", () => {' },
    { code: "  const ok = USERNAME.test(input.value);" },
    { code: "  hint.textContent = ok" },
    { code: '    ? "Looks good"' },
    { code: '    : "Letters and numbers only";' },
    { code: "  submit.disabled = !ok;" },
    { code: "});" },
  ],
};

const FIX = {
  file: "signup.js — patched",
  lines: [
    { code: "// signup.js — one flat character class, hard length cap" },
    {
      code: "const USERNAME = /^[a-zA-Z0-9]{3,20}$/;",
      mark: "patch",
      note: "No nested quantifier, so each character is checked once, and the {3,20} cap means the pattern never sees more than 20.",
    },
    { code: "" },
    { code: 'input.addEventListener("input", () => {' },
    { code: "  const ok = USERNAME.test(input.value);" },
    { code: '  hint.textContent = ok ? "Looks good" : "3–20 letters or numbers";' },
    { code: "  submit.disabled = !ok;" },
    { code: "});" },
  ],
};

export default function Lab02Redos() {
  const [mode, setMode] = useState("vulnerable");
  return (
    <LabPage
      lab={lab}
      what={
        <>
          ReDoS is a denial-of-service attack on regular expressions. A pattern with nested quantifiers, like{" "}
          <code className="font-mono text-[0.9em] text-white">([a-zA-Z0-9]+)*</code>, can try exponentially many ways
          to match a near-miss string, so one crafted input pins the CPU. In a browser that freezes the whole tab,
          because the regex runs on the same thread that draws the page.
        </>
      }
      line={LINE}
      sandbox={<RedosSandbox mode={mode} onModeChange={setMode} />}
      why={
        <>
          A single pasted string can lock up a sign-up form, a search box or a markdown preview for minutes, and the
          user can't even close the dialog. On a server, the same pattern stalls every request it touches.
        </>
      }
      incident={{
        label: "2019",
        title: "Cloudflare global outage",
        text: "A new WAF rule contained a regular expression that backtracked enormously. It exhausted CPU across Cloudflare's network and took sites behind it down for 27 minutes.",
        href: "https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/",
        linkLabel: "Cloudflare post-mortem",
      }}
      fix={FIX}
      sources={[
        { label: "OWASP — Regular expression Denial of Service (ReDoS)", href: "https://community.owasp.org/attacks/Regular_expression_Denial_of_Service_-_ReDoS" },
        { label: "MITRE — CWE-1333: Inefficient Regular Expression Complexity", href: "https://cwe.mitre.org/data/definitions/1333.html" },
        { label: "Cloudflare — Details of the outage on July 2, 2019", href: "https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/" },
      ]}
      onVerifyFix={() => setMode("fixed")}
    />
  );
}
