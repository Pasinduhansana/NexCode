const store = new Map();
const DEFAULT_TTL = 10_000;
// Bound memory: evict least-recently-used entries beyond this (see cached()).
const MAX_ENTRIES = 200;

export async function cached(key, ttl, loader) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) {
    // Touch for LRU: delete + re-set moves the entry to the most-recent end.
    store.delete(key);
    store.set(key, hit);
    return hit.value;
  }

  const value = await loader();
  const entry = { value, expires: now + (ttl || DEFAULT_TTL) };
  if (store.has(key)) store.delete(key);
  store.set(key, entry);

  // Evict oldest entries (Map preserves insertion/touch order) to stay bounded.
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    store.delete(oldest);
  }
  return value;
}

export function invalidate(...prefixes) {
  if (prefixes.length === 0) {
    store.clear();
    return;
  }
  for (const key of [...store.keys()]) {
    if (prefixes.some((p) => key.startsWith(p))) store.delete(key);
  }
}

export function invalidateAll() {
  store.clear();
}

// Background sweep of expired entries so memory stays bounded even when the
// cache is written once and then never touched again. Global guard + unref()
// avoids leaking timers / keeping serverless instances alive.
if (typeof setInterval !== "undefined" && !globalThis.__cacheSweepTimer) {
  globalThis.__cacheSweepTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, hit] of store) {
      if (hit.expires <= now) store.delete(key);
    }
  }, 30_000);
  if (globalThis.__cacheSweepTimer && typeof globalThis.__cacheSweepTimer.unref === "function") {
    globalThis.__cacheSweepTimer.unref();
  }
}
