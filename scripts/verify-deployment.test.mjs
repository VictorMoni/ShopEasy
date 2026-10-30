import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyDeployment } from './verify-deployment.mjs';

const revision = 'a'.repeat(40);
const options = { origin: 'https://example.com', revision, attempts: 2, sleep: async () => {} };
test('waits for the expected revision, then checks the storefront', async () => {
  let calls = 0;
  await verifyDeployment({ ...options, request: async () => {
    calls++;
    if (calls === 1) return Response.json({ revision: 'b'.repeat(40) });
    if (calls === 2) return Response.json({ revision });
    return new Response('<app-root></app-root>');
  } });
  assert.equal(calls, 3);
});
test('fails when an old revision remains live', async () => {
  await assert.rejects(verifyDeployment({ ...options, request: async () => Response.json({ revision: 'b'.repeat(40) }) }), /was not confirmed/);
});
test('fails when Render returns its HTML fallback instead of a revision', async () => {
  await assert.rejects(verifyDeployment({ ...options, request: async () => new Response('<html>fallback</html>') }), /was not confirmed/);
});
test('fails when revision matches but storefront is unavailable', async () => {
  await assert.rejects(verifyDeployment({ ...options, request: async url => String(url).includes('deployment.json') ? Response.json({ revision }) : new Response('Unavailable', { status: 503 }) }), /was not confirmed/);
});
