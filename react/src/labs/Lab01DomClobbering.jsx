import { useEffect, useState } from "react";
import "./socialhub/socialhub.css";
import { state, useStore, initStore, releaseImages, notify, WIDE } from "./socialhub/store.js";
import { closeWorkbench } from "./socialhub/actions.js";
import { LabIntro, Header, SideNav, Aside, Sources } from "./socialhub/components/Shell.jsx";
import MainViews from "./socialhub/components/Views.jsx";
import Workbench from "./socialhub/components/Workbench.jsx";

function Toast() {
  const { toast } = useStore();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast.n) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [toast.n]);
  return (
    <div className={"toast" + (visible ? " is-visible" : "")} role="status" aria-live="polite">
      {toast.text}
    </div>
  );
}

function onKeyDown(e) {
  if (e.key !== "Escape") return;
  if (e.target.matches("[data-search]") && state.query) {
    state.query = "";
    notify();
  } else if (state.wbOpen && e.target.closest("[data-workbench]") && !window.matchMedia(WIDE).matches) {
    closeWorkbench();
  }
}

export default function Lab01DomClobbering() {
  useState(initStore); // a fresh lab on every visit
  const s = useStore();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "DOM Clobbering Lab · SocialHub · GHURIR";
    return () => {
      document.title = previousTitle;
      releaseImages();
    };
  }, []);

  return (
    <div className={"socialhub" + (s.wbOpen ? " wb-open" : "")} data-mode={s.mode} onKeyDown={onKeyDown}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content").focus();
        }}
      >
        Skip to content
      </a>

      <LabIntro />

      <div className="app">
        <Header />
        <div className="sh-body">
          <SideNav />
          <main className="sh-main" id="main-content" tabIndex={-1}>
            <MainViews />
          </main>
          <Aside />
        </div>
      </div>

      <Sources />
      <Workbench />
      <Toast />
    </div>
  );
}
