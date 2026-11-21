import { useEffect } from "react";
import { useHashRoute } from "./lib/router.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Lab01DomClobbering from "./labs/Lab01DomClobbering.jsx";
import Lab02PostMessage from "./labs/Lab02PostMessage.jsx";
import Lab03Tabnabbing from "./labs/Lab03Tabnabbing.jsx";

// Home is the landing page ("/"); each lab card opens its real interactive
// sandbox at its own hash route. Hash routing keeps deploys static-host safe.
const ROUTES = {
  "/lab/dom-clobbering": Lab01DomClobbering,
  "/lab/postmessage": Lab02PostMessage,
  "/lab/tabnabbing": Lab03Tabnabbing,
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
      <Navbar />
      <Page />
    </div>
  );
}
