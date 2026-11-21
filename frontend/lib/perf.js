// Reusable, developer-safe performance instrumentation.
//
// Enabled with ENABLE_PERFORMANCE_LOGGING=true|1. When disabled, all helpers are
// no-ops with negligible overhead. Instrumentation NEVER throws and NEVER logs
// sensitive values (credentials, tokens, connection strings, query documents) —
// only durations and safe identifiers like collection/operation names.

const ENABLED_FLAG = "ENABLE_PERFORMANCE_LOGGING";

export function perfEnabled() {
  try {
    const value = process.env[ENABLED_FLAG];
    return value === "true" || value === "1";
  } catch {
    return false;
  }
}

export function startTimer() {
  return process.hrtime.bigint();
}

export function endTimer(start) {
  try {
    return Number(process.hrtime.bigint() - start) / 1e6;
  } catch {
    return 0;
  }
}

export function logPerf(...parts) {
  if (!perfEnabled()) return;
  try {
    console.log(`[PERF] ${parts.join(" ")}`);
  } catch {
    // Never let logging break an API request.
  }
}

export function roundMs(value) {
  const ms = Number.isFinite(value) ? value : 0;
  return `${ms >= 10 ? ms.toFixed(0) : ms.toFixed(1)}ms`;
}

// Runs fn and logs its duration under `label`. Safe: failures of logging are
// swallowed and never alter the returned value or thrown errors.
export async function measure(label, fn) {
  const start = startTimer();
  try {
    return await fn();
  } finally {
    logPerf(`${label}: ${roundMs(endTimer(start))}`);
  }
}

// Runs a database operation and logs only safe information: collection name,
// operation name, and duration. The query document/filters are never logged.
export async function dbOp(collection, op, fn) {
  const start = startTimer();
  try {
    return await fn();
  } finally {
    logPerf(`[DB] collection=${collection} op=${op} duration=${roundMs(endTimer(start))}`);
  }
}

// Extracts a safe collection name from a Mongo command event. Only the string
// value that Mongo uses as the collection argument is returned; the rest of the
// command (filters, values) is never touched. Falls back to the command name.
export function safeCommandTarget(event) {
  try {
    const command = event?.command;
    const name = event?.commandName;
    if (!command || !name || typeof command !== "object") return name || "unknown";
    const target = command[name];
    if (typeof target === "string") return target;
    if (Array.isArray(target)) {
      const names = target.map((item) => (item && typeof item === "object" && item?.collection ? item.collection : null)).filter(Boolean);
      return names.length ? names.join(",") : name;
    }
    return name;
  } catch {
    return event?.commandName || "unknown";
  }
}
