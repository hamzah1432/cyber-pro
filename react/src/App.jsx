import { useEffect } from "react";
import { useHashRoute } from "./lib/router.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Lab01DomClobbering from "./labs/Lab01DomClobbering.jsx";
import Lab02Redos from "./labs/Lab02Redos.jsx";
import Lab03PaywallBypass from "./labs/Lab03PaywallBypass.jsx";

// Home is the landing page ("/"); each lab plate opens its sandbox at its own
// hash route. Hash routing keeps deploys static-host safe.
const ROUTES = {
  "/lab/dom-clobbering": Lab01DomClobbering,
  "/lab/redos": Lab02Redos,
  "/lab/paywall-bypass": Lab03PaywallBypass,
};

export default function App() {
  const route = useHashRoute();
  const Page = ROUTES[route] ?? Home;

  useEffect(() => {
    // Lab routes and home jump to the top; bare "#labs"/"#top" anchors on the
    // home page scroll to that section instead.
    if (route === "/" || route.startsWith("/lab")) {
      window.scrollTo({ top: 0 });
    } else {
      const el = document.getElementById(route);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0 });
    }
  }, [route]);

  return (
    <div className="relative min-h-screen text-slate-50">
      <div className="bg-xray pointer-events-none fixed inset-0 -z-10" />
      <div aria-hidden className="xray-beam -z-10">
        <div className="xray-beam-dots" />
      </div>
      <Navbar />
      <Page route={route} />
    </div>
  );
}
