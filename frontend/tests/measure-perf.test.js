import { test, describe, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { db, reset } from "./helpers/setup.js";
import { measure, dbOp, startTimer, endTimer, logPerf } from "../api/_lib/perf.js";

const { buildFinanceSummary } = await import("../api/_lib/finance.js");

function captureConsole() {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.join(" "));
  return {
    lines,
    restore() {
      console.log = original;
    },
  };
}

function seedTransactions() {
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    db.raw("transactions").push({
      _id: new ObjectId(),
      projectId: "none",
      type: i % 2 === 0 ? "expense" : "payment",
      amount: 1000 + i,
      paidBy: i % 3 === 0 ? "Pasindu" : "Chamara",
      paymentStatus: i % 2 === 0 ? "paid" : "pending",
      category: i % 2 === 0 ? "Hosting" : "Development",
      description: "transaction " + i,
      date: new Date(now.getFullYear(), 0, 1 + i),
      createdAt: now,
      updatedAt: now,
    });
  }
}

describe("performance instrumentation through real services", () => {
  beforeEach(() => {
    reset();
    delete process.env.ENABLE_PERFORMANCE_LOGGING;
  });

  test("service build is measured without breaking it (first + subsequent)", async () => {
    seedTransactions();

    const captured = captureConsole();
    process.env.ENABLE_PERFORMANCE_LOGGING = "true";
    try {
      const first = await measure("API_TOTAL /finance?summary=true (request 1)", () =>
        dbOp("transactions", "find", () => buildFinanceSummary())
      );
      const second = await measure("API_TOTAL /finance?summary=true (request 2)", () => buildFinanceSummary());
      assert.ok(first.totals.payment > 0);
      assert.equal(second.totals.payment, first.totals.payment);
      assert.equal(second.totals.expense, first.totals.expense);
    } finally {
      captured.restore();
      delete process.env.ENABLE_PERFORMANCE_LOGGING;
    }

    const perfLines = captured.lines.filter((line) => line.includes("[PERF]"));
    assert.ok(perfLines.length >= 2, "expected measured [PERF] lines");
    assert.ok(perfLines.some((l) => l.includes("/finance?summary=true (request 1)") && /\d+ms/.test(l)));
    assert.ok(perfLines.some((l) => l.includes("/finance?summary=true (request 2)") && /\d+ms/.test(l)));
    assert.ok(perfLines.some((l) => l.includes("collection=transactions") && l.includes("op=find")));
  });

  test("finance summary build is measured and returns identical totals", async () => {
    seedTransactions();
    const captured = captureConsole();
    process.env.ENABLE_PERFORMANCE_LOGGING = "true";
    let summary;
    try {
      summary = await measure("API_TOTAL /finance?summary=true", () => buildFinanceSummary());
    } finally {
      captured.restore();
      delete process.env.ENABLE_PERFORMANCE_LOGGING;
    }

    assert.ok(summary.totals.payment > 0);
    assert.ok(summary.totals.expense > 0);
    assert.ok(captured.lines.some((l) => l.includes("[PERF]") && l.includes("/finance?summary=true")));
  });

  test("timers produce sane monotonic durations", async () => {
    const start = startTimer();
    await new Promise((resolve) => setTimeout(resolve, 2));
    const ms = endTimer(start);
    assert.ok(ms > 0);
    assert.ok(typeof ms === "number" && Number.isFinite(ms));
  });

  test("dbOp wraps a query and returns its value", async () => {
    const result = await dbOp("projects", "find", async () => [1, 2, 3]);
    assert.deepEqual(result, [1, 2, 3]);
  });

  test("logPerf is safe to call unconditionally", () => {
    assert.doesNotThrow(() => logPerf("API_START", "GET /api/projects"));
  });
});