// guidelines.js — the Community Guidelines toolbar action.
//
// THE FLAW LIVES HERE (intentionally). openGuidelinesVulnerable() asks the global
// object for `guidelinesLink`, a name the app never defines, and trusts whatever
// comes back. Any element with id="guidelinesLink" in the document answers that
// lookup through the browser's named-property behaviour.
//
// The Source tab shows this file's own text, so what students read is exactly
// what runs.
import { state } from "./store.js";
import { TRUSTED_VIEW, ALLOWED_VIEWS, showLocalView } from "./views.js";
import { probe, recordRun } from "./inspector.js";

export function openGuidelinesVulnerable() {
  // Reads a global the app never defined.
  const config = window.guidelinesLink; // VULNERABLE LOOKUP
  const requested = config?.getAttribute?.('href');
  const target = ALLOWED_VIEWS.has(requested)
    ? requested
    : TRUSTED_VIEW;
  showLocalView(target);
}

export function openGuidelinesFixed() {
  // Trusted code decides the destination.
  // window.* named properties are never consulted.
  showLocalView(TRUSTED_VIEW);
}

/** Every Guidelines button calls this. It picks the handler for the current mode. */
export function openGuidelines() {
  const before = probe(); // observation only; never feeds the handler
  const handler = state.mode === "fixed" ? openGuidelinesFixed : openGuidelinesVulnerable;
  handler();
  recordRun(before);
}
