// safe-html.js — restricted rich-text pipeline.
//
// SAFETY BOUNDARY: this module exists so user HTML can never run script.
// The lab's flaw is NOT here. The flaw is that guidelines.js trusts a named
// window property. This sanitizer deliberately keeps one narrow thing that makes
// the lab possible: a validated `id` on <a>, plus an allowlisted local `href`.
//
// Pipeline: DOMParser (inert document, nothing executes or loads) -> walk the tree
// -> build FRESH elements with document.createElement. Source nodes are never
// inserted into the live document and no innerHTML is used on the live page.

export const LIMITS = Object.freeze({ maxSource: 600, maxDepth: 4, maxNodes: 40 });

export const ALLOWED_TAGS = new Set(['P', 'STRONG', 'EM', 'SPAN', 'A', 'BR']);

// Local, in-document destinations only. Anything else is rejected.
export const ALLOWED_HREFS = new Set([
  '#community-guidelines',
  '#untrusted-guidelines',
  '#alternate-guidelines'
]);

// Dangerous or active elements are removed together with their content.
const DROP_WITH_CONTENT = new Set([
  'SCRIPT', 'STYLE', 'SVG', 'MATH', 'IFRAME', 'FRAME', 'FRAMESET', 'OBJECT', 'EMBED',
  'APPLET', 'FORM', 'TEMPLATE', 'NOSCRIPT', 'TEXTAREA', 'SELECT', 'INPUT', 'BUTTON',
  'IMG', 'AUDIO', 'VIDEO', 'CANVAS', 'LINK', 'META', 'BASE', 'TITLE', 'HEAD'
]);

const ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/;
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * An id is only kept when it cannot overwrite something the app owns.
 * `id in window` is true for built-ins (location, name, top...), for app element ids,
 * and for ids already created by earlier rich posts. We accept the id only when
 * nothing exists yet, or when every current match lives inside rich post content.
 */
function isIdSafe(id) {
  if (!(id in window)) return true;
  const current = window[id];
  let elements = null;
  if (current instanceof Element) elements = [current];
  else if (current instanceof HTMLCollection) elements = Array.from(current);
  return elements !== null && elements.every((el) => el.closest('[data-rich]') !== null);
}

function shorten(value, n = 32) {
  const s = String(value);
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/**
 * @param {string} source untrusted HTML
 * @param {{keepIds?: boolean}} options keepIds=false strips ids (previews, secondary views)
 * @returns {{fragment: DocumentFragment, report: object}}
 */
export function sanitizeHtml(source, options = {}) {
  const keepIds = options.keepIds === true;
  const report = {
    nodes: 0,
    removedTags: [],
    unwrappedTags: [],
    removedAttrs: [],
    rejectedHrefs: [],
    rejectedIds: [],
    keptIds: [],
    truncated: false,
    tooLong: false
  };
  const fragment = document.createDocumentFragment();
  const text = String(source ?? '');
  if (text.length > LIMITS.maxSource) {
    report.tooLong = true;
    return { fragment, report };
  }

  const parsed = new DOMParser().parseFromString('<!doctype html><html><head></head><body>' + text, 'text/html');

  const note = (list, value) => { if (!list.includes(value)) list.push(value); };

  function copyChildren(from, to, depth) {
    for (const node of Array.from(from.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        to.appendChild(document.createTextNode(node.nodeValue));
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue; // comments, PIs: dropped silently

      const tag = node.localName.toUpperCase();
      const isHtml = node.namespaceURI === XHTML_NS;

      if (!isHtml || DROP_WITH_CONTENT.has(tag)) { note(report.removedTags, node.localName.toLowerCase()); continue; }
      if (!ALLOWED_TAGS.has(tag)) { note(report.unwrappedTags, node.localName.toLowerCase()); copyChildren(node, to, depth); continue; }

      if (report.nodes >= LIMITS.maxNodes) { report.truncated = true; continue; }
      if (depth >= LIMITS.maxDepth) {
        report.truncated = true;
        to.appendChild(document.createTextNode(node.textContent));
        continue;
      }

      const clean = document.createElement(node.localName);
      report.nodes += 1;

      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase();
        if (tag === 'A' && name === 'href') {
          const value = attr.value.trim();
          if (ALLOWED_HREFS.has(value)) clean.setAttribute('href', value);
          else note(report.rejectedHrefs, shorten(attr.value));
        } else if (tag === 'A' && name === 'id') {
          if (!keepIds) { note(report.removedAttrs, 'id (not kept in this view)'); }
          else if (ID_PATTERN.test(attr.value) && isIdSafe(attr.value)) { clean.setAttribute('id', attr.value); note(report.keptIds, attr.value); }
          else note(report.rejectedIds, shorten(attr.value));
        } else {
          note(report.removedAttrs, name);
        }
      }

      copyChildren(node, clean, depth + 1);
      to.appendChild(clean);
    }
  }

  copyChildren(parsed.head, fragment, 0);
  copyChildren(parsed.body, fragment, 0);
  return { fragment, report };
}

/** Plain text of the sanitized result (for search and empty-checks). */
export function sanitizedText(source) {
  return sanitizeHtml(source, { keepIds: false }).fragment.textContent.replace(/\s+/g, ' ').trim();
}

/** Human-readable lines describing what the sanitizer changed. */
export function summarizeReport(report) {
  const lines = [];
  if (report.tooLong) lines.push(`Source longer than ${LIMITS.maxSource} characters`);
  if (report.removedTags.length) lines.push('Removed elements: ' + report.removedTags.map((t) => `<${t}>`).join(' '));
  if (report.unwrappedTags.length) lines.push('Unwrapped (text kept): ' + report.unwrappedTags.map((t) => `<${t}>`).join(' '));
  if (report.removedAttrs.length) lines.push('Removed attributes: ' + report.removedAttrs.join(', '));
  if (report.rejectedHrefs.length) lines.push('Rejected href: ' + report.rejectedHrefs.join(', '));
  if (report.rejectedIds.length) lines.push('Rejected id: ' + report.rejectedIds.join(', '));
  if (report.truncated) lines.push('Truncated: size or depth limit reached');
  return lines;
}
