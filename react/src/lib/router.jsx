import { useEffect, useState } from "react";

// Minimal hash-based routing: zero dependencies, shareable URLs, and no 404s
// on refresh when deployed to static hosts (GitHub Pages / Vercel).
const readHash = () => window.location.hash.replace(/^#/, "") || "/";

export function useHashRoute() {
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const onHashChange = () => setRoute(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}
