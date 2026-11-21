import { useCallback, useState } from "react";
import { ExternalLink, Globe, Info, Lock } from "lucide-react";
import LabLayout from "../components/LabLayout.jsx";
import SandboxShell from "../components/SandboxShell.jsx";
import PayloadButton from "../components/PayloadButton.jsx";
import XRayConsole, { logEntry } from "../components/XRayConsole.jsx";
import { LABS } from "../lib/labsMeta.js";

const meta = LABS[2];

/* ─────────────────────────────────────────────────────────────────────────
   SIMULATION — Reverse Tabnabbing.

   A victim page lists user-submitted links opened with target="_blank". When
   the opener grants the new tab a window.opener reference (no rel=noopener),
   the opened page can run `window.opener.location = phishingUrl` and silently
   navigate the ORIGINAL tab to a credential-phishing clone.

   We can't (and shouldn't) actually navigate the real DOMino tab, so the
   victim tab is modelled as a framed mini-browser whose address bar + body we
   control. The link-opening logic is real: in vulnerable mode we hand the
   popup an opener capability flag; the attacker payload then uses it to rewrite
   the victim frame. In fixed mode rel="noopener" means window.opener is null,
   so the same payload no-ops.
   ───────────────────────────────────────────────────────────────────────── */

const LEGIT_URL = "domino-forum.app/thread/8821";
const PHISH_URL = "glassb0x-login.app/verify-session";

const INITIAL = {
  openerGranted: false, // did the victim hand out a window.opener capability?
  popupOpen: false,
  victimUrl: LEGIT_URL,
  phished: false,
};

const PAYLOADS = [
  {
    index: 1,
    label: "Open Attacker Link",
    desc: 'User clicks a target="_blank" link to the attacker page in a new tab.',
    kind: "open",
  },
  {
    index: 2,
    label: "Hijack The Opener Tab",
    desc: "Opened page runs window.opener.location = phishing clone.",
    kind: "hijack",
  },
];

function MiniBrowser({ state, mode }) {
  const phished = state.phished;
  const protectedMode = mode === "fixed";
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-slate-950/70 transition-all duration-300 ease-out ${
        phished
          ? "animate-breach border-red-500/50"
          : protectedMode
            ? "border-emerald-500/30"
            : "border-slate-700"
      }`}
    >
      {/* fake browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/70 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        </div>
        <div
          className={`ml-2 flex flex-1 items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors duration-300 ${
            phished
              ? "border-red-500/40 bg-red-500/5 text-red-400"
              : "border-slate-700 bg-slate-950/60 text-slate-400"
          }`}
        >
          <Lock size={10} className={phished ? "text-red-400" : "text-emerald-500"} />
          {phished ? PHISH_URL : state.victimUrl}
        </div>
      </div>

      {/* page body */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Globe size={14} className="text-amber-400" />
            Your original tab
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider transition-all duration-300 ${
              phished
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : protectedMode
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-400"
            }`}
          >
            {phished ? "EXPLOITED" : protectedMode ? "PROTECTED" : "ACTIVE"}
          </span>
        </div>

        {phished ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-sm font-semibold text-slate-100">
              Session expired — please sign in again
            </p>
            <p className="mt-1 text-xs text-slate-400">
              The original tab was silently replaced with a phishing clone while
              you read the other tab.
            </p>
            <div className="mt-3 space-y-2">
              <div className="h-8 rounded border border-slate-700 bg-slate-950/60" />
              <div className="h-8 rounded border border-slate-700 bg-slate-950/60" />
              <div className="h-8 rounded bg-red-500/80" />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-sm font-medium text-slate-200">DOMino Forum · Thread #8821</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              "Check out this tool I built →"{" "}
              <span className="text-amber-400 underline">attacker-blog.example</span>
            </p>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 w-4/5 rounded bg-slate-800" />
              <div className="h-2.5 w-3/5 rounded bg-slate-800" />
            </div>
          </div>
        )}

        <p className="mt-3 font-mono text-[11px] leading-5 text-slate-500">
          ▸{" "}
          {state.popupOpen
            ? state.openerGranted
              ? "New tab opened WITH a window.opener reference."
              : "New tab opened with window.opener = null (noopener)."
            : "No external tab open."}
        </p>
      </div>
    </div>
  );
}

function Lab03Sandbox() {
  const [mode, setMode] = useState("vulnerable");
  const [state, setState] = useState(INITIAL);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((fields) => {
    setLogs((prev) => [...prev, logEntry(fields)]);
  }, []);

  const reset = useCallback((nextMode) => {
    setState(INITIAL);
    setLogs([
      logEntry({
        origin: "domino://sandbox",
        status: "INFO",
        detail:
          nextMode === "fixed"
            ? 'Fixed mode armed — links carry rel="noopener"; new tabs get window.opener = null.'
            : "Vulnerable mode armed — links open with a live window.opener back-reference.",
      }),
    ]);
  }, []);

  const changeMode = (next) => {
    setMode(next);
    reset(next);
  };

  const fire = (payload) => {
    if (payload.kind === "open") {
      const granted = mode === "vulnerable";
      setState((s) => ({ ...s, popupOpen: true, openerGranted: granted }));
      addLog({
        origin: "attacker-blog.example (new tab)",
        payload: mode === "vulnerable" ? 'target="_blank"' : 'target="_blank" rel="noopener"',
        status: "SENT",
        detail: granted
          ? "Victim handed the new tab a window.opener reference to the original page."
          : 'rel="noopener" set — the new tab receives window.opener = null.',
      });
      return;
    }

    // "hijack" — the opened page tries window.opener.location = phishing.
    if (!state.popupOpen) {
      addLog({
        origin: "attacker-blog.example",
        status: "INFO",
        detail: "Open the attacker link first (Payload 1).",
      });
      return;
    }

    if (state.openerGranted) {
      setState((s) => ({ ...s, phished: true, victimUrl: PHISH_URL }));
      addLog({
        origin: "attacker-blog.example",
        payload: `window.opener.location = "https://${PHISH_URL}"`,
        status: "EXECUTED",
        detail: "window.opener was live — original tab silently redirected to the phishing clone.",
      });
    } else {
      addLog({
        origin: "attacker-blog.example",
        payload: "window.opener.location = ...",
        status: "BLOCKED",
        detail: "window.opener is null — TypeError on access; original tab untouched.",
      });
    }
  };

  return (
    <SandboxShell
      mode={mode}
      onModeChange={changeMode}
      onReset={() => reset(mode)}
      victim={<MiniBrowser state={state} mode={mode} />}
      attacker={
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-[11px] leading-5 text-slate-500">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>
              Run Payload 1 to open the attacker tab, then Payload 2. Only the
              vulnerable link leaks a{" "}
              <span className="font-mono text-slate-400">window.opener</span>{" "}
              handle to the attacker.
            </span>
          </div>

          {PAYLOADS.map((p) => (
            <PayloadButton
              key={p.index}
              index={p.index}
              label={p.label}
              desc={p.desc}
              onClick={() => fire(p)}
            />
          ))}

          <XRayConsole logs={logs} onClear={() => setLogs([])} />
        </div>
      }
    />
  );
}

/* ── Static lab content ─────────────────────────────────────────────────── */

const VULN_CODE = {
  title: "forum-links.js — vulnerable",
  lines: [
    { code: "// Render a user-submitted link in the thread" },
    { code: "function renderLink(url, text) {" },
    { code: "  const a = document.createElement('a');" },
    { code: "  a.href = url;" },
    { code: "  a.textContent = text;" },
    {
      code: "  a.target = '_blank';",
      hl: "red",
      note: "_blank with no rel=noopener hands the opened page a live window.opener — it can navigate THIS tab.",
    },
    { code: "  thread.appendChild(a);" },
    { code: "}" },
    { code: "" },
    { code: "// Opened attacker page simply runs:" },
    { code: "//   window.opener.location = 'https://phish.example';" },
  ],
};

const FIX_CODE = {
  title: "forum-links.js — patched",
  lines: [
    { code: "function renderLink(url, text) {" },
    { code: "  const a = document.createElement('a');" },
    { code: "  a.href = url;" },
    { code: "  a.textContent = text;" },
    { code: "  a.target = '_blank';" },
    {
      code: "  a.rel = 'noopener noreferrer';",
      hl: "green",
      note: "noopener forces window.opener = null in the new tab; noreferrer also strips the Referer header.",
    },
    { code: "  thread.appendChild(a);" },
    { code: "}" },
  ],
};

export default function Lab03Tabnabbing() {
  return (
    <LabLayout
      meta={meta}
      what={
        <>
          Reverse tabnabbing is an attack where a page you open in a new tab
          abuses its{" "}
          <code className="text-emerald-400">window.opener</code> reference to
          navigate the <em>original</em> tab somewhere malicious. Because the
          original tab is now in the background, users don't notice it being
          swapped for a pixel-perfect phishing login. Any{" "}
          <code className="text-emerald-400">target="_blank"</code> link without{" "}
          <code className="text-emerald-400">rel="noopener"</code> is vulnerable.
        </>
      }
      vulnCode={VULN_CODE}
      sandbox={<Lab03Sandbox />}
      why={
        <>
          The attack is effective because it exploits trust: the victim opened
          the link themselves and left the original tab untouched, so they never
          suspect it has been replaced by a credential-harvesting clone. It
          requires no XSS and no interaction beyond a single outbound click,
          making user-generated links, ads and "share" buttons prime vectors.
        </>
      }
      incident={{
        title: "OWASP / browser-wide noopener adoption (2016–2021)",
        text: 'The risk was common enough that browsers changed the default: Chrome, Firefox and Safari now imply rel="noopener" for target="_blank". OWASP\'s Reverse Tabnabbing page documents the original widespread exposure across sites that rendered user links without it.',
      }}
      fixCode={FIX_CODE}
      sources={[
        {
          label: "OWASP — Reverse Tabnabbing",
          href: "https://owasp.org/www-community/attacks/Reverse_Tabnabbing",
        },
        {
          label: "MDN — rel=noopener",
          href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener",
        },
        {
          label: "web.dev — Links to cross-origin destinations are unsafe",
          href: "https://web.dev/articles/external-anchors-use-rel-noopener",
        },
        {
          label: "CWE-1022 — Use of Web Link to Untrusted Target with window.opener",
          href: "https://cwe.mitre.org/data/definitions/1022.html",
        },
      ]}
    />
  );
}
