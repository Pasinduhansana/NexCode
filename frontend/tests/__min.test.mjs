import { test } from 'node:test';
import assert from 'node:assert/strict';
class FooError extends Error { constructor(m){ super(m); this.status = 400; } }
test('assert.rejects validator', async () => {
  await assert.rejects(async () => { throw new FooError('x'); }, (err) => { console.log('validator:', err instanceof FooError, err.status); return err instanceof FooError && err.status === 400; });
});
