import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import CodeFilm from "../components/lab/CodeFilm.jsx";
import FOX_IMAGE_URL from "../assets/fox-67.png";

const SECRET_HTML_CONTENT = `
  <div>
    <img src="${FOX_IMAGE_URL}" alt="Derpy Fox saying 67" class="fox-image w-full max-w-[180px] rounded-lg border border-white/20 bg-white">
    <p class="mt-3 text-sm text-white/80"><strong class="text-white">Answer:</strong> 67</p>
  </div>
`;

const LINE_BASE = "mt-4 w-fit font-mono text-[13.5px] leading-5 tracking-wide";
const TONE = {
  neutral: "text-white/55",
  strong: "text-white",
  alert: "rounded-[3px] bg-white px-1.5 py-0.5 text-[#050505]",
  blocked: "rounded-[3px] border border-white/60 px-1.5 py-0.5 text-white",
};
function setLine(el, text, tone) {
  el.textContent = text;
  el.className = `${LINE_BASE} ${TONE[tone]}`;
}

const DEFAULT_PAYLOAD = `window.guardObserver.disconnect();
document.getElementById('vuln-answer-wrapper').classList.remove('blurred-secret');
document.getElementById('vuln-paywall').remove();`;

// ── Vulnerable sandbox ──────────────────────────────────────────────────────

function initVulnerableSandbox(vulnSandbox) {
  if (window.guardObserver) window.guardObserver.disconnect();

  vulnSandbox.innerHTML = `
    <div id="vuln-content-box">
      <p class="text-[17px] text-white/80"><strong class="text-white">Question:</strong> What does the fox say?</p>
      <div id="vuln-answer-wrapper" class="blurred-secret mt-3">
        ${SECRET_HTML_CONTENT}
      </div>
      <div id="vuln-paywall" class="mt-4 rounded-md border-2 border-dashed border-white/40 bg-white/[0.03] p-4">
        <p class="font-mono text-[13px] tracking-[0.2em] text-white">PAYWALL ACTIVE</p>
        <p class="mt-1 text-sm text-white/70">Pay $2 to unlock the answer!</p>
      </div>
    </div>
    <p id="vuln-status" class="${LINE_BASE} ${TONE.neutral}">[Guard Status: MutationObserver Active]</p>
  `;

  const targetNode = document.getElementById("vuln-content-box");

  window.guardObserver = new MutationObserver(() => {
    // Disconnect first so the wipe below doesn't re-trigger the observer.
    window.guardObserver.disconnect();
    vulnSandbox.innerHTML = `
      <p class="tamper-alert inline-block rounded-[3px] bg-white px-2 py-1 font-mono text-[14px] font-semibold tracking-[0.16em] text-[#050505]">⚠︎ TAMPERING DETECTED! ⚠︎</p>
      <p class="mt-3 text-sm text-white/70">Unauthorized DOM modification blocked. Page content deleted.</p>
    `;
  });

  window.guardObserver.observe(targetNode, {
    attributes: true, // class/style changes (unblur)
    childList: true, // element additions/removals (delete paywall)
    subtree: true,
  });
}

function vulnRemoveOverlay() {
  const paywall = document.getElementById("vuln-paywall");
  const answerWrapper = document.getElementById("vuln-answer-wrapper");
  if (paywall) paywall.remove();
  if (answerWrapper) answerWrapper.classList.remove("blurred-secret");
}

function vulnStopObserver() {
  if (window.guardObserver) {
    window.guardObserver.disconnect();
    const status = document.getElementById("vuln-status");
    if (status) setLine(status, "[Guard Status: MutationObserver Neutralized by Button Click!]", "strong");
  }
}

// ── Secure sandbox (simulated server) ───────────────────────────────────────

async function simulateServerFetch(authToken) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (authToken === "VALID_USER_TOKEN_123") {
    return { success: true, secretHtml: SECRET_HTML_CONTENT };
  }
  return { success: false, error: "Invalid or missing auth token." };
}

function initSecureSandbox(secureSandbox) {
  secureSandbox.innerHTML = `
    <div id="secure-box">
      <p class="text-[17px] text-white/80"><strong class="text-white">Question:</strong> What does the fox say?</p>
      <div id="secure-paywall" class="mt-4 rounded-md border-2 border-white/40 bg-white/[0.03] p-4">
        <p class="font-mono text-[13px] tracking-[0.2em] text-white">PAYWALL ACTIVE</p>
        <p class="mt-1 text-sm italic text-white/60">[Content withheld by server]</p>
        <button type="button" id="secure-btn-pay" class="mt-3 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-[#050505] transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] disabled:cursor-wait disabled:opacity-60">Simulate Valid $2 Payment (Get Token)</button>
      </div>
      <div id="secure-answer-slot" class="mt-4"></div>
    </div>
    <p id="secure-log" class="${LINE_BASE} ${TONE.neutral}"></p>
  `;

  secureSandbox.querySelector("#secure-btn-pay").addEventListener("click", async () => {
    const paywall = document.getElementById("secure-paywall");
    const slot = document.getElementById("secure-answer-slot");
    const log = document.getElementById("secure-log");
    const payBtn = document.getElementById("secure-btn-pay");

    payBtn.disabled = true;
    payBtn.textContent = "Authorizing with Server...";
    setLine(log, "Contacting payment gateway and server API...", "neutral");

    // 1. Client calls the simulated server endpoint
    const serverResponse = await simulateServerFetch("VALID_USER_TOKEN_123");
    if (!slot.isConnected) return; // sandbox was reset while waiting

    // 2. Server sends back the answer only upon success
    if (serverResponse.success) {
      paywall.remove();
      slot.innerHTML = serverResponse.secretHtml;
      setLine(log, "[Vault Log: Payment verified by server. Secret data injected into DOM.]", "strong");
    } else {
      setLine(log, `[Vault Error: ${serverResponse.error}]`, "alert");
      payBtn.disabled = false;
      payBtn.textContent = "Simulate Valid $2 Payment";
    }
  });
}

function secureRemoveOverlay() {
  const paywall = document.getElementById("secure-paywall");
  const log = document.getElementById("secure-log");
  if (paywall) {
    paywall.remove();
    setLine(log, "[Attack Result: Paywall UI deleted, but the secret data was never loaded into the browser.]", "blocked");
  }
}

function secureRunPayload() {
  const log = document.getElementById("secure-log");
  setLine(
    log,
    "[Attack Result: Payload executed, but there is no client-side MutationObserver guarding the DOM. This attack vector fails.]",
    "blocked"
  );
}

// ── Source listings ─────────────────────────────────────────────────────────

const VULN_CODE = {
  file: "secret-box.html — vulnerable",
  lines: [
    { code: '<div id="secret-box">' },
    { code: "  <p>What does the fox say?</p>" },
    { code: '  <div id="vuln-answer-wrapper" class="blurred-secret"><img src="fox-67.png"></div>', mark: "fracture" },
    { code: '  <div id="vuln-paywall">Pay $2 to unlock!</div>' },
    { code: "</div>" },
    { code: "" },
    { code: "<script>" },
    { code: "  const target = document.getElementById('secret-box');" },
    { code: "  window.guardObserver = new MutationObserver(() => {", mark: "fracture" },
    { code: "    target.innerHTML = '<p class=\"tamper-alert\">TAMPERING DETECTED! Content deleted.</p>';", mark: "fracture" },
    { code: "  });", mark: "fracture" },
    { code: "  window.guardObserver.observe(target, { childList: true, subtree: true, attributes: true });", mark: "fracture" },
    { code: "</script>" },
  ],
};

const SECURE_CODE = {
  file: "secure-box.html — secure",
  lines: [
    { code: '<div id="secure-box">' },
    { code: "  <p>What does the fox say?</p>" },
    { code: '  <div id="secure-paywall">Pay $2 to unlock</div>' },
    { code: '  <div id="secure-answer-slot"></div>', mark: "patch" },
    { code: "</div>" },
    { code: "" },
    { code: "<script>" },
    { code: "  // Simulated network request to backend API" },
    { code: "  async function unlockContent(authToken) {" },
    { code: "    const response = await fetch('/api/get-secret', {", mark: "patch" },
    { code: "      headers: { 'Authorization': `Bearer ${authToken}` }", mark: "patch" },
    { code: "    });", mark: "patch" },
    { code: "    if (response.ok) {", mark: "patch" },
    { code: "      const data = await response.json();", mark: "patch" },
    { code: "      document.getElementById('secure-answer-slot').innerHTML = data.secretHtml;", mark: "patch" },
    { code: "    }", mark: "patch" },
    { code: "  }" },
    { code: "</script>" },
  ],
};

// ── Page ────────────────────────────────────────────────────────────────────

function ControlButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[14px] tracking-wide text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
    >
      {children}
    </button>
  );
}

const Code = ({ children }) => <code className="font-mono text-[0.9em] text-white">{children}</code>;

export default function Lab03PaywallBypass() {
  const vulnRef = useRef(null);
  const secureRef = useRef(null);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [payloadError, setPayloadError] = useState(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Security Lab: Client-Side Paywall Bypass";
    window.guardObserver = null;
    initVulnerableSandbox(vulnRef.current);
    initSecureSandbox(secureRef.current);
    return () => {
      document.title = previousTitle;
      window.guardObserver?.disconnect();
      window.guardObserver = null;
    };
  }, []);

  const executePayload = () => {
    setPayloadError(null);
    try {
      // Runs whatever is in the textarea against this page, like a console —
      // the reader controls their own browser, which is the point of the lab.
      new Function(payload)();
      const status = document.getElementById("vuln-status");
      if (status) setLine(status, "[Guard Status: Payload Executed via Text Area!]", "alert");
    } catch (error) {
      console.error("Payload execution failed:", error);
      setPayloadError(`Payload execution failed: ${error.message}`);
    }
  };

  return (
    <main className="text-up mx-auto max-w-4xl px-4 sm:px-6">
      <header className="animate-rise border-b border-white/10 pb-10 pt-10 sm:pt-14">
        <a
          href="#labs"
          className="inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.2em] text-white/45 transition-colors duration-300 hover:text-white"
        >
          <ArrowLeft size={13} /> LIGHT-BOX
        </a>
        <p className="mt-8 font-mono text-xs tracking-[0.25em] text-white/50">PLATE 03</p>
        <h1 className="font-display mt-3 text-3xl font-bold leading-[1.08] text-white sm:text-5xl">
          Client-Side Paywall Bypass <span className="text-white/45">(Presentation-Layer Access Control)</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
          <strong className="font-semibold text-white">Core Lesson:</strong> Never rely on client-side DOM observers, CSS
          hiding, or client-side data storage to enforce paywalls. Because the browser belongs to the user, presentation
          layers can always be manipulated.
        </p>
      </header>

      {/* ── 1. Vulnerable implementation ─────────────────────────────────── */}
      <section id="vulnerable-section" className="py-12">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          1. Vulnerable Implementation (Client-Side Guard)
        </h2>
        <p className="mt-3 leading-7 text-white/65">
          The secret content is already present in the DOM. A <Code>MutationObserver</Code> watches for tampering and
          wipes the container if modified.
        </p>

        <article id="vuln-sandbox" ref={vulnRef} className="glass mt-6 min-h-[150px] rounded-xl p-6" />

        <div className="mt-4 flex flex-wrap gap-2">
          <ControlButton onClick={vulnRemoveOverlay}>1. Remove Paywall Overlay</ControlButton>
          <ControlButton onClick={vulnStopObserver}>2. Run Payload (Stop Observer)</ControlButton>
          <ControlButton onClick={() => initVulnerableSandbox(vulnRef.current)}>3. Reset Sandbox</ControlButton>
        </div>

        <h3 className="font-display mt-10 text-lg font-bold text-white">Vulnerable Source Code</h3>
        <div className="mt-4">
          <CodeFilm {...VULN_CODE} large />
        </div>
      </section>

      <hr className="border-white/10" />

      {/* ── 2. Secure implementation ─────────────────────────────────────── */}
      <section id="secure-section" className="py-12">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          2. Secure Implementation (Simulated Server-Side Authorization)
        </h2>
        <p className="mt-3 leading-7 text-white/65">
          The secret content is withheld from the initial DOM render entirely. It is fetched from a server (simulated
          locally) only <em>after</em> authorization.
        </p>

        <article id="secure-sandbox" ref={secureRef} className="glass mt-6 min-h-[150px] rounded-xl p-6" />

        <div className="mt-4 flex flex-wrap gap-2">
          <ControlButton onClick={secureRemoveOverlay}>Test: Remove Paywall Overlay</ControlButton>
          <ControlButton onClick={secureRunPayload}>Test: Run Observer Payload</ControlButton>
          <ControlButton onClick={() => initSecureSandbox(secureRef.current)}>Reset Secure Sandbox</ControlButton>
        </div>

        <h3 className="font-display mt-10 text-lg font-bold text-white">Secure Source Code</h3>
        <div className="mt-4">
          <CodeFilm {...SECURE_CODE} large />
        </div>
      </section>

      <hr className="mb-16 border-white/10" />

      {/* ── Visible payload input area ───────────────────────────────────── */}
      <section id="payload-area" className="glass rounded-xl p-6 sm:p-8">
        <h3 className="font-display text-xl font-bold text-white">Payload Injection Center</h3>
        <p className="mt-2 leading-7 text-white/65">
          Copy and paste the known payload into this field to disable the client-side guard on the Vulnerable
          Implementation.
        </p>
        <textarea
          id="payload-input"
          rows={6}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          spellCheck={false}
          className="mt-4 w-full rounded-lg border border-white/15 bg-black/50 p-4 font-mono text-[14.5px] leading-6 text-white/85 outline-none transition-colors duration-300 focus:border-white/40"
        />
        <button
          type="button"
          id="execute-payload-btn"
          onClick={executePayload}
          className="mt-4 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#050505] transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,255,255,0.35)]"
        >
          Execute Payload on Vulnerable App
        </button>
        {payloadError && (
          <p role="alert" className="mt-3 w-fit rounded-[3px] border border-white/60 px-2 py-1 font-mono text-[13.5px] text-white">
            {payloadError} — check the console for details.
          </p>
        )}
      </section>

      <footer className="mt-20 border-t border-white/10 py-8 text-center font-mono text-xs text-white/40">
        DOMino — every exploit here runs as a safe simulation in your own browser tab.
      </footer>
    </main>
  );
}
