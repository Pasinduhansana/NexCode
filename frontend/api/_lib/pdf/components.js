// Reusable report document components built on the PDF engine + theme.
// A ReportFlow tracks the current y cursor and inserts pages (with the
// running header/footer) whenever content would overflow the content area.

import { PDFDocument } from "./engine.js";
import { NexCodeDocumentTheme as T, formatLKR, formatDate } from "./theme.js";

const DOC_TYPE_LABELS = {
  invoice: "Payment Invoice",
  quotation: "Price Quotation",
  proposal: "Project Proposal",
  manual: "Project Manual",
  other: "Report",
};

export function docTypeLabel(type) {
  return DOC_TYPE_LABELS[type] || DOC_TYPE_LABELS.other;
}

export class ReportFlow {
  constructor(doc, opts = {}) {
    this.doc = doc;
    this.theme = T;
    this.left = T.page.margins.left;
    this.right = T.page.margins.right;
    this.top = T.page.margins.top;
    this.bottom = doc.pageHeight - T.page.margins.bottom;
    this.width = doc.pageWidth - this.left - this.right;
    this.y = this.top;
    this.meta = opts.meta || {};
    this.onNewPage = opts.onNewPage || null;
    this.drawChrome();
  }

  ensure(height) {
    if (this.y + height > this.bottom) this.newPage();
  }

  newPage() {
    this.doc.addPage();
    this.y = this.top;
    this.drawChrome();
    if (this.onNewPage) this.onNewPage(this);
  }

  drawChrome() {
    const { doc } = this;
    const pageNo = doc.pageCount;
    const brand = T.brand;

    // Thin brand rule at top of content area.
    doc.line(this.left, this.top - 18, doc.pageWidth - this.right, this.top - 18, {
      stroke: brand.primary,
      width: 2,
    });
    doc.line(this.left, this.top - 16, doc.pageWidth - this.right, this.top - 16, {
      stroke: brand.border,
      width: 0.6,
    });

    // Running header (pages after the cover).
    if (pageNo > 1) {
      doc.font(T.type.small, T.sizes.tiny).fillColor(brand.faint);
      doc.text(`${brand.name} — ${docTypeLabel(this.meta.documentType)}`, this.left, this.top - 38, {
        size: T.sizes.tiny,
        width: this.width / 2,
        family: T.type.small,
      });
      doc.text(this.meta.docNumber || "", this.left, this.top - 38, {
        size: T.sizes.tiny,
        width: this.width / 2,
        align: "right",
        family: T.type.small,
      });
    }

    // Footer with page number.
    const footerY = doc.pageHeight - 26;
    doc.line(this.left, footerY - 10, doc.pageWidth - this.right, footerY - 10, {
      stroke: brand.border,
      width: 0.6,
    });
    doc.font(T.type.small, T.sizes.tiny).fillColor(brand.faint);
    doc.text(`${brand.name} · Digital Innovations`, this.left, footerY, {
      size: T.sizes.tiny,
      width: this.width / 2,
      family: T.type.small,
    });
    doc.text(`Page ${pageNo}`, this.left, footerY, {
      size: T.sizes.tiny,
      width: this.width / 2,
      align: "right",
      family: T.type.small,
    });
  }
}

export function drawBrandHeader(doc, x, y, width, opts = {}) {
  const color = opts.color || T.brand.dark;
  doc.font(T.type.accent, opts.size || 22).fillColor(color);
  doc.text("NexCode", x, y, { size: opts.size || 22, family: T.type.accent, width });
  const tagY = y + (opts.size || 22) * 1.15 + 2;
  doc.font(T.type.small, T.sizes.small).fillColor(T.brand.primary);
  doc.text("Digital Innovations", x, tagY, { size: T.sizes.small, family: T.type.small, width });
}

export function drawDocumentTitle(flow, { title, subtitle, docNumber, dateLabel }) {
  const { doc } = flow;
  const brand = T.brand;
  flow.ensure(70);
  const startY = flow.y;

  // Title banner.
  doc.rect(flow.left, startY, flow.width, 54, { fill: brand.dark });
  doc.rect(flow.left, startY, 4, 54, { fill: brand.primary });
  doc.font(T.type.accent, T.sizes.docTitle).fillColor(brand.white);
  doc.text(String(title || ""), flow.left + 18, startY + 14, {
    size: T.sizes.docTitle,
    width: flow.width - 36,
    family: T.type.accent,
  });
  if (subtitle) {
    doc.font(T.type.body, T.sizes.subheading).fillColor(T.brand.primary);
    doc.text(String(subtitle), flow.left + 18, startY + 39, {
      size: T.sizes.subheading,
      width: flow.width - 36,
      family: T.type.body,
    });
  }

  // Meta strip on the right side of the banner.
  const metaX = flow.left + flow.width - 150;
  let metaY = startY + 12;
  const metaLines = [
    [T.brand.faint, docNumber ? "Document No" : ""],
    [T.brand.white, docNumber || ""],
  ];
  if (dateLabel) {
    metaLines.push([T.brand.faint, "Date"]);
    metaLines.push([T.brand.white, dateLabel]);
  }
  for (const [color, value] of metaLines) {
    if (!value) continue;
    doc.font(T.type.small, T.sizes.tiny).fillColor(color);
    doc.text(String(value), metaX, metaY, {
      size: T.sizes.tiny,
      width: 132,
      align: "right",
      family: T.type.small,
    });
    metaY += 9;
  }

  flow.y = startY + 66;
  return flow.y;
}

export function drawCoverPage(flow, meta) {
  const { doc } = flow;
  const brand = T.brand;
  const pageW = doc.pageWidth;
  const pageH = doc.pageHeight;

  // Full-bleed dark cover with a subtle brand accent.
  doc.rect(0, 0, pageW, pageH, { fill: brand.dark });
  doc.rect(0, 0, 6, pageH, { fill: brand.primary });

  drawBrandHeader(doc, 64, 54, pageW - 128, { color: brand.white, size: 26 });

  const titleY = pageH * 0.42;
  doc.font(T.type.accent, 36).fillColor(brand.white);
  doc.text(String(meta.title || "Report"), 64, titleY, {
    size: 36,
    width: pageW - 128,
    family: T.type.accent,
  });

  doc.font(T.type.body, 13).fillColor(brand.primary);
  doc.text(String(meta.subtitle || ""), 64, titleY + 50, {
    size: 13,
    width: pageW - 128,
    family: T.type.body,
  });

  if (meta.docNumber) {
    doc.rect(64, titleY + 96, 210, 26, { fill: brand.primary });
    doc.font(T.type.accent, 10).fillColor(brand.white);
    doc.text(String(meta.docNumber), 76, titleY + 104, {
      size: 10,
      width: 190,
      family: T.type.accent,
    });
  }

  const bottomY = pageH - 140;
  doc.font(T.type.small, 9.5).fillColor(T.brand.faint);
  const info = [
    meta.preparedFor ? `Prepared for: ${meta.preparedFor}` : "",
    meta.preparedBy ? `Prepared by: ${meta.preparedBy}` : "",
    meta.dateLabel ? `Date: ${meta.dateLabel}` : "",
    meta.projectLabel ? `Project: ${meta.projectLabel}` : "",
  ].filter(Boolean);
  let iy = bottomY;
  for (const line of info) {
    doc.text(line, 64, iy, { size: 9.5, width: pageW - 128, family: T.type.small });
    iy += 14;
  }

  doc.text(`${brand.name} · ${brand.tagline}`, 64, pageH - 40, {
    size: 8,
    width: pageW - 128,
    family: T.type.small,
    color: T.brand.faint,
  });
}

export function drawSectionHeader(flow, label, opts = {}) {
  const { doc } = flow;
  const brand = T.brand;
  flow.ensure(30);
  flow.y += opts.offset || 8;
  doc.rect(flow.left, flow.y, 3, 12, { fill: brand.primary });
  doc.font(T.type.accent, T.sizes.heading).fillColor(brand.ink);
  doc.text(String(label), flow.left + 10, flow.y, {
    size: T.sizes.heading,
    width: flow.width - 20,
    family: T.type.accent,
  });
  doc.line(flow.left, flow.y + 16, flow.left + flow.width, flow.y + 16, {
    stroke: brand.border,
    width: 0.6,
  });
  flow.y += 26;
  return flow.y;
}

export function drawInfoGrid(flow, items, opts = {}) {
  const { doc } = flow;
  const cols = opts.cols || 2;
  const colWidth = flow.width / cols;
  const labelSize = T.sizes.small;
  const valueSize = T.sizes.body;

  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));

  for (const row of rows) {
    let rowHeight = 16;
    for (let c = 0; c < cols; c++) {
      const item = row[c];
      if (!item) continue;
      const valueLines = doc.wrapText(String(item.value ?? ""), colWidth - 2, valueSize);
      rowHeight = Math.max(rowHeight, 8 + valueLines.length * valueSize * 1.15 + 4);
    }
    flow.ensure(rowHeight);
    for (let c = 0; c < cols; c++) {
      const item = row[c];
      if (!item) continue;
      const x = flow.left + c * colWidth;
      const labelLines = doc.wrapText(String(item.label || ""), colWidth, labelSize);
      doc.font(T.type.accent, labelSize).fillColor(T.brand.muted);
      doc.text(String(item.label || ""), x, flow.y, {
        size: labelSize,
        width: colWidth,
        family: T.type.accent,
      });
      const valueY = flow.y + labelLines.length * labelSize * 1.15 + 2;
      doc.font(T.type.body, valueSize).fillColor(T.brand.ink);
      doc.text(String(item.value ?? ""), x, valueY, {
        size: valueSize,
        width: colWidth,
        family: T.type.body,
      });
    }
    flow.y += rowHeight + 2;
  }
  flow.y += 4;
  return flow.y;
}

function cellLines(doc, text, width, size) {
  return doc.wrapText(String(text ?? ""), Math.max(20, width - 2 * T.spacing.cellPadX), size);
}

export function drawTable(flow, opts) {
  const { doc } = flow;
  const brand = T.brand;
  const columns = opts.columns;
  const rows = opts.rows;
  const bodySize = opts.bodySize || T.sizes.body;
  const headerSize = opts.headerSize || T.sizes.small;
  const alignMap = opts.alignments || {};
  const zebra = opts.zebra !== false;
  const totals = opts.totals || [];
  const highlightRows = new Set(opts.highlightRows || []);

  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const scale = flow.width / totalWidth;
  const cols = columns.map((col) => ({ ...col, width: col.width * scale }));

  const headerHeight = 22;
  const headerBottomY = flow.y + headerHeight;

  const rowHeightFor = (row) => {
    let h = 20;
    cols.forEach((col, idx) => {
      const lines = cellLines(doc, row[idx], col.width, bodySize).length;
      h = Math.max(h, lines * bodySize * 1.15 + 2 * T.spacing.cellPadY);
    });
    return h;
  };

  // Column header.
  flow.ensure(headerHeight);
  doc.rect(flow.left, flow.y, flow.width, headerHeight, { fill: brand.dark });
  let hx = flow.left;
  cols.forEach((col, idx) => {
    const align = alignMap[idx] || "left";
    doc.font(T.type.accent, headerSize).fillColor(brand.white);
    doc.text(String(col.label || ""), hx + T.spacing.cellPadX, flow.y + 7, {
      size: headerSize,
      width: col.width - 2 * T.spacing.cellPadX,
      align,
      family: T.type.accent,
    });
    hx += col.width;
  });
  flow.y = headerBottomY;

  // Body rows.
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const rh = rowHeightFor(row);
    if (flow.y + rh > flow.bottom) {
      flow.newPage();
      // Repeat the column header after a page break.
      doc.rect(flow.left, flow.y, flow.width, headerHeight, { fill: brand.dark });
      let rhx = flow.left;
      cols.forEach((col, idx) => {
        const align = alignMap[idx] || "left";
        doc.font(T.type.accent, headerSize).fillColor(brand.white);
        doc.text(String(col.label || ""), rhx + T.spacing.cellPadX, flow.y + 7, {
          size: headerSize,
          width: col.width - 2 * T.spacing.cellPadX,
          align,
          family: T.type.accent,
        });
        rhx += col.width;
      });
      flow.y += headerHeight;
    }

    const isHighlight = highlightRows.has(r);
    if (zebra && r % 2 === 1 && !isHighlight) {
      doc.rect(flow.left, flow.y, flow.width, rh, { fill: T.brand.card });
    }
    let cx = flow.left;
    cols.forEach((col, idx) => {
      const align = alignMap[idx] || "left";
      const textColor = isHighlight ? brand.primary : brand.ink;
      const family = isHighlight ? T.type.accent : col.bold ? T.type.accent : T.type.body;
      doc.font(family, bodySize).fillColor(textColor);
      doc.text(String(row[idx] ?? ""), cx + T.spacing.cellPadX, flow.y + T.spacing.cellPadY, {
        size: bodySize,
        width: col.width - 2 * T.spacing.cellPadX,
        align,
        family,
      });
      cx += col.width;
    });
    doc.line(flow.left, flow.y + rh, flow.left + flow.width, flow.y + rh, {
      stroke: brand.border,
      width: 0.6,
    });
    flow.y += rh;
  }

  // Totals rows.
  for (const total of totals) {
    const th = 20;
    if (flow.y + th > flow.bottom) flow.newPage();
    const totalWidthSum = cols.reduce((sum, col) => sum + col.width, 0);
    const labelW = totalWidthSum - (total.valueCols || [cols.length - 1]);
    let tx = flow.left;
    doc.font(T.type.accent, bodySize).fillColor(total.color || brand.ink);
    doc.text(String(total.label || ""), tx, flow.y + 5, {
      size: bodySize,
      width: Math.max(40, labelW - 4),
      family: T.type.accent,
    });
    const valueStartX = flow.left + (totalWidthSum - (total.valueCols || [cols.length - 1]));
    for (const idx of total.valueCols || [cols.length - 1]) {
      const col = cols[idx];
      doc.rect(valueStartX, flow.y, col.width, th, { fill: brand.card });
      doc.font(T.type.accent, bodySize).fillColor(total.color || brand.ink);
      doc.text(String((total.values && total.values[idx]) ?? ""), valueStartX + T.spacing.cellPadX, flow.y + 5, {
        size: bodySize,
        width: col.width - 2 * T.spacing.cellPadX,
        align: alignMap[idx] || "right",
        family: T.type.accent,
      });
    }
    flow.y += th;
  }

  flow.y += 6;
  return flow.y;
}

export function drawPricingTable(flow, opts) {
  const { doc } = flow;
  const brand = T.brand;
  const columns = [
    { label: "#", width: 30 },
    { label: "Description", width: 250 },
    { label: "Qty", width: 60 },
    { label: "Unit Price", width: 100 },
    { label: "Amount", width: 110 },
  ];
  const rows = opts.rows.map((r, idx) => [
    String(idx + 1),
    r.description || r.name || "—",
    r.qty != null ? String(r.qty) : "1",
    formatLKR(r.unitPrice != null ? r.unitPrice : 0),
    formatLKR(r.amount != null ? r.amount : r.total != null ? r.total : 0),
  ]);
  const totals = [
    { label: opts.totalLabel || "Total", valueCols: [4], values: [formatLKR(opts.total)], color: brand.dark },
  ];
  return drawTable(flow, {
    columns,
    rows,
    alignments: { 0: "center", 2: "center", 3: "right", 4: "right" },
    totals,
    ...opts,
  });
}

export function drawFeatureList(flow, items) {
  const { doc } = flow;
  const brand = T.brand;
  for (const item of items) {
    const text = String(item || "");
    const lines = doc.wrapText(text, flow.width - 16, T.sizes.body);
    const height = lines.length * T.sizes.body * 1.15 + 4;
    flow.ensure(height);
    doc.circle(flow.left + 4, flow.y + 4, 1.6, { fill: brand.primary });
    doc.font(T.type.body, T.sizes.body).fillColor(brand.ink);
    doc.text(text, flow.left + 16, flow.y, {
      size: T.sizes.body,
      width: flow.width - 16,
      family: T.type.body,
    });
    flow.y += height + 2;
  }
  flow.y += 4;
  return flow.y;
}

export function drawTimelineTable(flow, opts) {
  const columns = [
    { label: "Phase", width: 130 },
    { label: "Description", width: 260 },
    { label: "Timeline", width: 120 },
  ];
  const rows = (opts.rows || []).map((r) => [r.phase || r.name || "—", r.description || "—", r.timeline || r.range || "—"]);
  return drawTable(flow, { columns, rows, alignments: { 2: "center" } });
}

export function drawPaymentSummary(flow, data) {
  const { doc } = flow;
  const brand = T.brand;
  const rows = [
    ["Subtotal", formatLKR(data.subtotal != null ? data.subtotal : 0)],
    ["Discount", data.discount ? `- ${formatLKR(data.discount)}` : formatLKR(0)],
    ["Taxes", formatLKR(data.taxes != null ? data.taxes : 0)],
  ];
  if (data.currency) rows.push(["Currency", data.currency]);
  const tableRows = rows.map(([a, b]) => [a, b]);

  drawTable(flow, {
    columns: [
      { label: "Summary", width: 240 },
      { label: "Amount", width: 200 },
    ],
    rows: tableRows,
    alignments: { 1: "right" },
    zebra: false,
  });

  drawTable(flow, {
    columns: [
      { label: "Total", width: 240 },
      { label: "", width: 200 },
    ],
    rows: [],
    totals: [
      { label: "Total Amount", valueCols: [1], values: [formatLKR(data.total != null ? data.total : 0)], color: brand.dark },
      ...(data.paid != null
        ? [{ label: "Amount Paid", valueCols: [1], values: [formatLKR(data.paid)], color: brand.success }]
        : []),
      ...(data.balance != null
        ? [{ label: "Balance Due", valueCols: [1], values: [formatLKR(data.balance)], color: data.balance > 0 ? brand.danger : brand.success }]
        : []),
    ],
    zebra: false,
  });
  return flow.y;
}

export function drawNotesSection(flow, notes) {
  const { doc } = flow;
  const brand = T.brand;
  for (const note of notes) {
    const text = String(note || "");
    const lines = doc.wrapText(text, flow.width - 16, T.sizes.small);
    const height = lines.length * T.sizes.small * 1.2 + 4;
    flow.ensure(height);
    doc.circle(flow.left + 3, flow.y + 3.5, 1.2, { fill: brand.muted });
    doc.font(T.type.small, T.sizes.small).fillColor(brand.muted);
    doc.text(text, flow.left + 12, flow.y, {
      size: T.sizes.small,
      width: flow.width - 12,
      family: T.type.small,
    });
    flow.y += height + 1;
  }
  flow.y += 4;
  return flow.y;
}

export function drawSignatureSection(flow, meta) {
  const { doc } = flow;
  const brand = T.brand;
  flow.ensure(80);
  const cols = 2;
  const colWidth = flow.width / cols;
  const labelY = flow.y;
  for (let i = 0; i < cols; i++) {
    const x = flow.left + i * colWidth;
    const title = i === 0 ? "Prepared by" : "Approved by";
    const name = i === 0 ? meta.preparedBy || "NexCode Team" : meta.approvedBy || "NexCode";
    doc.font(T.type.accent, T.sizes.small).fillColor(brand.muted);
    doc.text(title, x, labelY, { size: T.sizes.small, width: colWidth, family: T.type.accent });
    doc.font(T.type.body, T.sizes.body).fillColor(brand.ink);
    doc.text(name, x, labelY + 16, { size: T.sizes.body, width: colWidth, family: T.type.body });
  }
  flow.y += 40;
  doc.line(flow.left, flow.y, flow.left + colWidth - 20, flow.y, { stroke: brand.muted, width: 0.6 });
  doc.line(flow.left + colWidth, flow.y, flow.left + flow.width - 20, flow.y, { stroke: brand.muted, width: 0.6 });
  flow.y += 14;
  doc.font(T.type.small, T.sizes.tiny).fillColor(brand.faint);
  doc.text("Signature & date", flow.left, flow.y, {
    size: T.sizes.tiny,
    width: colWidth - 20,
    family: T.type.small,
  });
  doc.text("Signature & date", flow.left + colWidth, flow.y, {
    size: T.sizes.tiny,
    width: colWidth - 20,
    family: T.type.small,
  });
  flow.y += 18;
  return flow.y;
}

export function drawThankYou(flow, text = "Thank you for choosing NexCode Digital Innovations.") {
  const { doc } = flow;
  const brand = T.brand;
  flow.ensure(30);
  flow.y += 6;
  doc.rect(flow.left, flow.y, flow.width, 24, { fill: T.brand.card });
  doc.font(T.type.body, T.sizes.small).fillColor(brand.muted);
  doc.text(String(text), flow.left + 10, flow.y + 8, {
    size: T.sizes.small,
    width: flow.width - 20,
    align: "center",
    family: T.type.body,
  });
  flow.y += 30;
  return flow.y;
}