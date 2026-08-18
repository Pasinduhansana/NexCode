const store = new Map();
const DEFAULT_TTL = 10_000;

export async function cached(key, ttl, loader) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value;
  const value = await loader();
  store.set(key, { value, expires: now + (ttl || DEFAULT_TTL) });
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
