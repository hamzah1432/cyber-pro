// actions.js — composer and Workbench actions (from composer.js, workbench.js,
// main.js). Steps that read the DOM right after a change commit it first with
// flushSync, because the lab inspects the real document.
import { flushSync } from "react-dom";
import {
  state,
  notify,
  logEvent,
  addPost,
  setPendingImage,
  resetAttackState,
  resetEnvironment,
  ME,
} from "./store.js";
import { LIMITS, sanitizeHtml, sanitizedText, summarizeReport } from "./safe-html.js";
import { showLocalView } from "./views.js";
import { probe } from "./inspector.js";
import { openGuidelines } from "./guidelines.js";

export const PLAIN_MAX = 500;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const IMAGE_MAX = 3 * 1024 * 1024;

// Exact payloads from the lab contract. The buttons only FILL the editor.
export const PRESETS = Object.freeze({
  1: '<a id="guidelinesLink" href="#untrusted-guidelines">Updated Community Rules</a>',
  2: '<a id="guidelinesLink" href="#alternate-guidelines">Community Rules Notice</a>',
  3: '<a id="unrelatedHelpLink" href="#untrusted-guidelines">Helpful Link</a>',
});

const focus = (selector) => document.querySelector(selector)?.focus();
const commit = (change) =>
  flushSync(() => {
    change();
    notify();
  });

export function toast(text) {
  state.toast = { text, n: state.toast.n + 1 };
  notify();
}

/* ---------- navigation ---------- */

export function nav(name) {
  if (name === "community-guidelines") return openGuidelines();
  if (name === "profile") state.profileUser = ME;
  showLocalView(name);
}

export function openProfile(userId) {
  state.profileUser = userId;
  showLocalView("profile");
}

export function filterCommunity(id) {
  state.community = state.community === id ? null : id;
  showLocalView("feed", { focus: false });
}

export function searchTag(tag) {
  state.query = tag;
  showLocalView("feed", { focus: false });
}

export function setQuery(query) {
  state.query = query;
  if (state.route !== "feed") showLocalView("feed", { focus: false });
  else notify();
}

/* ---------- composer ---------- */

export function setEditorText(text) {
  state.editorText = text;
  notify();
}

export function setFormat(format) {
  Object.assign(state, { format, composerError: "", previewSource: null });
  notify();
}

function fail(message, notes = []) {
  state.composerError = message;
  state.feedback = { lines: [message, ...notes], kind: "error" };
  notify();
  return null;
}

export function previewRich() {
  const { report } = sanitizeHtml(state.editorText, { keepIds: false }); // same sanitizer; ids not mounted
  state.previewSource = state.editorText;
  state.feedback = { lines: summarizeReport(report), kind: "info" };
  notify();
}

function takeImage() {
  const url = state.pendingImage ? state.pendingImage.url : null;
  state.pendingImage = null; // ownership of the object URL moves to the post
  return url;
}

function finishPublish(post) {
  flushSync(() => showLocalView("feed", { focus: false }));
  const mounted = document.querySelector(`[data-post-id="${post.id}"][data-ctx="main"]`);
  if (!mounted) return fail("Post could not be mounted.");
  toast("Post published");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  return mounted;
}

export function publishPlain(raw) {
  const text = raw.trim();
  if (!text) {
    state.composerError = "Write something before publishing.";
    notify();
    focus("#composer-plain");
    return null;
  }
  if (text.length > PLAIN_MAX) {
    state.composerError = `Posts are limited to ${PLAIN_MAX} characters (you have ${text.length}).`;
    notify();
    return null;
  }
  state.composerError = "";
  const post = addPost({ kind: "plain", body: text, searchText: text, community: state.composerCommunity, imageUrl: takeImage() });
  logEvent("published", "Published a plain-text post (rendered with textContent)");
  return finishPublish(post);
}

/** Publish the shared editor content as a restricted-HTML post. Returns the mounted card or null. */
export function publishRich() {
  const source = state.editorText;
  if (!source.trim()) return fail("Add some HTML source before publishing.");
  if (source.length > LIMITS.maxSource) {
    return fail(`HTML source is limited to ${LIMITS.maxSource} characters (you have ${source.length}).`);
  }
  const { report } = sanitizeHtml(source, { keepIds: true });
  const visible = sanitizedText(source);
  const notes = summarizeReport(report);
  if (!visible) {
    logEvent("rejected", "Rejected: " + (notes.join(" · ") || "no visible content"));
    return fail("Nothing visible was left after sanitizing, so no post was published.", notes);
  }
  state.composerError = "";
  const post = addPost({ kind: "rich", body: source, searchText: visible, community: state.composerCommunity, imageUrl: takeImage() });
  const mounted = finishPublish(post);
  if (!mounted) return null;

  logEvent("published", `Published rich post (${report.nodes} element${report.nodes === 1 ? "" : "s"} kept)`);
  if (notes.length) logEvent("sanitized", notes.join(" · "));
  const kept = report.keptIds.length ? `Kept id: ${report.keptIds.join(", ")}.` : "No id kept.";
  state.feedback = { lines: ["Published. " + kept, ...notes], kind: notes.length ? "warn" : "ok" };

  const p = probe();
  if (p.injectedExists) {
    logEvent(
      "collision",
      p.identity
        ? `window.guidelinesLink === the injected <a> (href ${p.href ?? "none"})`
        : `${p.candidates} elements share id guidelinesLink: window returns a collection`
    );
  }
  notify();
  return mounted;
}

export function attachFile(file) {
  if (!file) return;
  if (!IMAGE_TYPES.has(file.type)) state.composerError = "Only PNG, JPEG, WebP or GIF images can be attached.";
  else if (file.size > IMAGE_MAX) state.composerError = "Images are limited to 3 MB.";
  else {
    state.composerError = "";
    setPendingImage({ url: URL.createObjectURL(file), name: file.name }); // local only; never uploaded anywhere
  }
  notify();
}

export function removeAttachment() {
  setPendingImage(null);
  notify();
}

/* ---------- Workbench ---------- */

export function openWorkbench({ focus: moveFocus = true } = {}) {
  commit(() => (state.wbOpen = true));
  if (moveFocus) focus('[data-tab][aria-selected="true"]');
}

export function closeWorkbench() {
  commit(() => (state.wbOpen = false));
  focus('[data-action="wb-toggle"]');
}

export const toggleWorkbench = () => (state.wbOpen ? closeWorkbench() : openWorkbench());

export function selectTab(tab, moveFocus = true) {
  commit(() => (state.tab = tab));
  if (moveFocus) focus(`[data-tab="${tab}"]`);
}

export function loadPreset(key) {
  state.presetKey = key;
  setEditorText(PRESETS[key]);
  focus("[data-workbench] [data-editor]");
  toast(`Preset ${key} loaded. Press Publish to post it.`);
}

export function clearEditor() {
  state.presetKey = null;
  setEditorText("");
}

export function setMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  state.codeView = mode; // the Source tab follows the running mode
  resetAttackState(); // posts removed, route/filters reset; editor bytes + history kept
  logEvent("mode", `Mode switched to ${mode}. User posts removed; editor kept.`);
  showLocalView("feed", { focus: false });
  toast(mode === "fixed" ? "Fixed mode. Publish the same payload again." : "Vulnerable mode.");
}

export function fullReset() {
  resetEnvironment();
  showLocalView("feed", { focus: false });
  toast("Environment reset");
}

export function pressGuidelines(invoker) {
  document.querySelector("[data-guidelines-btn]").click(); // the real toolbar button, same code path
  invoker?.focus();
}

export function revealHint() {
  state.hintsShown += 1;
  notify();
}

export function setCodeView(which) {
  state.codeView = which;
  notify();
}
