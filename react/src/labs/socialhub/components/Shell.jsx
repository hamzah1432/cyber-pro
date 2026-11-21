// Page chrome around the SocialHub app: lab intro, header, navigation,
// context aside and sources.
import { state, useStore } from "../store.js";
import { isGuidelinesView } from "../views.js";
import { openGuidelines } from "../guidelines.js";
import { nav, setQuery, filterCommunity, searchTag, toggleWorkbench } from "../actions.js";
import { Icon, Wordmark } from "./ui.jsx";

export function WorkbenchToggle({ className, children }) {
  const { wbOpen } = useStore();
  return (
    <button
      type="button"
      className={className}
      data-action="wb-toggle"
      aria-expanded={wbOpen}
      aria-controls="workbench-panel"
      onClick={toggleWorkbench}
    >
      {children}
    </button>
  );
}

export function LabIntro() {
  const { mode } = useStore();
  return (
    <section className="lab-intro" aria-labelledby="lab-title">
      <div className="lab-intro__text">
        <a className="lab-back" href="#labs">
          ← LIGHT-BOX
        </a>
        <p className="lab-kicker">
          PLATE 01 <span className="mode-pill">{mode === "fixed" ? "Fixed" : "Vulnerable"}</span>
        </p>
        <h1 id="lab-title">What is DOM Clobbering?</h1>
        <p>
          DOM Clobbering occurs when attacker-controlled HTML elements interfere with properties that JavaScript
          expects to be trusted. Browsers can expose certain named elements through objects such as{" "}
          <code>window</code>. If application code trusts those properties, an attacker may influence its behavior
          without supplying JavaScript.
        </p>
        <p className="lab-intro__tax">
          <span>
            <strong>CWE-20</strong> Improper Input Validation
          </span>
          <span>
            <strong>OWASP A05:2025</strong> Injection (A03:2021), closest category
          </span>
        </p>
      </div>
      <WorkbenchToggle className="btn btn--primary">Security Workbench</WorkbenchToggle>
    </section>
  );
}

export function Header() {
  const s = useStore();
  return (
    <header className="sh-header">
      <div className="sh-brand">
        <Wordmark />
        <span className="sh-brand__name">socialhub</span>
      </div>
      <form className="sh-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="sr-only" htmlFor="sh-search-input">
          Search posts, people and tags
        </label>
        <Icon name="search" />
        <input
          id="sh-search-input"
          type="search"
          placeholder="Search posts, people, #tags"
          autoComplete="off"
          value={s.query}
          onChange={(e) => setQuery(e.target.value)}
          data-search
        />
      </form>
      <nav className="sh-actions" aria-label="Quick actions">
        <button type="button" className="hdr-btn" onClick={() => nav("feed")} aria-label="Home">
          <Icon name="home" />
          <span>Home</span>
        </button>
        <button type="button" className="hdr-btn" data-guidelines-btn onClick={openGuidelines} aria-label="Community Guidelines">
          <Icon name="shield" />
          <span>Guidelines</span>
        </button>
        <button type="button" className="hdr-btn" onClick={() => nav("profile")} aria-label="My profile">
          <span className="avatar avatar--small" data-tone="1" aria-hidden="true">
            SR
          </span>
          <span>Profile</span>
        </button>
        <WorkbenchToggle className="hdr-btn hdr-btn--lab">
          <Icon name="code" />
          <span>Workbench</span>
        </WorkbenchToggle>
      </nav>
    </header>
  );
}

const NAV = [
  ["feed", "Feed"],
  ["profile", "My profile"],
  ["saved", "Saved posts"],
  ["communities", "Communities"],
  ["community-guidelines", "Community Guidelines"],
];

export function SideNav() {
  const s = useStore();
  const current = isGuidelinesView(s.route) ? "community-guidelines" : s.route;
  return (
    <nav className="sh-nav" aria-label="SocialHub sections">
      {NAV.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className="nav-item"
          aria-current={current === key ? "page" : undefined}
          onClick={() => nav(key)}
        >
          {label}
          {key === "saved" && <span className="nav-item__n">{s.saved.size || ""}</span>}
        </button>
      ))}
    </nav>
  );
}

function trendingTags() {
  const counts = new Map();
  state.posts.forEach((p) => {
    (p.searchText.match(/#[\p{L}\p{N}_]+/gu) || []).forEach((t) => {
      const k = t.toLowerCase();
      counts.set(k, (counts.get(k) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6);
}

export function Aside() {
  const s = useStore();
  return (
    <aside className="sh-aside" aria-label="Context">
      <section className="card aside-card">
        <h2 className="aside-title">Communities</h2>
        <div className="chips">
          {s.communities.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip chip--soft"
              aria-pressed={s.community === c.id}
              onClick={() => filterCommunity(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>
      <section className="card aside-card">
        <h2 className="aside-title">Trending tags</h2>
        <ul className="tag-list">
          {trendingTags().map(([tag, n]) => (
            <li key={tag}>
              <button type="button" className="tag-row" onClick={() => searchTag(tag)}>
                <span>{tag}</span>
                <span className="tag-row__n">{n}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="card aside-card aside-card--lab">
        <h2 className="aside-title">Challenge</h2>
        <p>Change what Guidelines opens, using only a post.</p>
        <WorkbenchToggle className="btn btn--secondary btn--small">Open Workbench</WorkbenchToggle>
      </section>
    </aside>
  );
}

const SOURCES = [
  ["PortSwigger: DOM clobbering", "https://portswigger.net/web-security/dom-based/dom-clobbering"],
  ["OWASP: DOM Clobbering Prevention", "https://cheatsheetseries.owasp.org/cheatsheets/DOM_Clobbering_Prevention_Cheat_Sheet.html"],
  ["MDN: Window", "https://developer.mozilla.org/en-US/docs/Web/API/Window"],
  ["Securitum: AMP4Email", "https://research.securitum.com/xss-in-amp4email-dom-clobbering/"],
];

export function Sources() {
  return (
    <footer className="lab-sources">
      <h2>Sources</h2>
      <ul>
        {SOURCES.map(([label, href]) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
