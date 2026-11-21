// The shared HTML editor: the composer's Rich HTML box and the Workbench
// editor are two views of the same bytes (state.editorText).
import { state, useStore } from "../store.js";
import { LIMITS } from "../safe-html.js";
import { setEditorText } from "../actions.js";

export function Editor({ id, className, rows, placeholder }) {
  const s = useStore();
  return (
    <textarea
      id={id}
      className={className}
      rows={rows}
      spellCheck={false}
      placeholder={placeholder}
      value={s.editorText}
      onChange={(e) => {
        state.presetKey = null;
        setEditorText(e.target.value);
      }}
      data-editor
    />
  );
}

export function EditorCount() {
  const { editorText } = useStore();
  return (
    <span data-over={String(editorText.length > LIMITS.maxSource)}>
      {editorText.length} / {LIMITS.maxSource}
    </span>
  );
}

export function Feedback({ dark }) {
  const { feedback } = useStore();
  if (!feedback.lines.length) return null;
  return (
    <div className={"feedback" + (dark ? " feedback--dark" : "")} data-kind={feedback.kind}>
      {feedback.lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}
