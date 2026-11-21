import { Braces, Regex, LockKeyhole } from "lucide-react";

// Single source of truth for lab identity — used by the Home light-box plates,
// lab page headers and the "Next Lab" footer buttons.
export const LABS = [
  {
    id: "lab01",
    num: "01",
    path: "/lab/dom-clobbering",
    navLabel: "Lab 01: DOM Clobbering",
    title: "DOM Clobbering",
    subtitle: "When innocent-looking HTML overwrites the globals your script trusts.",
    summary: "A harmless-looking <a id> in user HTML overwrites the global your script trusts.",
    klass: "HTML INJECTION",
    owasp: "OWASP A03: Injection",
    owaspCode: "A03:2021",
    owaspName: "Injection",
    cwe: "CWE-79",
    icon: Braces,
    challenge: true,
  },
  {
    id: "lab02",
    num: "02",
    path: "/lab/redos",
    navLabel: "Lab 02: ReDoS",
    title: "ReDoS",
    subtitle: "Regular Expression Denial of Service — one crafted string freezes the tab.",
    summary: "One crafted string sends a backtracking regex into exponential work and freezes the tab.",
    klass: "DENIAL OF SERVICE",
    // CWE-1333 has no OWASP Top 10 mapping; OWASP files ReDoS under Denial of Service.
    owaspCode: null,
    owaspName: "Denial of Service",
    cwe: "CWE-1333",
    icon: Regex,
  },
  {
    id: "lab03",
    num: "03",
    path: "/lab/paywall-bypass",
    navLabel: "Lab 03: Client-Side Paywall Bypass",
    title: "Client-Side Paywall Bypass",
    subtitle: "The premium content was in the page all along.",
    summary: "The premium article is already in the page — only CSS and a client-side flag hide it.",
    klass: "ACCESS CONTROL",
    owasp: "OWASP A04: Insecure Design",
    owaspCode: "A04:2021",
    owaspName: "Insecure Design",
    cwe: "CWE-602",
    icon: LockKeyhole,
  },
];

export const labByPath = (path) => LABS.find((l) => l.path === path);

export const nextLabOf = (id) => {
  const i = LABS.findIndex((l) => l.id === id);
  return i >= 0 && i < LABS.length - 1 ? LABS[i + 1] : null;
};
