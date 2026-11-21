import { test, describe, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { seedProject, reset, newUser } from "./helpers/setup.js";

mock.module("../lib/api-handlers/_lib/gemini.js", {
  namedExports: {
    generateReportContent: async ({ prompt }) => ({
      title: "Tool Draft Invoice",
      subtitle: "Drafted by the assistant",
      client: { name: "Tool Client" },
      items: [{ description: "Design", qty: 1, unitPrice: 50000 }],
      pricing: { subtotal: 50000, total: 50000, currency: "LKR" },
      notes: ["Prepared with care"],
      ...(prompt?.documentType === "manual"
        ? { title: "Tool Manual", sections: [{ heading: "Scope", body: "Deliverables" }] }
        : {}),
    }),
  },
});

const {
  getTool,
  getToolNames,
  getToolCategories,
} = await import("../lib/api-handlers/_lib/tools/registry.js");

const user = newUser();

beforeEach(() => reset());

async function createInvoice() {
  const draft = await getTool("generateReportDraft").handler({ documentType: "invoice" }, { user });
  return draft.report;
}

describe("reporting AI tools in the tool registry", () => {
  test("registers all reporting tools with correct categories", () => {
    const names = getToolNames();
    for (const tool of ["getReports", "generateReportDraft", "generateReportPdf", "deleteReport"]) {
      assert.ok(names.includes(tool), `missing tool ${tool}`);
    }
    const categories = new Map(getToolCategories().map((c) => [c.name, c.category]));
    assert.equal(categories.get("getReports"), "READ_ONLY");
    assert.equal(categories.get("generateReportDraft"), "WRITE");
    assert.equal(categories.get("generateReportPdf"), "WRITE");
    assert.equal(categories.get("deleteReport"), "DESTRUCTIVE");
  });

  test("getReports lists the current user's reports and applies type filters", async () => {
    const report = await createInvoice();
    const all = await getTool("getReports").handler({}, { user });
    assert.equal(all.success, true);
    assert.ok(all.reports.some((r) => r._id === report._id));

    const filtered = await getTool("getReports").handler({ documentType: "invoice" }, { user });
    assert.equal(filtered.reports.length, 1);
    assert.equal(filtered.reports[0]._id, report._id);

    const none = await getTool("getReports").handler({ documentType: "quotation" }, { user });
    assert.equal(none.reports.length, 0);
  });

  test("generateReportDraft creates a draft (no PDF yet)", async () => {
    const project = seedProject("ToolReportProject");
    const result = await getTool("generateReportDraft").handler(
      { documentType: "invoice", searchProject: "ToolReportProject", notes: "Net 30 terms" },
      { user }
    );
    assert.equal(result.status, "draft_created");
    assert.equal(result.report.status, "draft");
    assert.equal(result.report.title, "Tool Draft Invoice");
    assert.equal(result.report.projectId, String(project._id));
  });

  test("generateReportDraft supports manual documents", async () => {
    const result = await getTool("generateReportDraft").handler({ documentType: "manual" }, { user });
    assert.equal(result.report.documentType, "manual");
    assert.equal(result.report.content.sections.length, 1);
  });

  test("generateReportPdf requires confirmation before generating", async () => {
    const report = await createInvoice();

    const first = await getTool("generateReportPdf").handler(
      { reportId: report._id },
      { user, requestId: "turn-1" }
    );
    assert.equal(first.status, "confirmation_required");

    const stillDraft = await getTool("getReports").handler({ documentType: "invoice" }, { user });
    const pendingReport = stillDraft.reports.find((r) => r._id === report._id);
    assert.equal(pendingReport.status, "draft", "no PDF should be generated before confirmation");

    await assert.rejects(
      getTool("generateReportPdf").handler(
        { reportId: report._id, confirmed: true },
        { user, requestId: "turn-1" }
      ),
      (err) => err.expose === true && /same message/i.test(err.message)
    );

    const done = await getTool("generateReportPdf").handler(
      { reportId: report._id, confirmed: true },
      { user, requestId: "turn-2" }
    );
    assert.equal(done.status, "generated");
    assert.equal(done.report.version, 1);
    assert.equal(done.report.hasFile, true);
  });

  test("generateReportPdf cancel path generates nothing", async () => {
    const report = await createInvoice();
    const first = await getTool("generateReportPdf").handler(
      { reportId: report._id },
      { user, requestId: "turn-1" }
    );
    assert.equal(first.status, "confirmation_required");
    const cancelled = await getTool("generateReportPdf").handler(
      { reportId: report._id, confirmed: false },
      { user }
    );
    assert.equal(cancelled.status, "cancelled");
    const updated = await getTool("getReports").handler({ documentType: "invoice" }, { user });
    assert.ok(updated.reports.every((r) => r.status !== "generated"));
  });

  test("deleteReport requires confirmation and then deletes", async () => {
    const report = await createInvoice();

    const first = await getTool("deleteReport").handler({ reportId: report._id }, { user, requestId: "turn-1" });
    assert.equal(first.status, "confirmation_required");

    const stillThere = await getTool("getReports").handler({ documentType: "invoice" }, { user });
    assert.equal(stillThere.reports.length, 1, "report must not be deleted before confirmation");

    const done = await getTool("deleteReport").handler(
      { reportId: report._id, confirmed: true },
      { user, requestId: "turn-2" }
    );
    assert.equal(done.status, "completed");

    const after = await getTool("getReports").handler({ documentType: "invoice" }, { user });
    assert.equal(after.reports.length, 0, "report should be deleted after confirmation");
  });
});
