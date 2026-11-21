import { useCallback, useEffect, useRef, useState } from "react";
import { Info, Wallet } from "lucide-react";
import LabLayout from "../components/LabLayout.jsx";
import SandboxShell from "../components/SandboxShell.jsx";
import PayloadButton from "../components/PayloadButton.jsx";
import XRayConsole, { logEntry } from "../components/XRayConsole.jsx";
import { LABS } from "../lib/labsMeta.js";

const meta = LABS[1];

/* ─────────────────────────────────────────────────────────────────────────
   REAL SIMULATION — no fakery.

   The attacker lives in a sandboxed iframe (allow-scripts, WITHOUT
   allow-same-origin), so the browser gives it an opaque origin: messages it
   posts to this window arrive with event.origin === "null". That is a
   genuinely untrusted cross-origin sender, exactly like a hostile page
   embedding your widget.

   - Vulnerable mode: the window "message" handler executes event.data
     without ever reading event.origin → wallet state is hijacked.
   - Fixed mode: the handler drops any message whose event.origin doesn't
     match the trusted origin → identical payloads die before touching state.
   ───────────────────────────────────────────────────────────────────────── */

const ATTACKER_SRCDOC = `<script>
  // evil.example — attacker page loaded in a sandboxed (opaque-origin) frame.
  // It relays whatever payload the payload buttons hand it straight into the
  // victim window via window.parent.postMessage.
  window.addEventListener("message", (e) => {
    if (e.data && e.data.cmd === "fire") {
      window.parent.postMessage(e.data.payload, "*");
    }
  });
<\/script>`;

const KNOWN_TYPES = new Set(["SET_PAYOUT_ADDRESS", "TRANSFER"]);

const INITIAL_WALLET = {
  balance: 1000,
  address: "0x71C7...9A3F (you)",
  lastEvent: "No activity yet",
  exploited: false,
};

const PAYLOADS = [
  {
    index: 1,
    label: "Change Payout Address",
    desc: "Rebinds the wallet's payout address to an attacker wallet.",
    data: { type: "SET_PAYOUT_ADDRESS", address: "0xDEAD...BEEF (attacker)" },
  },
  {
    index: 2,
    label: "Trigger Silent Transfer",
    desc: "Orders the wallet to send its full balance — no user click involved.",
    data: { type: "TRANSFER", amount: 1000 },
  },
  {
    index: 3,
    label: "Spoof Trusted Origin",
    desc: "Writes a fake origin field INTO the data — only event.origin is authentic.",
    data: { type: "TRANSFER", amount: 1000, origin: "https://checkout.domino.app" },
  },
];

function WalletWidget({ wallet, mode, breachKey }) {
  const exploited = wallet.exploited;
  const protectedMode = mode === "fixed";

  return (
    <div
      key={breachKey}
      className={`rounded-xl border bg-slate-950/70 p-5 transition-all duration-300 ease-out ${
        exploited
          ? "animate-breach border-red-500/50"
          : protectedMode
            ? "border-emerald-500/30"
            : "border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10">
            <Wallet size={15} className="text-sky-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100">VaultPay Wallet</p>
            <p className="font-mono text-[10px] text-slate-500">mini crypto wallet · demo</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider transition-all duration-300 ${
            exploited
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : protectedMode
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
        >
          {exploited ? "EXPLOITED" : protectedMode ? "PROTECTED" : "LISTENING"}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs text-slate-500">Available balance</p>
        <p
          className={`mt-1 text-3xl font-bold tracking-tight transition-colors duration-300 ${
            wallet.balance <= 0 ? "text-red-400" : "text-slate-50"
          }`}
        >
          ${wallet.balance.toLocaleString()}{" "}
          <span className="text-sm font-medium text-slate-500">USD</span>
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5">
        <p className="text-[11px] text-slate-500">Payout address</p>
        <p
          className={`mt-0.5 font-mono text-xs transition-colors duration-300 ${
            wallet.address.includes("attacker") ? "text-red-400" : "text-slate-300"
          }`}
        >
          {wallet.address}
        </p>
      </div>

      <p className="mt-3 font-mono text-[11px] leading-5 text-slate-500">
        ▸ {wallet.lastEvent}
      </p>
    </div>
  );
}

function Lab02Sandbox() {
  const [mode, setMode] = useState("vulnerable");
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [logs, setLogs] = useState([]);
  const [breachKey, setBreachKey] = useState(0);
  const iframeRef = useRef(null);

  const addLog = useCallback((fields) => {
    setLogs((prev) => [...prev, logEntry(fields)]);
  }, []);

  // The victim's REAL message handler — re-registered whenever mode flips.
  useEffect(() => {
    const trustedOrigin = window.location.origin;

    const onMessage = (event) => {
      const data = event.data;
      // Ignore unrelated traffic (devtools, extensions), not a security check.
      if (!data || typeof data !== "object" || !KNOWN_TYPES.has(data.type)) return;

      const payloadStr = JSON.stringify(data);

      if (mode === "fixed" && event.origin !== trustedOrigin) {
        // THE FIX: event.origin is stamped by the browser and unforgeable.
        addLog({
          origin: `"${event.origin}" (sandboxed attacker frame)`,
          payload: payloadStr,
          status: "BLOCKED",
          detail: `event.origin "${event.origin}" ≠ trusted "${trustedOrigin}" — message dropped before touching wallet state.`,
        });
        return;
      }

      // VULNERABLE PATH: event.data is executed, event.origin never read.
      if (data.type === "SET_PAYOUT_ADDRESS") {
        setWallet((w) => ({
          ...w,
          address: data.address,
          lastEvent: "Payout address updated via postMessage",
          exploited: true,
        }));
      } else if (data.type === "TRANSFER") {
        setWallet((w) => ({
          ...w,
          balance: Math.max(0, w.balance - (data.amount ?? 0)),
          lastEvent: `Sent $${data.amount} to payout address via postMessage`,
          exploited: true,
        }));
      }
      setBreachKey((k) => k + 1);

      addLog({
        origin: `"${event.origin}" (sandboxed attacker frame)`,
        payload: payloadStr,
        status: "EXECUTED",
        detail: data.origin
          ? `data.origin claims "${data.origin}" — attacker-written field. Only event.origin ("${event.origin}") is authentic, and the handler never checked it.`
          : "Handler consumed event.data without reading event.origin.",
      });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode, addLog]);

  const reset = useCallback((nextMode) => {
    setWallet(INITIAL_WALLET);
    setLogs([
      logEntry({
        origin: "domino://sandbox",
        status: "INFO",
        detail:
          nextMode === "fixed"
            ? "Fixed mode armed — handler now enforces strict event.origin validation."
            : "Vulnerable mode armed — handler trusts every message sender.",
      }),
    ]);
  }, []);

  const changeMode = (next) => {
    setMode(next);
    reset(next);
  };

  const firePayload = (payload) => {
    addLog({
      origin: "attacker frame → victim window",
      payload: JSON.stringify(payload.data),
      status: "SENT",
      detail: `Dispatching via window.parent.postMessage(payload, "*") from the sandboxed frame…`,
    });
    // Hand the payload to the attacker iframe; IT posts to the victim window,
    // so the message truly arrives cross-origin (event.origin === "null").
    iframeRef.current?.contentWindow?.postMessage({ cmd: "fire", payload: payload.data }, "*");
  };

  return (
    <SandboxShell
      mode={mode}
      onModeChange={changeMode}
      onReset={() => reset(mode)}
      victim={<WalletWidget wallet={wallet} mode={mode} breachKey={breachKey} />}
      attacker={
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-[11px] leading-5 text-slate-500">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>
              Payloads are posted by a real sandboxed &lt;iframe&gt; with an opaque
              origin — the browser stamps its messages{" "}
              <span className="font-mono text-slate-400">event.origin: "null"</span>.
            </span>
          </div>

          {PAYLOADS.map((p) => (
            <PayloadButton
              key={p.index}
              index={p.index}
              label={p.label}
              desc={p.desc}
              onClick={() => firePayload(p)}
            />
          ))}

          <XRayConsole logs={logs} onClear={() => setLogs([])} />

          {/* The real attacker: sandboxed, scripts only, opaque origin. */}
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            srcDoc={ATTACKER_SRCDOC}
            title="attacker-frame"
            className="hidden"
          />
        </div>
      }
    />
  );
}

/* ── Static lab content ─────────────────────────────────────────────────── */

const VULN_CODE = {
  title: "wallet-widget.js — vulnerable",
  lines: [
    { code: "// Receives commands from the embedded checkout iframe" },
    { code: 'window.addEventListener("message", (event) => {' },
    {
      code: "  const { type, address, amount } = event.data;",
      hl: "red",
      note: "event.origin is never checked — ANY window or iframe that can reach this page can drive the handler.",
    },
    { code: "" },
    { code: '  if (type === "SET_PAYOUT_ADDRESS") {' },
    { code: "    wallet.payoutAddress = address; // attacker-controlled" },
    { code: "  }" },
    { code: "" },
    { code: '  if (type === "TRANSFER") {' },
    { code: "    wallet.send(amount, wallet.payoutAddress);" },
    { code: "  }" },
    { code: "});" },
  ],
};

const FIX_CODE = {
  title: "wallet-widget.js — patched",
  lines: [
    { code: 'const TRUSTED_ORIGIN = "https://checkout.domino.app";' },
    { code: "" },
    { code: 'window.addEventListener("message", (event) => {' },
    {
      code: "  if (event.origin !== TRUSTED_ORIGIN) return;",
      hl: "green",
      note: "event.origin is stamped by the browser and cannot be forged — reject everything that is not the exact trusted origin.",
    },
    { code: "" },
    { code: "  const { type, address, amount } = event.data;" },
    { code: '  if (type === "SET_PAYOUT_ADDRESS") wallet.payoutAddress = address;' },
    { code: '  if (type === "TRANSFER") wallet.send(amount, wallet.payoutAddress);' },
    { code: "});" },
  ],
};

export default function Lab02PostMessage() {
  return (
    <LabLayout
      meta={meta}
      what={
        <>
          <code className="text-emerald-400">window.postMessage()</code> lets two
          browsing contexts — tabs, popups, iframes — exchange data across
          origins. The browser stamps every delivered message with an authentic,
          unforgeable <code className="text-emerald-400">event.origin</code>, but
          verifying it is entirely the receiver's job. A handler that skips the
          check becomes an open command API for any page that can obtain a
          reference to your window.
        </>
      }
      vulnCode={VULN_CODE}
      sandbox={<Lab02Sandbox />}
      why={
        <>
          A missing origin check turns every message handler into a public,
          unauthenticated endpoint: token theft, forced actions and full account
          takeover become a single postMessage call from any embedding or opened
          page. The pattern is endemic because handlers are usually written
          assuming only "our" iframe will ever talk to them.
        </>
      }
      incident={{
        title: "Slack postMessage account takeover (2017)",
        text: "Security researcher Frans Rosén reported a Slack bug (HackerOne) in which a postMessage handler with weak origin validation could be abused from a malicious page to steal session data — one of many documented postMessage takeovers his \"postMessage() for good and evil\" research catalogued.",
      }}
      fixCode={FIX_CODE}
      sources={[
        {
          label: "MDN — Window.postMessage()",
          href: "https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage",
        },
        {
          label: "OWASP — HTML5 Security Cheat Sheet (Web Messaging)",
          href: "https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html",
        },
        {
          label: "PortSwigger Academy — Controlling the web message source",
          href: "https://portswigger.net/web-security/dom-based/controlling-the-web-message-source",
        },
        {
          label: "CWE-346 — Origin Validation Error",
          href: "https://cwe.mitre.org/data/definitions/346.html",
        },
      ]}
    />
  );
}
