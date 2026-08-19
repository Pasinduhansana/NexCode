// Orchestrates structured report content into a styled, multi-page PDF using
// the dependency-free engine and the NexCode document theme.

import { PDFDocument } from "./engine.js";
import { NexCodeDocumentTheme as T, formatLKR, formatDate } from "./theme.js";
import {
  ReportFlow,
  docTypeLabel,
  drawCoverPage,
  drawDocumentTitle,
  drawSectionHeader,
  drawInfoGrid,
  drawPricingTable,
  drawFeatureList,
  drawTimelineTable,
  drawPaymentSummary,
  drawNotesSection,
  drawSignatureSection,
  drawThankYou,
  drawTable,
} from "./components.js";

const COVER_TYPES = new Set(["proposal", "manual", "other"]);

function paragraph(flow, text) {
  const { doc } = flow;
  const lines = doc.wrapText(String(text || ""), flow.width, T.sizes.body);
  const height = lines.length * T.sizes.body * 1.22 + 3;
  flow.ensure(height);
  doc.font(T.type.body, T.sizes.body).fillColor(T.brand.ink);
  doc.text(String(text || ""), flow.left, flow.y, {
    size: T.sizes.body,
    width: flow.width,
    family: T.type.body,
  });
  flow.y += height;
  return flow.y;
}

function infoGridFromContent(flow, c) {
  const meta = c.documentMeta || {};
  const client = c.client || {};
  const project = c.project || {};
  const items = [
    { label: "Document No", value: meta.docNumber || c.docNumber || "—" },
    { label: "Date", value: meta.date || meta.invoiceDate || formatDate(new Date()) },
    { label: "Client", value: client.name || project.client || "—" },
    { label: "Project", value: project.name || c.projectLabel || "—" },
  ];
  if (meta.dueDate) items.push({ label: "Due Date", value: meta.dueDate });
  if (meta.validUntil) items.push({ label: "Valid Until", value: meta.validUntil });
  if (meta.currency) items.push({ label: "Currency", value: meta.currency });
  if (meta.reference) items.push({ label: "Reference", value: meta.reference });
  if (project.status) items.push({ label: "Project Status", value: String(project.status).replace(/_/g, " ") });
  if (client.company) items.push({ label: "Client Company", value: client.company });
  if (meta.paymentStatus) items.push({ label: "Payment Status", value: String(meta.paymentStatus).replace(/_/g, " ") });
  drawInfoGrid(flow, items, { cols: 2 });
}

function buildInvoice(flow, c) {
  const meta = c.documentMeta || {};
  drawDocumentTitle(flow, {
    title: "PAYMENT INVOICE",
    subtitle: c.subtitle || "NexCode Digital Innovations",
    docNumber: meta.docNumber || c.docNumber,
    dateLabel: meta.invoiceDate || meta.date,
  });
  infoGridFromContent(flow, c);
  drawSectionHeader(flow, "Invoice Items");
  drawPricingTable(flow, { rows: c.items || [], total: c.pricing?.total ?? c.itemsTotal });
  drawPaymentSummary(flow, c.pricing || {});
  if (Array.isArray(c.notes) && c.notes.length) {
    drawSectionHeader(flow, "Notes");
    drawNotesSection(flow, c.notes);
  }
  drawThankYou(flow);
  drawSignatureSection(flow, { preparedBy: meta.preparedBy, approvedBy: meta.approvedBy });
}

function buildQuotation(flow, c) {
  const meta = c.documentMeta || {};
  drawDocumentTitle(flow, {
    title: "PRICE QUOTATION",
    subtitle: c.subtitle || "Prepared by NexCode Digital Innovations",
    docNumber: meta.docNumber || c.docNumber,
    dateLabel: meta.date,
  });
  infoGridFromContent(flow, c);
  if (c.introduction) {
    drawSectionHeader(flow, "Introduction");
    paragraph(flow, c.introduction);
  }
  if (Array.isArray(c.features) && c.features.length) {
    drawSectionHeader(flow, "Scope");
    drawFeatureList(flow, c.features);
  }
  drawSectionHeader(flow, "Pricing");
  drawPricingTable(flow, { rows: c.items || [], total: c.pricing?.total ?? c.itemsTotal });
  drawPaymentSummary(flow, c.pricing || {});
  if (Array.isArray(c.notes) && c.notes.length) {
    drawSectionHeader(flow, "Notes");
    drawNotesSection(flow, c.notes);
  }
  drawThankYou(flow, "This quotation is valid for the period indicated above.");
  drawSignatureSection(flow, { preparedBy: meta.preparedBy, approvedBy: meta.approvedBy });
}

function buildProposal(flow, c) {
  const meta = c.documentMeta || {};
  drawSectionHeader(flow, "Project Overview");
  infoGridFromContent(flow, c);
  if (c.introduction) {
    drawSectionHeader(flow, "Introduction");
    paragraph(flow, c.introduction);
  }
  if (c.objectives && c.objectives.length) {
    drawSectionHeader(flow, "Objectives");
    drawFeatureList(flow, c.objectives);
  }
  if (Array.isArray(c.features) && c.features.length) {
    drawSectionHeader(flow, "Proposed Scope");
    drawFeatureList(flow, c.features);
  }
  if (Array.isArray(c.timeline) && c.timeline.length) {
    drawSectionHeader(flow, "Timeline");
    drawTimelineTable(flow, { rows: c.timeline });
  }
  if ((c.expenses?.estimated?.length || c.expenses?.actual?.length)) {
    drawSectionHeader(flow, "Estimated vs Actual Expenses");
    if (c.expenses.estimated?.length) {
      paragraph(flow, "Estimated (planned) expenses:");
      drawPricingTable(flow, {
        rows: c.expenses.estimated.map((e) => ({
          description: e.item || e.description || e.name || "—",
          qty: 1,
          unitPrice: e.cost != null ? e.cost : e.amount,
        })),
        total: c.expenses.estimatedTotal ?? c.expenses.estimated.reduce((s, e) => s + (e.cost ?? e.amount ?? 0), 0),
        totalLabel: "Estimated Total",
      });
    }
    if (c.expenses.actual?.length) {
      paragraph(flow, "Actual (recorded) expenses:");
      drawPricingTable(flow, {
        rows: c.expenses.actual.map((e) => ({
          description: e.item || e.description || e.name || "—",
          qty: 1,
          unitPrice: e.cost != null ? e.cost : e.amount,
        })),
        total: c.expenses.actualTotal ?? c.expenses.actual.reduce((s, e) => s + (e.cost ?? e.amount ?? 0), 0),
        totalLabel: "Actual Total",
      });
    }
  }
  drawSectionHeader(flow, "Investment");
  drawPaymentSummary(flow, c.pricing || {});
  if (Array.isArray(c.notes) && c.notes.length) {
    drawSectionHeader(flow, "Notes");
    drawNotesSection(flow, c.notes);
  }
  drawSignatureSection(flow, { preparedBy: meta.preparedBy, approvedBy: meta.approvedBy });
}

function buildManual(flow, c) {
  const meta = c.documentMeta || {};
  drawSectionHeader(flow, "Document Overview");
  if (c.introduction) paragraph(flow, c.introduction);
  drawSectionHeader(flow, "Project Summary");
  infoGridFromContent(flow, c);
  if (Array.isArray(c.sections)) {
    for (const section of c.sections) {
      if (!section?.heading && !section?.body) continue;
      if (section.heading) drawSectionHeader(flow, String(section.heading));
      if (section.body) {
        for (const chunk of Array.isArray(section.body) ? section.body : [section.body]) {
          if (typeof chunk === "string") paragraph(flow, chunk);
          else if (chunk?.type === "list") drawFeatureList(flow, chunk.items || []);
          else if (chunk?.type === "table") {
            drawTableSafe(flow, chunk);
          } else if (chunk?.heading) {
            if (chunk.heading) drawSectionHeader(flow, String(chunk.heading));
            if (chunk.body) paragraph(flow, String(chunk.body));
          }
        }
      }
    }
  }
  if (Array.isArray(c.features) && c.features.length) {
    drawSectionHeader(flow, "Deliverables");
    drawFeatureList(flow, c.features);
  }
  if (Array.isArray(c.notes) && c.notes.length) {
    drawSectionHeader(flow, "Notes");
    drawNotesSection(flow, c.notes);
  }
  drawSignatureSection(flow, { preparedBy: meta.preparedBy, approvedBy: meta.approvedBy });
}

function drawTableSafe(flow, chunk) {
  const columns = Array.isArray(chunk.columns) ? chunk.columns.map((c) => ({ label: c, width: 100 })) : null;
  const rows = Array.isArray(chunk.rows) ? chunk.rows.map((r) => (Array.isArray(r) ? r : Object.values(r))) : null;
  if (!columns || !rows) return;
  drawTable(flow, { columns, rows, zebra: true });
}

export function buildReportPdf(report) {
  const content = report.content || {};
  const type = report.documentType || "other";
  const meta = content.documentMeta || {};
  const c = { ...content };

  const doc = new PDFDocument({ size: T.page.size, margins: T.page.margins });
  const flow = new ReportFlow(doc, {
    meta: { documentType: type, docNumber: meta.docNumber || report.docNumber },
  });

  const coverMeta = {
    title: c.title || docTypeLabel(type),
    subtitle: c.subtitle || (c.project?.name ? `Prepared for ${c.project.name}` : "Prepared by NexCode Digital Innovations"),
    docNumber: meta.docNumber || report.docNumber,
    preparedFor: c.client?.name || c.project?.client || "",
    preparedBy: meta.preparedBy || "NexCode",
    dateLabel: meta.date || formatDate(new Date()),
    projectLabel: c.project?.name || c.projectLabel || "",
  };

  if (COVER_TYPES.has(type)) {
    drawCoverPage(flow, coverMeta);
    flow.newPage();
  }

  switch (type) {
    case "invoice":
      buildInvoice(flow, c);
      break;
    case "quotation":
      buildQuotation(flow, c);
      break;
    case "proposal":
      buildProposal(flow, c);
      break;
    case "manual":
      buildManual(flow, c);
      break;
    default:
      drawDocumentTitle(flow, {
        title: c.title || "Report",
        subtitle: c.subtitle || "",
        docNumber: meta.docNumber || report.docNumber,
        dateLabel: meta.date,
      });
      if (c.introduction) paragraph(flow, c.introduction);
      if (Array.isArray(c.sections)) {
        for (const section of c.sections) {
          if (!section?.heading && !section?.body) continue;
          if (section.heading) drawSectionHeader(flow, String(section.heading));
          if (section.body) paragraph(flow, String(section.body));
        }
      }
      drawSignatureSection(flow, { preparedBy: meta.preparedBy, approvedBy: meta.approvedBy });
      break;
  }

  return doc.output();
}