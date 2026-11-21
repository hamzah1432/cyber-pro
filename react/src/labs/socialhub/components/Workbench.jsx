// The Security Workbench: mode switch, tabs, and the Mission / Editor /
// Inspector / Source / Results panels.
import { useLayoutEffect, useState } from "react";
import guidelinesSource from "../guidelines.js?raw";
import { useStore } from "../store.js";
import { probe, verdict, liveEffectLabel } from "../inspector.js";
import { TRUSTED_VIEW } from "../views.js";
import {
  closeWorkbench,
  selectTab,
  setMode,
  loadPreset,
  clearEditor,
  publishRich,
  pressGuidelines,
  fullReset,
  revealHint,
  setCodeView,
} from "../actions.js";
import { Seg } from "./ui.jsx";
import { Editor, EditorCount, Feedback } from "./Editor.jsx";

const TABS = [
  ["mission", "Mission"],
  ["editor", "Editor"],
  ["inspector", "Inspector"],
  ["source", "Source"],
  ["results", "Results"],
];

const MODES = [
  ["vulnerable", "Vulnerable"],
  ["fixed", "Fixed"],
];

const HINTS = [
  "Press Guidelines and note where you land.",
  <>
    In the Inspector, compare <code>window.guidelinesLink</code> before and after publishing.
  </>,
  <>
    Which HTML attribute makes an element reachable from <code>window</code>?
  </>,
];

const PRESET_BUTTONS = [
  ["1", "1 · Collide"],
  ["2", "2 · Alternate"],
  ["3", "3 · Control"],
];

// The Source tab shows the handler exactly as written in guidelines.js.
function runningSource(which) {
  const name = which === "fixed" ? "openGuidelinesFixed" : "openGuidelinesVulnerable";
  const start = guidelinesSource.indexOf(`export function ${name}(`);
  const end = guidelinesSource.indexOf("\n}", start) + 2;
  return guidelinesSource.slice(start, end).replace(/^export /, "");
}

const FLAW_LINE = { fixed: /showLocalView\(TRUSTED_VIEW\)/, vulnerable: /=\s*window\.guidelinesLink/ };

function Rows({ rows }) {
  return (
    <dl className="insp">
      {rows.map(([term, value, hit]) => (
        <div key={term} data-insp-row={hit === undefined ? undefined : "identity"} data-hit={hit === undefined ? undefined : String(hit)}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function tabKeydown(e) {
  const keys = TABS.map(([k]) => k);
  const i = keys.indexOf(e.target.dataset.tab);
  if (i < 0) return;
  const next = { ArrowRight: (i + 1) % keys.length, ArrowLeft: (i - 1 + keys.length) % keys.length, Home: 0, End: keys.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  selectTab(keys[next]);
}

export default function Workbench() {
  const s = useStore();

  // Live DOM: probe after every commit, so the values describe the page as it is now.
  const [p, setP] = useState(probe);
  useLayoutEffect(() => {
    const next = probe();
    setP((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  });

  const run = s.lastRun;
  const v = verdict();
  const lines = runningSource(s.codeView).split("\n");
  const flaw = lines.findIndex((l) => FLAW_LINE[s.codeView].test(l));
  const panel = (name) => ({ role: "tabpanel", id: `wb-p-${name}`, "aria-labelledby": `wb-t-${name}`, hidden: s.tab !== name });

  return (
    <aside className="workbench" id="workbench-panel" data-workbench aria-label="Security Workbench" hidden={!s.wbOpen}>
      <header className="wb-head">
        <h2 className="wb-title">Security Workbench</h2>
        <Seg dark label="Implementation mode" value={s.mode} onChange={setMode} options={MODES} />
        <button type="button" className="wb-close" onClick={closeWorkbench} aria-label="Close Workbench">
          ×
        </button>
      </header>

      <div className="wb-tabs" role="tablist" aria-label="Workbench sections" onKeyDown={tabKeydown}>
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`wb-t-${key}`}
            data-tab={key}
            aria-selected={s.tab === key}
            aria-controls={`wb-p-${key}`}
            tabIndex={s.tab === key ? 0 : -1}
            onClick={() => selectTab(key, false)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="wb-body">
        <section {...panel("mission")}>
          <p>
            <strong>Mission.</strong> Make the Guidelines button open a view the app never meant to choose. Use only a
            post. No script is allowed.
          </p>
          <ol className="hints">
            {HINTS.map((hint, i) => (
              <li key={i} hidden={i >= s.hintsShown}>
                {hint}
              </li>
            ))}
          </ol>
          <button type="button" className="wb-btn" onClick={revealHint} disabled={s.hintsShown >= HINTS.length}>
            {s.hintsShown >= HINTS.length ? "All hints shown" : `Show hint ${s.hintsShown + 1}`}
          </button>
          <h3>Why it matters</h3>
          <p>
            The app treated a user-created element as trusted navigation configuration, so a post steered the
            Guidelines button to an unintended local view. In 2019, researcher Michał Bentkowski used the same idea,
            an allowed <code>id</code> attribute, to run script through Gmail’s AMP4Email validator; Google patched it.
            Removing script tags alone is not enough.
          </p>
        </section>

        <section {...panel("editor")}>
          <label className="wb-label" htmlFor="wb-editor">
            HTML source
          </label>
          <Editor id="wb-editor" className="wb-editor" rows={5} />
          <p className="wb-meta">
            <EditorCount />
          </p>
          <div className="presets" role="group" aria-label="Payload presets">
            {PRESET_BUTTONS.map(([key, label]) => (
              <button key={key} type="button" className="wb-btn" aria-pressed={s.presetKey === key} onClick={() => loadPreset(key)}>
                {label}
              </button>
            ))}
          </div>
          <Feedback dark />
          <div className="wb-actions">
            <button type="button" className="wb-btn wb-btn--primary" onClick={publishRich}>
              Publish to feed
            </button>
            <button type="button" className="wb-btn" onClick={(e) => pressGuidelines(e.currentTarget)}>
              Press Guidelines
            </button>
            <button type="button" className="wb-btn wb-btn--quiet" onClick={clearEditor}>
              Clear editor
            </button>
          </div>
        </section>

        <section {...panel("inspector")}>
          <h3>Live DOM</h3>
          <Rows
            rows={[
              ["mode", s.mode],
              ["injected element exists", p.injectedExists ? "yes" : "no"],
              ["elements with id=guidelinesLink", String(p.candidates)],
              ["typeof window.guidelinesLink", p.type],
              ["value", p.kind],
              ["own property", p.ownProperty ? "yes" : "no (named access)"],
              ["is Element", p.isElement ? "yes" : "no"],
              ["tagName", p.tagName || "—"],
              ["=== injected anchor", p.injectedExists ? String(p.identity) : "—", p.identity],
              ["anchor href", p.href === null ? "—" : p.href],
            ]}
          />
          <h3>Last Guidelines press</h3>
          <Rows
            rows={[
              ["trusted destination", TRUSTED_VIEW],
              ["chosen destination", run ? run.destination : "—"],
              ["effect", run ? run.effect.label : liveEffectLabel(p)],
            ]}
          />
        </section>

        <section {...panel("source")}>
          <div className="code-head">
            <Seg dark label="Source version" value={s.codeView} onChange={setCodeView} options={MODES} />
            <span className="code-meta">
              {s.mode === s.codeView && <span className="code-running">running</span>}
              <span>{lines.length} lines</span>
            </span>
          </div>
          <ol className="code">
            {lines.map((text, i) => (
              <li key={i} className={i === flaw ? "is-flaw-" + s.codeView : undefined}>
                <code>{text || " "}</code>
              </li>
            ))}
          </ol>
          <p className="code-note">
            {s.codeView === "fixed"
              ? `Line ${flaw + 1} uses a constant. window is never consulted, so the same post cannot steer the button.`
              : `Line ${flaw + 1} reads window.guidelinesLink. A post can create that element, and the app then trusts its href.`}
          </p>
          <p>
            Replay: switch to Fixed, publish the same payload, press Guidelines. The anchor still exists, but the handler
            never reads it.
          </p>
        </section>

        <section {...panel("results")}>
          <dl className="compare">
            <div>
              <dt>Expected</dt>
              <dd>{TRUSTED_VIEW}</dd>
            </div>
            <div>
              <dt>Observed</dt>
              <dd>{run ? run.destination : "—"}</dd>
            </div>
            <div>
              <dt>Verdict</dt>
              <dd>
                <span className="verdict" data-state={v.code}>
                  {v.label}
                </span>
              </dd>
            </div>
          </dl>
          <h3>Events</h3>
          {s.history.length === 0 ? (
            <p className="wb-meta">No events yet.</p>
          ) : (
            <ol className="history">
              {s.history
                .slice()
                .reverse()
                .map((h, i) => (
                  <li key={s.history.length - i} data-kind={h.kind}>
                    <time>{h.time}</time>
                    <span className="hist-kind">{h.kind}</span>
                    <span>{h.text}</span>
                  </li>
                ))}
            </ol>
          )}
        </section>
      </div>

      <footer className="wb-foot">
        <button type="button" className="wb-btn wb-btn--danger" onClick={fullReset}>
          Reset environment
        </button>
      </footer>
    </aside>
  );
}
