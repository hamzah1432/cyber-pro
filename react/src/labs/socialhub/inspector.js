// inspector.js — reads the REAL runtime DOM. Nothing here is simulated:
// every value comes from querying window / document at the moment it is called.
import { state, logEvent, notify } from "./store.js";
import { TRUSTED_VIEW, ALLOWED_VIEWS } from "./views.js";

const TARGET = "guidelinesLink";

/** Snapshot of what `window.guidelinesLink` is right now. */
export function probe() {
  const found = window[TARGET];
  const candidates = Array.from(document.querySelectorAll(`[id="${TARGET}"]`));
  const injected = candidates.find((el) => el.closest("[data-rich]")) || null;
  const isElement = found instanceof Element;
  const isCollection = found instanceof HTMLCollection;
  let kind = typeof found;
  if (isElement) kind = found.constructor.name;
  else if (isCollection) kind = `HTMLCollection (${found.length})`;
  return {
    type: typeof found,
    kind,
    ownProperty: Object.hasOwn(window, TARGET),
    candidates: candidates.length,
    injectedExists: injected !== null,
    isElement,
    isCollection,
    tagName: isElement ? found.tagName : null,
    identity: isElement && injected !== null && found === injected,
    href: isElement ? found.getAttribute("href") : null,
  };
}

/** Classify the outcome of a Guidelines press from what was actually observed. */
function classify(before, run) {
  if (!before.injectedExists) return { code: "absent", label: "Collision absent: trusted view opened" };
  if (!before.identity) {
    return { code: "ambiguous", label: "window.guidelinesLink is not a single element: href unreadable, trusted view kept" };
  }
  const changed = run.destination !== TRUSTED_VIEW;
  if (changed) return { code: "hijacked", label: "Navigation changed: injected href was consumed" };
  if (before.href && ALLOWED_VIEWS.has(before.href) && before.href !== TRUSTED_VIEW) {
    return { code: "blocked", label: "Collision present but not consumed: trusted view kept" };
  }
  return { code: "present-unused", label: "Collision present, but its href selects nothing different" };
}

/** Called by guidelines.js right after a handler ran. Reads the resulting route. */
export function recordRun(before) {
  const run = { mode: state.mode, before, destination: "#" + state.route, trusted: TRUSTED_VIEW };
  run.effect = classify(before, run);
  state.lastRun = run;
  logEvent("guidelines", `Guidelines pressed (${run.mode}) → ${run.destination}`);
  if (run.effect.code === "hijacked") logEvent("navigation", `Destination changed from ${TRUSTED_VIEW} to ${run.destination}`);
  if (run.effect.code === "blocked") logEvent("blocked", `Fixed handler ignored window.guidelinesLink; kept ${TRUSTED_VIEW}`);
  notify();
}

/** Verdict shown in the comparison panel. */
export function verdict() {
  const run = state.lastRun;
  if (!run) return { code: "idle", label: "Press Guidelines to observe" };
  switch (run.effect.code) {
    case "hijacked":
      return { code: "hijacked", label: "Clobbered" };
    case "blocked":
      return { code: "blocked", label: "Blocked" };
    case "ambiguous":
      return { code: "normal", label: "Normal (ambiguous collision)" };
    default:
      return { code: "normal", label: "Normal" };
  }
}

export function liveEffectLabel(p) {
  if (!p.injectedExists) return "No injected element";
  if (p.identity) return "Armed: window.guidelinesLink is the injected anchor";
  return "Several matches: window returns a collection";
}
