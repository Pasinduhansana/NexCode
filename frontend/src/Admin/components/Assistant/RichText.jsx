import { memo } from "react";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text) {
  const escaped = escapeHtml(text);
  const parts = escaped.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-primary">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const TABLE_SEPARATOR = /^\s*\|?[\s:|-]+\|?\s*$/;
const TABLE_ROW = /^\s*\|.*\|?\s*$/;
const HEADING = /^(#{1,4})\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const cells = parseTableRow(trimmed);
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

function RichText({ text }) {
  const lines = String(text || "").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Markdown table block
    if (TABLE_ROW.test(line)) {
      const tableLines = [];
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      if (tableLines.length >= 2 && isTableSeparator(tableLines[1])) {
        const headers = parseTableRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseTableRow);
        blocks.push(
          <div key={blocks.length} className="my-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="border-b border-border bg-muted/50 px-3 py-1.5 font-semibold text-foreground">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="even:bg-muted/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border-b border-border/60 px-3 py-1.5 text-text_secondary">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
      // Not a table — treat as plain paragraph lines
      blocks.push(
        <p key={blocks.length} className="whitespace-pre-wrap">
          {renderInline(tableLines.join("\n"))}
        </p>
      );
      continue;
    }

    // Heading
    const heading = line.match(HEADING);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      const Tag = `h${Math.min(level + 2, 5)}`;
      const size = level === 1 ? "text-base" : level === 2 ? "text-sm" : "text-sm";
      blocks.push(
        <Tag key={blocks.length} className={`${size} mt-2 mb-1 font-semibold text-foreground`}>
          {renderInline(heading[2])}
        </Tag>
      );
      i += 1;
      continue;
    }

    // Bullet list
    if (BULLET.test(line)) {
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(BULLET);
        if (!m) break;
        items.push(renderInline(m[1]));
        i += 1;
      }
      blocks.push(
        <ul key={blocks.length} className="my-1.5 list-disc space-y-0.5 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty / horizontal rule
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      i += 1;
      continue;
    }

    blocks.push(
      <p key={blocks.length} className="whitespace-pre-wrap">
        {renderInline(line)}
      </p>
    );
    i += 1;
  }

  return <div className="space-y-1">{blocks}</div>;
}

export default memo(RichText);