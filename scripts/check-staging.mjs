import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const origin = new URL(process.env.REGISTRY_STAGING_ORIGIN ?? '');
assert.equal(origin.protocol, 'https:');
assert.equal(origin.origin, process.env.REGISTRY_STAGING_ORIGIN);
assert.match(origin.hostname, /^domislink-services-registry-staging\.[a-z0-9-]+\.workers\.dev$/);
const reader = process.env.REGISTRY_STAGING_READER_TOKEN;
const admin = process.env.REGISTRY_STAGING_ADMIN_TOKEN;
assert(reader && admin && reader !== admin, 'Set distinct staging reader and administrator tokens');

async function check(path, expected, { token, body } = {}) {
  const response = await fetch(new URL(path, origin), {
    method: body ? 'POST' : 'GET',
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  assert.equal(response.status, expected, `${body ? 'POST' : 'GET'} ${path}`);
  return response.json();
}

const services = '/v1/services';
assert.equal((await check('/health', 200)).ok, true);
await check(services, 401);
const listing = await check(`${services}?limit=1`, 200, { token: reader });
assert(Array.isArray(listing.services) && listing.services.length <= 1);
assert(listing.nextCursor === null || typeof listing.nextCursor === 'string');
await check(services, 403, {
  token: reader,
  body: { id: 'acceptance-reader-denial', name: 'Reader denial check', category: 'acceptance' }
});

if (process.argv.includes('--write')) {
  const id = `acceptance-${randomUUID()}`;
  const body = { id, name: 'Registry staging acceptance', category: 'acceptance' };
  assert.equal((await check(services, 201, { token: admin, body })).id, id);
  const result = await check(`${services}?q=${id}&category=acceptance`, 200, { token: reader });
  assert.deepEqual(result.services.map(service => service.id), [id]);
  const detail = await check(`${services}/${id}`, 200, { token: reader });
  assert.equal(detail.service.id, id);
  assert.deepEqual(detail.dependencies, []);
  assert.equal(detail.health, null);
  console.log(`Created staging fixture ${id}. Verify its service.created event in staging D1.`);
}

console.log('Registry staging acceptance checks passed.');
