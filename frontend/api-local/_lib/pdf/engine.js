// Minimal dependency-free PDF writer for Node serverless runtimes.
//
// Implements a PDFKit-style drawing API over the PDF 1.4 object model using
// the 14 standard fonts (Helvetica family). Because those fonts are always
// available to PDF viewers, no font files need to be embedded and no external
// package is required. Output is valid, selectable-text PDF (A4 by default).
//
// Coordinate system: top-left origin, y grows downwards (CSS-like), points.

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  A5: { width: 419.53, height: 595.28 },
  LETTER: { width: 612.0, height: 792.0 },
};

// Helvetica width table in 1/1000 em units for chars 32..126 (AFM data).
const HELVETICA_WIDTHS = {
  32: 278, 33: 278, 34: 355, 35: 556, 36: 556, 37: 889, 38: 667, 39: 191,
  40: 333, 41: 333, 42: 389, 43: 584, 44: 278, 45: 333, 46: 278, 47: 278,
  48: 556, 49: 556, 50: 556, 51: 556, 52: 556, 53: 556, 54: 556, 55: 556,
  56: 556, 57: 556, 58: 278, 59: 278, 60: 584, 61: 584, 62: 584, 63: 556,
  64: 1015, 65: 667, 66: 667, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778,
  72: 722, 73: 278, 74: 500, 75: 667, 76: 556, 77: 833, 78: 722, 79: 778,
  80: 667, 81: 778, 82: 722, 83: 667, 84: 611, 85: 722, 86: 667, 87: 944,
  88: 667, 89: 667, 90: 611, 91: 278, 92: 278, 93: 278, 94: 469, 95: 556,
  96: 333, 97: 556, 98: 556, 99: 500, 100: 556, 101: 556, 102: 278, 103: 556,
  104: 556, 105: 222, 106: 222, 107: 500, 108: 222, 109: 833, 110: 556, 111: 556,
  112: 556, 113: 556, 114: 333, 115: 500, 116: 278, 117: 556, 118: 500, 119: 722,
  120: 500, 121: 500, 122: 500, 123: 334, 124: 260, 125: 334, 126: 584,
};

const FONT_FAMILIES = {
  Helvetica: "Helvetica",
  "Helvetica-Bold": "Helvetica-Bold",
  "Helvetica-Oblique": "Helvetica-Oblique",
  "Helvetica-BoldOblique": "Helvetica-BoldOblique",
};

const FONT_ASCENT = 0.718;
const DEFAULT_LINE_GAP = 1.15;

// Map common Unicode typographic characters to their WinAnsiEncoding bytes so
// they render correctly with the standard fonts (the stream is written as
// latin1 bytes, so these are single bytes 0x80..0x9F / 0xA0..0xFF).
const WIN_ANSI_MAP = {
  8211: "\x96", // en dash
  8212: "\x97", // em dash
  8216: "\x91", // left single quote
  8217: "\x92", // right single quote
  8220: "\x93", // left double quote
  8221: "\x94", // right double quote
  8226: "\x95", // bullet
  8230: "\x85", // ellipsis
  8224: "\x86", // dagger
  8225: "\x87", // double dagger
  8240: "\x89", // per mille
  8364: "\x80", // euro
  8482: "\x99", // trademark
  8800: "\xA0", // not equal
  8730: "\xD6", // square root
  8776: "\xB1", // approx
};

function toPdfText(value) {
  const str = String(value ?? "");
  let out = "";
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code === 40 || code === 41 || code === 92) {
      out += `\\${ch}`;
    } else if (code === 10 || code === 13 || code === 9) {
      out += " ";
    } else if (WIN_ANSI_MAP[code]) {
      out += WIN_ANSI_MAP[code];
    } else if (code >= 32 && code <= 126) {
      out += ch;
    } else if (code >= 160 && code <= 255) {
      out += ch;
    } else {
      out += "?";
    }
  }
  return out;
}

function charWidth(ch, size) {
  const code = ch.codePointAt(0);
  const units = HELVETICA_WIDTHS[code] || 556;
  return (units / 1000) * size;
}

function measureText(str, size) {
  let total = 0;
  for (const ch of String(str ?? "")) total += charWidth(ch, size);
  return total;
}

function wrapText(text, maxWidth, size) {
  const input = String(text ?? "");
  const words = input.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  let currentWidth = 0;

  for (const word of words) {
    const wordWidth = measureText(word, size);
    const spaceWidth = current ? measureText(" ", size) : 0;
    if (current && currentWidth + spaceWidth + wordWidth > maxWidth) {
      lines.push(current);
      current = word;
      currentWidth = wordWidth;
    } else {
      current = current ? `${current} ${word}` : word;
      currentWidth += spaceWidth + wordWidth;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function rgbFromHex(hex) {
  let value = String(hex || "").trim().replace(/^#/, "");
  if (value.length === 3) value = value.split("").map((c) => c + c).join("");
  const num = parseInt(value, 16);
  if (Number.isNaN(num) || value.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function pad10(num) {
  return String(num).padStart(10, "0");
}

class PDFFontRegistry {
  constructor() {
    this.fonts = [];
    this.byFamily = new Map();
  }

  add(family) {
    const key = FONT_FAMILIES[family] ? family : "Helvetica";
    if (this.byFamily.has(key)) return this.byFamily.get(key);
    const index = this.fonts.length + 1;
    const font = { key, index, baseFont: FONT_FAMILIES[key] };
    this.fonts.push(font);
    this.byFamily.set(key, font);
    return font;
  }
}

export class PDFDocument {
  constructor(options = {}) {
    const sizeKey = options.size || "A4";
    const pageSize = PAGE_SIZES[sizeKey] || PAGE_SIZES.A4;
    this.pageWidth = pageSize.width;
    this.pageHeight = pageSize.height;
    const margins = options.margins || {};
    this.margin = {
      top: margins.top ?? 48,
      right: margins.right ?? 48,
      bottom: margins.bottom ?? 48,
      left: margins.left ?? 48,
    };
    this.fontRegistry = new PDFFontRegistry();
    this.pages = [];
    this.cur = null;
    this.curFont = "Helvetica";
    this.curFontSize = 11;
    this.curFill = { r: 0, g: 0, b: 0 };
    this.curStroke = { r: 0, g: 0, b: 0 };
    this.curLineWidth = 1;
    this.addPage();
  }

  get width() {
    return this.pageWidth;
  }

  get height() {
    return this.pageHeight;
  }

  get pageCount() {
    return this.pages.length;
  }

  addPage() {
    this.cur = { ops: [], fonts: new Set() };
    this.pages.push(this.cur);
    return this;
  }

  switchToLastPage() {
    if (this.pages.length > 0) this.cur = this.pages[this.pages.length - 1];
    return this;
  }

  _push(op) {
    this.cur.ops.push(op);
  }

  font(family, size) {
    this.curFont = FONT_FAMILIES[family] ? family : "Helvetica";
    if (size !== undefined) this.curFontSize = size;
    return this;
  }

  fontSize(size) {
    this.curFontSize = size;
    return this;
  }

  fillColor(color) {
    const { r, g, b } = typeof color === "string" ? rgbFromHex(color) : color || { r: 0, g: 0, b: 0 };
    this.curFill = { r, g, b };
    return this;
  }

  strokeColor(color) {
    const { r, g, b } = typeof color === "string" ? rgbFromHex(color) : color || { r: 0, g: 0, b: 0 };
    this.curStroke = { r, g, b };
    return this;
  }

  lineWidth(width) {
    this.curLineWidth = width;
    return this;
  }

  measureWidth(text, size = this.curFontSize) {
    return measureText(text, size);
  }

  wrapText(text, maxWidth, size = this.curFontSize) {
    return wrapText(text, maxWidth, size);
  }

  textHeightOfString(text, maxWidth, size = this.curFontSize) {
    const lines = wrapText(text, maxWidth, size);
    return lines.length * size * DEFAULT_LINE_GAP;
  }

  _pdfBaseline(y, size) {
    return this.pageHeight - (y + FONT_ASCENT * size);
  }

  text(text, x, y, options = {}) {
    const family = options.family || this.curFont;
    const size = options.size || this.curFontSize;
    const maxWidth = options.width ?? this.pageWidth - this.margin.left - this.margin.right;
    const align = options.align || "left";
    const lineGap = options.lineGap || DEFAULT_LINE_GAP;
    const font = this.fontRegistry.add(family);
    this.cur.fonts.add(font.key);

    let colorOp = "";
    if (options.color) {
      const { r, g, b } = typeof options.color === "string" ? rgbFromHex(options.color) : options.color;
      colorOp = `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg `;
    }

    const lines = wrapText(String(text ?? ""), maxWidth, size);
    const lineHeight = size * lineGap;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineWidth = measureText(line, size);
      let tx = x;
      if (align === "center") tx = x + (maxWidth - lineWidth) / 2;
      else if (align === "right") tx = x + maxWidth - lineWidth;
      else if (align === "justify" && i < lines.length - 1 && line.includes(" ")) {
        const words = line.split(" ");
        const wordsWidth = words.reduce((sum, w) => sum + measureText(w, size), 0);
        const gaps = words.length - 1;
        const extra = (maxWidth - wordsWidth) / gaps;
        tx = x;
        let offset = x;
        const parts = [];
        for (let w = 0; w < words.length; w++) {
          const word = words[w];
          parts.push(`${offset.toFixed(2)} 0 Td (${toPdfText(word)}) Tj`);
          offset += measureText(word, size) + extra;
        }
        const baseline = this._pdfBaseline(y + i * lineHeight, size);
        const fontTag = `BT /F${font.index} ${size} Tf ${colorOp}1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm ${parts.join(" ")} ET`;
        this._push(fontTag);
        continue;
      }

      const baseline = this._pdfBaseline(y + i * lineHeight, size);
      const op = `BT /F${font.index} ${size} Tf ${colorOp}1 0 0 1 ${tx.toFixed(2)} ${baseline.toFixed(2)} Tm (${toPdfText(line)}) Tj ET`;
      this._push(op);
    }

    return lines.length * lineHeight;
  }

  rect(x, y, w, h, options = {}) {
    const pdfX = x;
    const pdfY = this.pageHeight - y - h;
    let op = "";
    if (options.radius) {
      op = `${this._roundedRectPath(x, y, w, h, options.radius)} `;
    } else {
      op = `${pdfX.toFixed(2)} ${pdfY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re `;
    }
    if (options.fill) {
      const { r, g, b } = typeof options.fill === "string" ? rgbFromHex(options.fill) : this.curFill;
      op += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg f`;
    }
    if (options.stroke) {
      const { r, g, b } = typeof options.stroke === "string" ? rgbFromHex(options.stroke) : this.curStroke;
      op += `${options.fill ? " " : ""}${this.curLineWidth.toFixed(2)} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG S`;
    }
    this._push(op);
    return this;
  }

  _roundedRectPath(x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    const k = rad * 0.5523;
    const X = x;
    const Y = this.pageHeight - y - h;
    const W = w;
    const H = h;
    const p = [];
    p.push(`${(X + rad).toFixed(2)} ${Y.toFixed(2)} m`);
    p.push(`${(X + W - rad).toFixed(2)} ${Y.toFixed(2)} l`);
    p.push(`${(X + W - rad + k).toFixed(2)} ${Y.toFixed(2)} ${(X + W).toFixed(2)} ${(Y + rad - k).toFixed(2)} ${(X + W).toFixed(2)} ${(Y + rad).toFixed(2)} c`);
    p.push(`${(X + W).toFixed(2)} ${(Y + H - rad).toFixed(2)} l`);
    p.push(`${(X + W).toFixed(2)} ${(Y + H - rad + k).toFixed(2)} ${(X + W - rad + k).toFixed(2)} ${(Y + H).toFixed(2)} ${(X + W - rad).toFixed(2)} ${(Y + H).toFixed(2)} c`);
    p.push(`${(X + rad).toFixed(2)} ${(Y + H).toFixed(2)} l`);
    p.push(`${(X + rad - k).toFixed(2)} ${(Y + H).toFixed(2)} ${X.toFixed(2)} ${(Y + H - rad + k).toFixed(2)} ${X.toFixed(2)} ${(Y + H - rad).toFixed(2)} c`);
    p.push(`${X.toFixed(2)} ${(Y + rad).toFixed(2)} l`);
    p.push(`${X.toFixed(2)} ${(Y + rad - k).toFixed(2)} ${(X + rad - k).toFixed(2)} ${Y.toFixed(2)} ${(X + rad).toFixed(2)} ${Y.toFixed(2)} c`);
    p.push("h");
    return p.join(" ");
  }

  line(x1, y1, x2, y2, options = {}) {
    const p1 = this.pageHeight - y1;
    const p2 = this.pageHeight - y2;
    let op = `${x1.toFixed(2)} ${p1.toFixed(2)} m ${x2.toFixed(2)} ${p2.toFixed(2)} l`;
    if (options.stroke) {
      const { r, g, b } = typeof options.stroke === "string" ? rgbFromHex(options.stroke) : this.curStroke;
      op += ` ${(options.width || this.curLineWidth).toFixed(2)} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG S`;
    } else {
      op += ` ${this.curLineWidth.toFixed(2)} w S`;
    }
    this._push(op);
    return this;
  }

  moveTo(x, y) {
    const py = this.pageHeight - y;
    this._push(`${x.toFixed(2)} ${py.toFixed(2)} m`);
    return this;
  }

  lineTo(x, y) {
    const py = this.pageHeight - y;
    this._push(`${x.toFixed(2)} ${py.toFixed(2)} l`);
    return this;
  }

  stroke() {
    const { r, g, b } = this.curStroke;
    this._push(`${this.curLineWidth.toFixed(2)} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG S`);
    return this;
  }

  fill() {
    const { r, g, b } = this.curFill;
    this._push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg f`);
    return this;
  }

  circle(x, y, radius, options = {}) {
    const py = this.pageHeight - y;
    const k = radius * 0.5523;
    const cx = x;
    const cy = py;
    let op =
      `${(cx + radius).toFixed(2)} ${cy.toFixed(2)} m ` +
      `${(cx + radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy + radius).toFixed(2)} ${cx.toFixed(2)} ${(cy + radius).toFixed(2)} c ` +
      `${(cx - k).toFixed(2)} ${(cy + radius).toFixed(2)} ${(cx - radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} c ` +
      `${(cx - radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy - radius).toFixed(2)} ${cx.toFixed(2)} ${(cy - radius).toFixed(2)} c ` +
      `${(cx + k).toFixed(2)} ${(cy - radius).toFixed(2)} ${(cx + radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} c h`;
    if (options.fill) {
      const { r, g, b } = typeof options.fill === "string" ? rgbFromHex(options.fill) : this.curFill;
      op += ` ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg f`;
    }
    if (options.stroke) {
      const { r, g, b } = typeof options.stroke === "string" ? rgbFromHex(options.stroke) : this.curStroke;
      op += ` ${(options.width || this.curLineWidth).toFixed(2)} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG S`;
    }
    this._push(op);
    return this;
  }

  output() {
    // 1 = Catalog, 2 = Pages, then page objects (3..2+n), then content
    // streams, then font objects. Page objects are patched with their stream
    // and font references once the later object numbers are known.
    const objects = [];
    const usedFonts = this._collectUsedFonts();

    const pageObjects = this.pages.map((page, idx) => ({
      pageIndex: idx,
      streamData: page.ops.join("\n"),
      length: Buffer.byteLength(page.ops.join("\n"), "utf8"),
      fonts: [...page.fonts],
    }));

    objects.push(null);
    objects.push({ text: this._buildCatalogObject() });
    objects.push({ text: this._buildPagesObject(pageObjects.length) });

    for (let i = 0; i < pageObjects.length; i++) {
      objects.push({ text: null });
    }

    const contentStreamObjectIndices = [];
    for (const page of pageObjects) {
      const streamText = `<< /Length ${page.length} >>\nstream\n${page.streamData}\nendstream`;
      objects.push({ text: streamText });
      contentStreamObjectIndices.push(objects.length - 1);
    }

    const fontObjectIndices = {};
    for (const font of usedFonts) {
      const fontText = `<< /Type /Font /Subtype /Type1 /BaseFont /${font.baseFont} >>`;
      objects.push({ text: fontText });
      fontObjectIndices[font.key] = objects.length - 1;
    }

    // Patch page objects with their content-stream and font references.
    for (let i = 0; i < pageObjects.length; i++) {
      const pageObjIndex = 3 + i;
      const contentRef = `${contentStreamObjectIndices[i]} 0 R`;
      const fontDictEntries = pageObjects[i].fonts
        .map((key) => {
          const font = this.fontRegistry.byFamily.get(key);
          return `/F${font.index} ${fontObjectIndices[key]} 0 R`;
        })
        .join(" ");
      objects[pageObjIndex].text = this._buildPageObject(pageObjIndex, contentRef, fontDictEntries);
    }

    // Also the pages object references the page objects.
    objects[2].text = this._buildPagesObjectWithKids(
      pageObjects.map((_, idx) => `${3 + idx} 0 R`).join(" "),
      pageObjects.length
    );

    // Assemble the file bytes.
    let header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const chunks = [Buffer.from(header, "latin1")];
    const offsets = [];
    for (let i = 1; i < objects.length; i++) {
      offsets[i] = chunks.reduce((sum, c) => sum + c.length, 0);
      const body = Buffer.from(`${i} 0 obj\n${objects[i].text}\nendobj\n`, "latin1");
      chunks.push(body);
    }

    const xrefStart = chunks.reduce((sum, c) => sum + c.length, 0);
    let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < objects.length; i++) {
      xref += `${pad10(offsets[i])} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    chunks.push(Buffer.from(xref, "latin1"));

    return Buffer.concat(chunks);
  }

  _collectUsedFonts() {
    const seen = new Map();
    for (const page of this.pages) {
      for (const key of page.fonts) {
        const font = this.fontRegistry.byFamily.get(key);
        if (font && !seen.has(key)) seen.set(key, font);
      }
    }
    if (seen.size === 0) {
      const defaultFont = this.fontRegistry.add("Helvetica");
      seen.set(defaultFont.key, defaultFont);
    }
    return [...seen.values()];
  }

  _buildCatalogObject() {
    return "<< /Type /Catalog /Pages 2 0 R >>";
  }

  _buildPagesObjectWithKids(kids, count) {
    return `<< /Type /Pages /Kids [${kids}] /Count ${count} >>`;
  }

  _buildPagesObject(count) {
    const kids = [];
    for (let i = 0; i < count; i++) kids.push(`${3 + i} 0 R`);
    return `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${count} >>`;
  }

  _buildPageObject(index, contentRef, fontDictEntries) {
    const width = this.pageWidth.toFixed(2);
    const height = this.pageHeight.toFixed(2);
    const resources = fontDictEntries
      ? `<< /Font << ${fontDictEntries} >> >>`
      : `<< /Font << >> >>`;
    return `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources ${resources} /Contents ${contentRef} >>`;
  }
}

export { measureText, wrapText, rgbFromHex, PAGE_SIZES, FONT_FAMILIES };