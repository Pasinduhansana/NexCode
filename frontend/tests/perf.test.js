import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  perfEnabled,
  startTimer,
  endTimer,
  logPerf,
  roundMs,
  measure,
  dbOp,
  safeCommandTarget,
} from "../api/_lib/perf.js";

describe("perf instrumentation utility", () => {
  test("is disabled by default (no env flag)", () => {
    delete process.env.ENABLE_PERFORMANCE_LOGGING;
    assert.equal(perfEnabled(), false);
  });

  test("is enabled when the env flag is set", () => {
    process.env.ENABLE_PERFORMANCE_LOGGING = "true";
    assert.equal(perfEnabled(), true);
    process.env.ENABLE_PERFORMANCE_LOGGING = "1";
    assert.equal(perfEnabled(), true);
    delete process.env.ENABLE_PERFORMANCE_LOGGING;
  });

  test("logPerf never throws even with broken parts", () => {
    assert.doesNotThrow(() => logPerf("a", undefined, null, () => {}));
  });

  test("startTimer/endTimer measure elapsed ms", async () => {
    const start = startTimer();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const ms = endTimer(start);
    assert.ok(ms >= 4, `expected >=4ms, got ${ms}`);
  });

  test("roundMs formats values", () => {
    assert.equal(roundMs(12.3), "12ms");
    assert.equal(roundMs(3.25), "3.3ms");
    assert.equal(roundMs(NaN), "0.0ms");
  });

  test("measure returns the value and does not swallow errors", async () => {
    const value = await measure("t", async () => 42);
    assert.equal(value, 42);
    await assert.rejects(measure("t", async () => {
      throw new Error("boom");
    }), /boom/);
  });

  test("dbOp returns the value", async () => {
    const value = await dbOp("projects", "find", () => ({ ok: true }));
    assert.deepEqual(value, { ok: true });
  });

  test("safeCommandTarget extracts only the collection name, never query data", () => {
    const secret = { password: "hunter2", apiKey: "abcd", uri: "mongodb://u:p@host/db" };
    const find = safeCommandTarget({
      commandName: "find",
      command: { find: "projects", filter: secret },
    });
    assert.equal(find, "projects");
    assert.ok(!JSON.stringify(find).includes("hunter2"));

    const aggregate = safeCommandTarget({
      commandName: "aggregate",
      command: { aggregate: "transactions", pipeline: [secret] },
    });
    assert.equal(aggregate, "transactions");
    assert.ok(!JSON.stringify(aggregate).includes("hunter2"));

    const commandMissing = safeCommandTarget({ commandName: "ping", command: undefined });
    assert.equal(commandMissing, "ping");

    const batch = safeCommandTarget({
      commandName: "insert",
      command: { insert: "activities", documents: [secret] },
    });
    assert.equal(batch, "activities");
    assert.ok(!JSON.stringify(batch).includes("abcd"));
  });

  test("enabled logging emits [PERF] lines containing only safe data", () => {
    const lines = [];
    const original = console.log;
    console.log = (...args) => lines.push(args.join(" "));
    try {
      process.env.ENABLE_PERFORMANCE_LOGGING = "true";
      logPerf("[DB]", "collection=activities", "op=find", "duration=12ms");
      logPerf("DB_CONNECT_START");
      logPerf("DB_CONNECT_END", "fresh", "4200ms");
    } finally {
      console.log = original;
      delete process.env.ENABLE_PERFORMANCE_LOGGING;
    }
    assert.equal(lines.length, 3);
    assert.ok(lines[0].includes("[PERF]"));
    assert.ok(lines[0].includes("collection=activities"));
    assert.ok(lines[0].includes("op=find"));
    assert.ok(lines[2].includes("DB_CONNECT_END"));
    assert.ok(!lines.join("\n").includes("undefined"));
  });

  test("disabled logging produces no output", () => {
    const lines = [];
    const original = console.log;
    console.log = (...args) => lines.push(args.join(" "));
    try {
      delete process.env.ENABLE_PERFORMANCE_LOGGING;
      logPerf("[DB]", "collection=projects", "op=find", "duration=1ms");
    } finally {
      console.log = original;
    }
    assert.equal(lines.length, 0);
  });
});
