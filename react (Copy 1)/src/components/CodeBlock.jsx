// Lightweight, dependency-free syntax highlighting for the short JS snippets
// shown in "The line" and "The fix" sections. Lines may be flagged
// hl: "red" | "green" with an optional `note` annotation rendered beneath.

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "new", "typeof",
  "null", "undefined", "true", "false", "import", "from", "export", "default",
  "class", "extends", "async", "await", "throw", "in", "of", "for",
]);

const TOKEN_STYLES = {
  comment: "text-slate-500 italic",
  string: "text-amber-300/90",
  number: "text-orange-300",
  keyword: "text-violet-400",
  func: "text-sky-400",
  plain: "text-slate-300",
};

function tokenize(line) {
  const re =
    /(\/\/.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\w.]*)|([A-Za-z_$][\w$]*)|(\s+|.)/g;
  const tokens = [];
  let match;
  while ((match = re.exec(line)) !== null) {
    const [text, comment, string, number, word] = match;
    if (comment) tokens.push(["comment", comment]);
    else if (string) tokens.push(["string", string]);
    else if (number) tokens.push(["number", text]);
    else if (word) {
      if (KEYWORDS.has(word)) tokens.push(["keyword", word]);
      else if (/^\s*\(/.test(line.slice(re.lastIndex))) tokens.push(["func", word]);
      else tokens.push(["plain", word]);
    } else tokens.push(["plain", text]);
  }
  return tokens;
}

const HL_STYLES = {
  red: "border-l-2 border-red-500 bg-red-500/15",
  green: "border-l-2 border-emerald-500 bg-emerald-500/15",
};

export default function CodeBlock({ title, lines }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80">
      <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="ml-2 font-mono text-xs text-slate-400">{title}</span>
      </div>

      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-6">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${HL_STYLES[line.hl] ?? "border-l-2 border-transparent"}`}
          >
            <div className="flex">
              <span className="w-10 shrink-0 select-none pr-3 text-right text-slate-600">
                {i + 1}
              </span>
              <span className="pr-4">
                {tokenize(line.code).map(([type, text], j) => (
                  <span key={j} className={TOKEN_STYLES[type]}>
                    {text}
                  </span>
                ))}
                {line.code === "" && " "}
              </span>
            </div>
            {line.note && (
              <div
                className={`pb-1 pl-10 text-xs ${
                  line.hl === "green" ? "text-emerald-400/90" : "text-red-400/90"
                }`}
              >
                ▲ {line.note}
              </div>
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}
