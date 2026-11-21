import { Braces, Regex, LockKeyhole } from "lucide-react";

export const LABS = [
  {
    id: "lab01",
    num: "01",
    path: "/lab/dom-clobbering",
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
    title: "ReDoS",
    subtitle: "Regular Expression Denial of Service — one crafted string freezes the tab.",
    summary: "One crafted string sends a backtracking regex into exponential work and freezes the tab.",
    klass: "DENIAL OF SERVICE",
    owaspCode: null,
    owaspName: "Denial of Service",
    cwe: "CWE-1333",
    icon: Regex,
  },
  {
    id: "lab03",
    num: "03",
    path: "/lab/paywall-bypass",
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

export const nextLabOf = (id) => {
  const i = LABS.findIndex((l) => l.id === id);
  return i >= 0 && i < LABS.length - 1 ? LABS[i + 1] : null;
};
