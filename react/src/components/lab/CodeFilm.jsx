// A code listing styled as a film strip. One line can carry a mark:
//   "fracture" — the line that causes the bug (hatched)
//   "patch"    — the line that fixes it (double rule)
// and a short note rendered directly beneath it.

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "new", "typeof",
  "null", "undefined", "true", "false", "import", "from", "export", "default",
  "async", "await", "throw", "in", "of", "for",
]);

const TONE = {
  comment: "italic text-white/35",
  string: "text-white/60",
  regex: "text-white",
  number: "text-white/70",
  keyword: "text-white",
  func: "text-white",
  plain: "text-white/70",
};

const RE =
  /(\/\/.*)|(\/(?![/*])(?:\\.|\[(?:\\.|[^\]\n])*\]|[^/\n[\\])+\/[gimsuy]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\w.]*)|([A-Za-z_$][\w$]*)|(\s+|.)/g;

function tokenize(line) {
  const out = [];
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(line)) !== null) {
    const [text, comment, regex, string, number, word] = m;
    if (comment) out.push(["comment", text]);
    else if (regex) out.push(["regex", text]);
    else if (string) out.push(["string", text]);
    else if (number) out.push(["number", text]);
    else if (word) {
      if (KEYWORDS.has(word)) out.push(["keyword", word]);
      else if (/^\s*\(/.test(line.slice(RE.lastIndex))) out.push(["func", word]);
      else out.push(["plain", word]);
    } else out.push(["plain", text]);
  }
  return out;
}

const MARK_LABEL = { fracture: "FRACTURE", patch: "PATCH" };
const MARK_CHIP = {
  fracture: "bg-white text-[#050505]",
  patch: "border border-white/60 text-white",
};

// `large` sets every size 2px up (Labs 01 and 03 read larger).
const SIZE = {
  normal: { file: "text-[11px]", chip: "text-[9.5px]", code: "text-[12.5px] sm:text-[13px]", noteChip: "text-[9px]", note: "text-[12.5px]" },
  large: { file: "text-[13px]", chip: "text-[11.5px]", code: "text-[14.5px] sm:text-[15px]", noteChip: "text-[11px]", note: "text-[14.5px]" },
};

export default function CodeFilm({ file, lines, large = false }) {
  const size = SIZE[large ? "large" : "normal"];
  const markAt = lines.findIndex((l) => l.mark);
  const mark = markAt >= 0 ? lines[markAt].mark : null;

  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-[#08080a]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />
            ))}
          </span>
          <span className={`truncate font-mono text-white/55 ${size.file}`}>{file}</span>
        </span>
        {mark && (
          <span className={`shrink-0 rounded-[3px] px-1.5 py-0.5 font-mono tracking-[0.16em] ${size.chip} ${MARK_CHIP[mark]}`}>
            {MARK_LABEL[mark]} · L{markAt + 1}
          </span>
        )}
      </figcaption>

      <pre className={`overflow-x-auto py-3 font-mono leading-6 ${size.code}`}>
        {lines.map((line, i) => (
          <div key={i} className={line.mark ?? undefined}>
            <div className="flex">
              <span className="w-11 shrink-0 select-none pr-4 text-right text-white/25">{i + 1}</span>
              <code className="pr-6">
                {line.code === ""
                  ? " "
                  : tokenize(line.code).map(([tone, text], j) => (
                      <span key={j} className={TONE[tone]}>
                        {text}
                      </span>
                    ))}
              </code>
            </div>
            {line.note && (
              <div className="flex items-start gap-2.5 whitespace-normal pb-2.5 pl-11 pr-6 pt-1">
                <span className={`mt-0.5 shrink-0 rounded-[3px] px-1.5 py-0.5 font-mono tracking-[0.16em] ${size.noteChip} ${MARK_CHIP[line.mark]}`}>
                  ▲ {MARK_LABEL[line.mark]}
                </span>
                <span className={`font-sans leading-5 text-white/75 ${size.note}`}>{line.note}</span>
              </div>
            )}
          </div>
        ))}
      </pre>
    </figure>
  );
}
