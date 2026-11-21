import { Braces, ArrowLeftRight, ExternalLink } from "lucide-react";

// Single source of truth for lab identity — used by the Navbar, Home cards,
// lab page headers and the "Next Lab" footer buttons.
export const LABS = [
  {
    id: "lab01",
    num: "01",
    path: "/lab/dom-clobbering",
    navLabel: "Lab 01: DOM Clobbering",
    title: "DOM Clobbering",
    subtitle: "When innocent-looking HTML overwrites the globals your script trusts.",
    summary:
      "Attacker HTML with crafted id attributes overwrites the JavaScript globals your code trusts — no <script> tag required.",
    owasp: "OWASP A03: Injection",
    cwe: "CWE-79 / DOM Manipulation",
    icon: Braces,
    accent: "violet",
  },
  {
    id: "lab02",
    num: "02",
    path: "/lab/postmessage",
    navLabel: "Lab 02: Insecure postMessage",
    title: "Insecure postMessage Origin Validation",
    subtitle: "A message handler without an origin check is a public, unauthenticated API.",
    summary:
      "A message handler that never checks event.origin becomes an unauthenticated API that any window or iframe can drive.",
    owasp: "OWASP A01: Broken Access Control",
    cwe: "CWE-346",
    icon: ArrowLeftRight,
    accent: "sky",
  },
  {
    id: "lab03",
    num: "03",
    path: "/lab/tabnabbing",
    navLabel: "Lab 03: Reverse Tabnabbing",
    title: "Reverse Tabnabbing",
    subtitle: "The tab you opened quietly rewrites the tab you came from.",
    summary:
      'A target="_blank" link without rel="noopener" lets the opened tab silently redirect your page to a phishing clone.',
    owasp: "OWASP A04: Insecure Design",
    cwe: "CWE-1022",
    icon: ExternalLink,
    accent: "amber",
  },
];

export const labByPath = (path) => LABS.find((l) => l.path === path);

export const nextLabOf = (id) => {
  const i = LABS.findIndex((l) => l.id === id);
  return i >= 0 && i < LABS.length - 1 ? LABS[i + 1] : null;
};
