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

export function openGuidelines() {
  const before = probe();
  const handler = state.mode === "fixed" ? openGuidelinesFixed : openGuidelinesVulnerable;
  handler();
  recordRun(before);
}
