import { useCallback, useEffect, useRef, useState } from "react";
import LabPage from "../components/lab/LabPage.jsx";
import { Workstation, VictimWindow, PayloadButton, Console, logEntry } from "../components/lab/Workstation.jsx";
import { LABS } from "../lib/labsMeta.js";

const lab = LABS[2];

/* ─────────────────────────────────────────────────────────────────────────
   REAL client-side paywall, attacked the way a reader would.

   The article is rendered by plain JavaScript into a DOM node React doesn't
   manage, exactly like a news site's own script. Payloads then do what a
   reader can do in DevTools: delete nodes, edit classes, write localStorage,
   read the API response.

   The "server" is a function on the far side of a boundary the reader can't
   touch: in the vulnerable build it sends every paragraph to everyone; in the
   patched build it checks the session's subscription and sends the teaser.
   ───────────────────────────────────────────────────────────────────────── */

const ARTICLE = {
  title: "How the merger really happened",
  byline: "By M. Okafor · Business · 6 min read",
  teaser: [
    "When Halden Freight announced its takeover of Corvo Logistics in March, both boards called it a merger of equals.",
    "Internal emails tell a different story — one that starts eight months earlier, in a hotel lobby in Rotterdam.",
  ],
  premium: [
    "Halden's chief executive had secured financing for the deal before Corvo's board knew talks existed.",
    "Three Corvo directors were offered advisory roles worth more than their annual pay, contingent on a yes vote.",
    "The deal closed on the last day of the quarter, two weeks before regulators could formally object.",
  ],
};
const VISITOR = { userId: "u_2041" };
const SUBSCRIBERS = new Set(["u_8812"]); // lives on the server; the visitor isn't in it

function api(build) {
  const { title, byline, teaser, premium } = ARTICLE;
  if (build === "vulnerable") return { title, byline, html: [...teaser, ...premium], premiumFrom: teaser.length };
  const paid = SUBSCRIBERS.has(VISITOR.userId);
  return { title, byline, html: paid ? [...teaser, ...premium] : teaser, locked: !paid };
}

let memoFlag = null; // fallback when localStorage is unavailable
const storage = {
  get: () => {
    try {
      return localStorage.getItem("isPremium");
    } catch {
      return memoFlag;
    }
  },
  set: (v) => {
    memoFlag = v;
    try {
      localStorage.setItem("isPremium", v);
    } catch {
      /* private mode etc. — memoFlag carries it */
    }
  },
  clear: () => {
    memoFlag = null;
    try {
      localStorage.removeItem("isPremium");
    } catch {
      /* nothing stored */
    }
  },
};

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const PAYWALL = `
  <div class="paywall absolute inset-x-0 bottom-0 flex h-[62%] items-end justify-center bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F]/95 to-transparent pb-5">
    <div class="flex items-center gap-3 rounded-md border border-white/15 bg-[#111114] px-4 py-2.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <span class="text-[12px] text-white/75">Subscribers only</span>
      <span class="rounded bg-white px-2 py-1 text-[11px] font-semibold text-[#050505]">Unlock · $4.99</span>
    </div>
  </div>`;

// The site's own render step. `view.lock` blurs premium paragraphs (CSS
// .locked); `view.paywall` draws the overlay.
function renderArticle(el, res, view) {
  const paras = res.html
    .map((text, i) => {
      const premium = res.premiumFrom != null && i >= res.premiumFrom;
      const cls = ["para text-[13px] leading-6 text-white/75", premium && "premium", premium && view.lock && "locked"]
        .filter(Boolean)
        .join(" ");
      return `<p class="${cls}">${esc(text)}</p>`;
    })
    .join("");
  el.innerHTML = `
    <p class="font-mono text-[10px] tracking-[0.25em] text-white/40">THE LEDGER · BUSINESS</p>
    <h3 class="font-display mt-2 text-xl font-bold leading-tight text-white">${esc(res.title)}</h3>
    <p class="mt-1 text-[11px] text-white/40">${esc(res.byline)}</p>
    <div class="mt-4 space-y-3">${paras}</div>
    ${view.paywall ? PAYWALL : ""}`;
}

const clientView = {
  // Vulnerable: the browser decides, from a flag the reader controls.
  vulnerable: () => {
    const premiumUser = storage.get() === "true";
    return { lock: !premiumUser, paywall: !premiumUser };
  },
  // Patched: the browser just shows what the server chose to send.
  fixed: (res) => ({ lock: false, paywall: res.locked }),
};

const domStats = (el) => ({
  paras: el.querySelectorAll("p.para").length,
  premium: el.querySelectorAll("p.premium").length,
  locked: el.querySelectorAll("p.locked").length,
  paywall: !!el.querySelector(".paywall"),
});
const wordCount = (nodes) => nodes.reduce((n, p) => n + p.textContent.trim().split(/\s+/).length, 0);
const preview = (res) =>
  JSON.stringify({ ...res, html: res.html.map((t) => (t.length > 34 ? `${t.slice(0, 34)}…` : t)) }, null, 2);

function PaywallSandbox({ mode, onModeChange }) {
  const articleRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [flag, setFlag] = useState(null);
  const [network, setNetwork] = useState(null);
  const [status, setStatus] = useState("live");
  const [pulse, setPulse] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((f) => setLogs((l) => [...l, logEntry(f)]), []);
  const hit = (s) => {
    setStatus(s);
    setPulse((p) => p + 1);
  };
  const refresh = () => {
    setStats(domStats(articleRef.current));
    setFlag(storage.get());
  };

  // The page load: request the article, then let the client decide what shows.
  const load = useCallback(() => {
    const res = api(mode);
    renderArticle(articleRef.current, res, clientView[mode](res));
    setStats(domStats(articleRef.current));
    setFlag(storage.get());
    return res;
  }, [mode]);

  const reset = useCallback(() => {
    storage.clear();
    load();
    setNetwork(null);
    setStatus("live");
    setLogs([
      logEntry({
        origin: "sandbox",
        status: "INFO",
        detail:
          mode === "fixed"
            ? "PATCHED build — the server sends premium text only to subscribed sessions."
            : "VULNERABLE build — the server sends every paragraph; the browser hides some.",
      }),
    ]);
  }, [mode, load]);

  useEffect(() => {
    reset();
  }, [reset]);
  useEffect(() => () => storage.clear(), []);

  const deleteOverlay = () => {
    const root = articleRef.current;
    root.querySelector(".paywall")?.remove();
    root.querySelectorAll(".locked").forEach((p) => p.classList.remove("locked"));
    const premium = [...root.querySelectorAll("p.premium")];
    refresh();
    if (premium.length) {
      hit("exploited");
      addLog({
        origin: "devtools · elements",
        payload: `$(".paywall").remove(); $$(".locked").forEach(p => p.classList.remove("locked"))`,
        status: "EXPLOITED",
        detail: `${premium.length} premium paragraphs (${wordCount(premium)} words) were in the DOM all along — only CSS was hiding them.`,
      });
    } else {
      hit("blocked");
      addLog({
        origin: "devtools · elements",
        payload: `$(".paywall").remove()`,
        status: "BLOCKED",
        detail: `Overlay gone, nothing underneath: the server sent only the ${ARTICLE.teaser.length}-paragraph teaser.`,
      });
    }
  };

  const flipFlag = () => {
    storage.set("true");
    const res = load(); // the site re-renders, as on a page refresh
    const s = domStats(articleRef.current);
    setNetwork(null);
    if (s.premium > 0 && s.locked === 0 && !s.paywall) {
      hit("exploited");
      addLog({
        origin: "devtools · console",
        payload: 'localStorage.setItem("isPremium", "true")',
        status: "EXPLOITED",
        detail: "After a refresh the client read the flag and unlocked the article itself.",
      });
    } else {
      hit("blocked");
      addLog({
        origin: "devtools · console",
        payload: 'localStorage.setItem("isPremium", "true")',
        status: "BLOCKED",
        detail: `GET /api/articles/merger still returned ${res.html.length} teaser paragraphs and "locked": true. The server checks the session's subscription; localStorage never leaves the browser.`,
      });
    }
  };

  const readResponse = () => {
    const res = api(mode);
    setNetwork(res);
    if (mode === "vulnerable") {
      hit("exploited");
      addLog({
        origin: "devtools · network",
        payload: "GET /api/articles/merger → 200",
        status: "EXPLOITED",
        detail: `The response body holds all ${res.html.length} paragraphs, premium included. The paywall is only paint.`,
      });
    } else {
      hit("blocked");
      addLog({
        origin: "devtools · network",
        payload: "GET /api/articles/merger → 200",
        status: "BLOCKED",
        detail: `${res.html.length} teaser paragraphs and "locked": true. The premium text never left the server.`,
      });
    }
  };

  return (
    <Workstation
      plate={lab.num}
      mode={mode}
      onModeChange={onModeChange}
      onReset={reset}
      victim={
        <VictimWindow url="theledger.news/business/merger" status={status} pulse={pulse}>
          <div ref={articleRef} className="article-body relative min-h-[360px] p-5" />
          <div className="border-t border-dashed border-white/15 px-5 py-3 font-mono text-[11px]">
            <p className="text-white/35">X-RAY · {network ? "NETWORK" : "PAGE STATE"}</p>
            {network ? (
              <>
                <p className="mt-1 text-white/70">GET /api/articles/merger · 200</p>
                <pre className="console-scroll mt-1.5 max-h-36 overflow-auto text-[10.5px] leading-[1.55] text-white/60">{preview(network)}</pre>
              </>
            ) : (
              stats && (
                <p className="mt-1 leading-5 text-white/55">
                  DOM → <span className="text-white">{stats.paras}</span> paragraphs ·{" "}
                  <span className="text-white">{stats.locked}</span> locked · paywall{" "}
                  <span className="text-white">{stats.paywall ? "on" : "off"}</span>
                  <br />
                  localStorage.isPremium → <span className="text-white">{flag === null ? "null" : `"${flag}"`}</span>
                </p>
              )
            )}
          </div>
        </VictimWindow>
      }
      payloads={
        <>
          <PayloadButton n="01" title="Delete the overlay" code={`$(".paywall").remove()  // + unblur .locked`} onClick={deleteOverlay} />
          <PayloadButton n="02" title="Flip the premium flag" code={`localStorage.setItem("isPremium", "true")`} onClick={flipFlag} />
          <PayloadButton n="03" title="Read the API response" code={`await (await fetch("/api/articles/merger")).json()`} onClick={readResponse} />
        </>
      }
      console={<Console logs={logs} onClear={() => setLogs([])} />}
    />
  );
}

const LINE = {
  file: "article.js — vulnerable",
  lines: [
    { code: "// article.js — load the story, then gate it" },
    { code: "const res = await fetch(`/api/articles/${id}`);" },
    { code: "const article = await res.json(); // every paragraph, for every visitor" },
    { code: "" },
    { code: "body.innerHTML = renderParagraphs(article.html);" },
    { code: "" },
    {
      code: 'if (localStorage.getItem("isPremium") !== "true") {',
      mark: "fracture",
      note: "The decision to lock the article runs in the visitor's browser, after the full text has already arrived. Anyone can flip this flag or skip the check.",
    },
    { code: '  body.querySelectorAll("p.premium")' },
    { code: '    .forEach((p) => p.classList.add("locked")); // CSS blurs .locked' },
    { code: "  showPaywall();" },
    { code: "}" },
  ],
};

const FIX = {
  file: "server.js — patched",
  lines: [
    { code: "// server.js — the server decides what each session may read" },
    { code: 'app.get("/api/articles/:id", async (req, res) => {' },
    { code: "  const article = await db.articles.find(req.params.id);" },
    { code: "  const paid = await billing.isSubscriber(req.session.userId);" },
    { code: "" },
    { code: "  res.json({" },
    { code: "    title: article.title," },
    {
      code: "    html: paid ? article.html : article.teaser,",
      mark: "patch",
      note: "Non-subscribers never receive the premium paragraphs, so there is nothing in the page to unhide.",
    },
    { code: "    locked: !paid," },
    { code: "  });" },
    { code: "});" },
  ],
};

export default function Lab03PaywallBypass() {
  const [mode, setMode] = useState("vulnerable");
  return (
    <LabPage
      lab={lab}
      what={
        <>
          A client-side paywall sends the whole article to the browser, then hides part of it with CSS and a
          JavaScript check. Whatever the browser receives, the reader controls, so deleting the overlay or flipping one
          flag reveals content the site meant to sell. It is a textbook case of enforcing a server-side rule on the
          client.
        </>
      }
      line={LINE}
      sandbox={<PaywallSandbox mode={mode} onModeChange={setMode} />}
      why={
        <>
          Paid content leaks the moment a reader opens DevTools, installs a bypass extension or turns off JavaScript —
          no hacking skills required. The same mistake guards more than articles: trial limits, admin buttons and
          premium features hidden only in the interface.
        </>
      }
      incident={{
        label: "ONGOING",
        title: "Paywalls that rely on JavaScript",
        text: "Wikipedia's article on paywalls notes that readers can get past paywalls that depend on JavaScript simply by disabling it, or with third-party tools such as the Bypass Paywalls Clean extension.",
        href: "https://en.wikipedia.org/wiki/Paywall",
        linkLabel: "Wikipedia — Paywall",
      }}
      fix={FIX}
      sources={[
        { label: "OWASP — Authorization Cheat Sheet (checks in the right location)", href: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
        { label: "MITRE — CWE-602: Client-Side Enforcement of Server-Side Security", href: "https://cwe.mitre.org/data/definitions/602.html" },
        { label: "OWASP Top 10 — A04:2021 Insecure Design", href: "https://owasp.org/Top10/A04_2021-Insecure_Design/" },
        { label: "Wikipedia — Paywall", href: "https://en.wikipedia.org/wiki/Paywall" },
      ]}
      onVerifyFix={() => setMode("fixed")}
    />
  );
}
