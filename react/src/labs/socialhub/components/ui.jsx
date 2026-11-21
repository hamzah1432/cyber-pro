import { createElement, useMemo } from "react";
import { sanitizeHtml } from "../safe-html.js";
import { toast } from "../actions.js";

const ICONS = {
  heart: "M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10Z",
  comment: "M5 5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16h-8l-4.5 3.5V16H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 5Z",
  bookmark: "M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z",
  image: "M4 6h16v12H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 16.5M15.5 9.5h.01",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm4.8 11.3L20 20",
  home: "M4 11l8-7 8 7v8.5H4zM10 19.5v-5h4v5",
  shield: "M12 3.5l7 2.5v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2.2 2.2L15.5 10",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12",
};

export function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}

export const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function Avatar({ user, size }) {
  return (
    <span className={"avatar" + (size ? " avatar--" + size : "")} data-tone={user.tone} aria-hidden="true">
      {initials(user.name)}
    </span>
  );
}

export function timeAgo(ts) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + " h ago";
  return Math.round(h / 24) + " d ago";
}

/** Segmented control; options are [value, label] pairs. */
export function Seg({ label, value, options, onChange, dark }) {
  return (
    <div className={"seg" + (dark ? " seg--dark" : "")} role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

// The sanitizer returns fresh DOM nodes (allow-listed tags, only id/href).
// Mirror them as React elements so an allowed id really lands in the page.
function toReact(nodes) {
  return Array.from(nodes, (node, i) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
    const props = { key: i };
    if (node.id) props.id = node.id;
    if (node.hasAttribute("href")) props.href = node.getAttribute("href");
    return createElement(node.localName, props, node.childNodes.length ? toReact(node.childNodes) : undefined);
  });
}

// Links inside posts are inert in this lab: only the Guidelines button navigates.
function inertLinks(e) {
  if (!e.target.closest("a")) return;
  e.preventDefault();
  toast("Links inside posts are disabled in this lab. Use the Guidelines button.");
}

/** A restricted-HTML post body. Sanitized once per mount, like the original card. */
export function RichBody({ source, keepIds }) {
  const content = useMemo(() => toReact(sanitizeHtml(source, { keepIds }).fragment.childNodes), [source, keepIds]);
  return (
    <div className="post__body post__body--rich" data-rich="" onClickCapture={inertLinks}>
      {content}
    </div>
  );
}

export function Wordmark() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#f5f5f5" />
      <circle cx="10" cy="14" r="4.5" fill="#050505" />
      <circle cx="18.5" cy="14" r="4.5" fill="none" stroke="#050505" strokeWidth="2.6" />
    </svg>
  );
}
