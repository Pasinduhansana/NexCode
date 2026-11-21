// Opt-in client-side performance logging. Enabled by running in the browser
// console: localStorage.setItem("nexcode.perf", "1"). When disabled this module
// is a no-op. Logs are written to the console as [PERF][CLIENT] and never touch
// application state.

const KEY = "nexcode.perf";

export function clientPerfEnabled() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function clientLog(...parts) {
  if (!clientPerfEnabled()) return;
  try {
    console.log(`[PERF][CLIENT] ${parts.join(" ")}`);
  } catch {
    // never break the UI
  }
}

export function measureClient(label, fn) {
  const start = performance.now();
  try {
    return fn();
  } finally {
    clientLog(`${label}: ${Math.round(performance.now() - start)}ms`);
  }
}

export async function measureClientAsync(label, fn) {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    clientLog(`${label}: ${Math.round(performance.now() - start)}ms`);
  }
}
