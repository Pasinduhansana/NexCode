import { test, describe, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { seedProject, reset, newUser } from "./helpers/setup.js";

mock.module("../api/_lib/gemini.js", {
  namedExports: {
    generateReportContent: async ({ prompt }) => {
      const aiDraft = {
        title: "AI Draft Invoice",
        subtitle: "Generated for testing",
        client: { name: "Test Client" },
        items: [{ description: "Web design", qty: 2, unitPrice: 15000 }],
        pricing: { subtotal: 30000, total: 33000, taxes: 3000, currency: "LKR" },
        notes: ["Thanks for your business"],
      };
      if (prompt?.documentType === "manual") {
        aiDraft.title = "Project Manual";
        aiDraft.sections = [{ heading: "Handover", body: "All files delivered" }];
      }
      if (prompt?.notes?.includes("SECRET_CRED")) {
        aiDraft.notes = ["apiKey = SECRET_CRED value", "https://user:hunter2@example.com/db"];
      }
      if (prompt?.notes?.includes("FAIL_AI")) {
        throw new Error("boom");
      }
      return aiDraft;
    },
  },
});

const {
  REPORT_TYPES,
  REPORT_STATUSES,
  ReportServiceError,
  createReport,
  listReports,
  getReport,
  getReportFile,
  updateReportContent,
  generateReportPdf,
  deleteReport,
  setReportStatus,
  nextDocumentNumber,
  buildReportData,
  normalizeReportContent,
  sanitizeReportContent,
  generateReportDraftFromAI,
} = await import("../api/_lib/reports.js");

const user = newUser();
const otherUser = { uid: "user-2", name: "Other", role: "member" };

beforeEach(() => reset());

function validContent(overrides = {}) {
  return {
    title: "Payment Invoice",
    client: { name: "Acme Corp", address: "Colombo" },
    items: [
      { description: "Landing page design", qty: 1, unitPrice: 100000 },
      { description: "Hosting setup", qty: 2, unitPrice: 25000 },
    ],
    pricing: { subtotal: 150000, total: 150000, paid: 50000, balance: 100000, currency: "LKR" },
    ...overrides,
  };
}

describe("reports service — content normalization & sanitization", () => {
  test("rejects unknown document types", () => {
    assert.throws(() => normalizeReportContent("receipt", {}), (err) => err instanceof ReportServiceError && err.status === 400);
  });

  test("normalizes items, pricing and defaults", () => {
    const content = normalizeReportContent("invoice", {
      title: "  ",
      items: [
        { name: "Design", qty: "2", cost: "5000" },
        { item: "", qty: "", unitPrice: "" },
      ],
    });
    assert.equal(content.title, "Payment Invoice");
    assert.equal(content.items.length, 2);
    assert.equal(content.items[0].description, "Design");
    assert.equal(content.items[0].qty, 2);
    assert.equal(content.items[0].unitPrice, 5000);
    assert.equal(content.items[0].amount, 0);
    assert.equal(content.items[1].description, "Item");
    assert.equal(content.items[1].qty, 1);
    assert.equal(content.currency ?? content.pricing.currency, "LKR");
  });

  test("sanitizeReportContent redacts secrets recursively", () => {
    const raw = {
      title: "OK",
      notes: [
        "password = hunter2",
        "apiKey: abcd1234",
        "mongodb+srv://user:pass@cluster.example.com/db",
        "client_secret=\"zzz\"",
        "token=12345",
        "-----BEGIN RSA PRIVATE KEY-----\nAAAA\n-----END RSA PRIVATE KEY-----",
        "url https://user:hunter2@example.com/db",
      ],
      nested: { connectionString: "postgres://u:p@host/db" },
    };
    const clean = sanitizeReportContent(raw);
    const joined = JSON.stringify(clean);
    assert.ok(!joined.includes("hunter2"));
    assert.ok(!joined.includes("abcd1234"));
    assert.ok(!joined.includes("cluster.example.com"));
    assert.ok(!joined.includes("zzz"));
    assert.ok(!joined.includes("12345"));
    assert.ok(!joined.includes("AAAA"));
    assert.ok(!joined.includes("[REDACTED]") || joined.includes("REDACTED"));
    assert.equal(clean.title, "OK");
  });

  test("normalized content is always redacted", () => {
    const content = normalizeReportContent("invoice", {
      introduction: "Use password = hunter2 when logging in",
    });
    assert.ok(!JSON.stringify(content).includes("hunter2"));
  });
});

describe("reports service — document numbering", () => {
  test("produces sequential, formatted numbers per type and year", async () => {
    const a = await nextDocumentNumber("invoice");
    const b = await nextDocumentNumber("invoice");
    assert.equal(a, `INV-${new Date().getUTCFullYear()}-001`);
    assert.equal(b, `INV-${new Date().getUTCFullYear()}-002`);
    const q = await nextDocumentNumber("quotation");
    assert.match(q, /^QUO-\d{4}-00\d$/);
    assert.ok(!q.includes("INV"));
  });

  test("rejects unknown prefixes", async () => {
    await assert.rejects(nextDocumentNumber("receipt"), (err) => err instanceof ReportServiceError && err.status === 400);
  });
});

describe("reports service — create & list", () => {
  test("creates a draft with auto document number", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    assert.ok(report._id);
    assert.equal(report.status, "draft");
    assert.equal(report.version, 0);
    assert.match(report.docNumber, /^INV-\d{4}-\d{3}$/);
    assert.equal(report.title, "Payment Invoice");
    assert.equal(report.hasFile, false);
  });

  test("persists assigned project name from projectId", async () => {
    const project = seedProject("ReportingProject");
    const report = await createReport({
      user,
      data: { documentType: "quotation", projectId: String(project._id), content: validContent({ title: "Quotation" }) },
    });
    assert.equal(report.projectName, "ReportingProject");
    assert.equal(report.projectId, String(project._id));
  });

  test("listReports is scoped to the requesting user", async () => {
    await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await createReport({ user: otherUser, data: { documentType: "invoice", content: validContent() } });
    const mine = await listReports({ user });
    const theirs = await listReports({ user: otherUser });
    assert.equal(mine.length, 1);
    assert.equal(theirs.length, 1);
    assert.ok(mine.every((r) => r.userId === user.uid));
    assert.ok(theirs.every((r) => r.userId === otherUser.uid));
  });

  test("listReports filters by type and status", async () => {
    const invoice = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await createReport({ user, data: { documentType: "proposal", content: validContent({ title: "Proposal" }) } });
    const byType = await listReports({ user, filters: { documentType: "invoice" } });
    assert.equal(byType.length, 1);
    assert.equal(byType[0]._id, invoice._id);
    const byStatus = await listReports({ user, filters: { status: "draft" } });
    assert.ok(byStatus.every((r) => r.status === "draft"));
  });
});

describe("reports service — ownership & authorization", () => {
  test("getReport rejects reports owned by other users", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await assert.rejects(
      getReport({ user: otherUser, id: report._id }),
      (err) => err instanceof ReportServiceError && err.status === 404
    );
    const mine = await getReport({ user, id: report._id });
    assert.equal(mine._id, report._id);
  });

  test("getReport 404s for missing or malformed ids", async () => {
    await assert.rejects(
      getReport({ user, id: "no-such-id" }),
      (err) => err instanceof ReportServiceError && err.status === 404
    );
  });

  test("updateReportContent blocks other users and archived reports", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await assert.rejects(
      updateReportContent({ user: otherUser, id: report._id, content: validContent() }),
      (err) => err instanceof ReportServiceError && err.status === 404
    );
    const archived = await setReportStatus({ user, id: report._id, status: "archived" });
    assert.equal(archived.status, "archived");
    await assert.rejects(
      updateReportContent({ user, id: report._id, content: validContent() }),
      (err) => err instanceof ReportServiceError && err.status === 400
    );
  });

  test("deleteReport removes only the owner's report", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await assert.rejects(
      deleteReport({ user: otherUser, id: report._id }),
      (err) => err instanceof ReportServiceError && err.status === 404
    );
    const result = await deleteReport({ user, id: report._id });
    assert.equal(result.ok, true);
    await assert.rejects(getReport({ user, id: report._id }), (err) => err.status === 404);
  });

  test("setReportStatus validates status values", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await assert.rejects(
      setReportStatus({ user, id: report._id, status: "pending" }),
      (err) => err instanceof ReportServiceError && err.status === 400
    );
  });
});

describe("reports service — PDF generation & versioning", () => {
  test("generateReportPdf produces a valid PDF buffer and version 1", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    const generated = await generateReportPdf({ user, id: report._id });
    assert.equal(generated.status, "generated");
    assert.equal(generated.pdfVersion, 1);
    assert.equal(generated.version, 1);
    assert.equal(generated.hasFile, true);
    assert.ok(generated.fileSize > 0);

    const file = await getReportFile({ user, id: report._id });
    assert.equal(file.mime, "application/pdf");
    assert.ok(Buffer.isBuffer(file.buffer));
    assert.ok(file.buffer.length > 0);
    assert.equal(file.buffer.subarray(0, 8).toString(), "%PDF-1.4");
    assert.ok(file.buffer.toString("latin1").trimEnd().endsWith("%%EOF"));
  });

  test("versioning increments and never overwrites history", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await generateReportPdf({ user, id: report._id });
    const second = await generateReportPdf({ user, id: report._id });
    assert.equal(second.pdfVersion, 2);
    assert.equal(second.version, 2);
    assert.ok(second.versionHistory.length >= 2, "versionHistory should accumulate");
    const versions = second.versionHistory.map((h) => h.version);
    assert.deepEqual([...versions].sort(), [...versions]);
  });

  test("regenerating after edits produces a new PDF and keeps full history", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await generateReportPdf({ user, id: report._id });
    const file1 = await getReportFile({ user, id: report._id });

    await updateReportContent({
      user,
      id: report._id,
      content: validContent({
        title: "Payment Invoice v2",
        items: [{ description: "Edited deliverable", qty: 3, unitPrice: 12000 }],
        pricing: { subtotal: 36000, total: 36000, currency: "LKR" },
      }),
    });
    const v2 = await generateReportPdf({ user, id: report._id });

    assert.equal(v2.pdfVersion, 2);
    assert.equal(v2.version, 2);
    assert.equal(v2.versionHistory.length, 2);
    const file2 = await getReportFile({ user, id: report._id });
    assert.notDeepEqual(file1.buffer, file2.buffer, "edited content should produce a different PDF");
  });

  test("generateReportPdf is owner-scoped and blocked for archived reports", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await assert.rejects(
      generateReportPdf({ user: otherUser, id: report._id }),
      (err) => err instanceof ReportServiceError && err.status === 404
    );
    await setReportStatus({ user, id: report._id, status: "archived" });
    await assert.rejects(
      generateReportPdf({ user, id: report._id }),
      (err) => err instanceof ReportServiceError && err.status === 400
    );
  });

  test("getReportFile returns 400 when no PDF exists yet", async () => {
    const report = await createReport({ user, data: { documentType: "invoice", content: validContent() } });
    await assert.rejects(
      getReportFile({ user, id: report._id }),
      (err) => err instanceof ReportServiceError && err.status === 400
    );
  });
});

describe("reports service — project data aggregation", () => {
  test("buildReportData resolves a project and returns sanitized stats", async () => {
    const project = seedProject("AggregateMe", {
      budget: 250000,
      projectCost: 100000,
      description: "Build a site",
      tags: ["web"],
    });
    const { resolvedProjectId, data } = await buildReportData({ user, projectId: String(project._id) });
    assert.equal(resolvedProjectId, String(project._id));
    assert.equal(data.project.name, "AggregateMe");
    assert.equal(data.project.budget, 250000);
    assert.equal(data.stats.taskCount, 0);
    assert.equal(data.expenses.estimatedTotal, 100000);
  });

  test("buildReportData resolves project by name and 404s for unknown", async () => {
    const project = seedProject("ByName");
    const { resolvedProjectId } = await buildReportData({ user, projectName: "ByName" });
    assert.equal(resolvedProjectId, String(project._id));
    await assert.rejects(
      buildReportData({ user, projectName: "Missing" }),
      (err) => err instanceof ReportServiceError && err.status === 404
    );
  });

  test("buildReportData returns empty data when no project", async () => {
    const { project, data } = await buildReportData({ user });
    assert.equal(project, null);
    assert.deepEqual(data, {});
  });
});

describe("reports service — AI-assisted drafting", () => {
  test("creates a draft report from AI content", async () => {
    const report = await generateReportDraftFromAI({ user, documentType: "invoice", notes: "Two line items" });
    assert.equal(report.status, "draft");
    assert.equal(report.documentType, "invoice");
    assert.equal(report.title, "AI Draft Invoice");
    assert.equal(report.version, 0);
    assert.ok(report.docNumber);
    assert.equal(report.content.items[0].description, "Web design");
  });

  test("AI draft content is normalized and redacted", async () => {
    const report = await generateReportDraftFromAI({
      user,
      documentType: "invoice",
      notes: "include SECRET_CRED in notes",
    });
    assert.ok(!JSON.stringify(report.content).includes("hunter2"));
    assert.ok(!JSON.stringify(report.content).includes("SECRET_CRED"));
    assert.ok(!JSON.stringify(report.content).includes("secretcred"));
  });

  test("AI draft accepts a manual with sections", async () => {
    const report = await generateReportDraftFromAI({ user, documentType: "manual" });
    assert.equal(report.documentType, "manual");
    assert.equal(report.title, "Project Manual");
    assert.equal(report.content.sections.length, 1);
  });

  test("rejects unknown types before calling the AI", async () => {
    await assert.rejects(
      generateReportDraftFromAI({ user, documentType: "receipt" }),
      (err) => err instanceof ReportServiceError && err.status === 400
    );
  });

  test("wraps AI failures into a 502 service error", async () => {
    await assert.rejects(
      generateReportDraftFromAI({ user, documentType: "proposal", notes: "FAIL_AI" }),
      (err) => err instanceof ReportServiceError && err.status === 502
    );
  });
});
