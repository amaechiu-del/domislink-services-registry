import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import test from 'node:test';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import worker from '../src/index.js';

test('registry enforces the token audience, read scope and administrator permissions', async t => {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = { ...await exportJWK(publicKey), kid: 'registry-test', alg: 'RS256' };
  const server = createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ keys: [jwk] }));
  });
  server.listen(0, '127.0.0.1');
  t.after(() => server.close());
  await once(server, 'listening');

  const batches = [];
  const env = {
    SSO_ISSUER: 'https://sso.domislink.com',
    SSO_JWKS_URL: `http://127.0.0.1:${server.address().port}/jwks`,
    REGISTRY_AUDIENCE: 'domislink-central-services-registry',
    DB: {
      prepare: sql => ({
        bind: (...args) => ({ sql, args, all: async () => ({ results: [] }) })
      }),
      batch: async statements => batches.push(statements)
    }
  };
  const issue = (claims, audience = env.REGISTRY_AUDIENCE) => new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', kid: jwk.kid })
    .setIssuer(env.SSO_ISSUER)
    .setAudience(audience)
    .setSubject('test-user')
    .setExpirationTime('5m')
    .sign(privateKey);
  const request = (token, method = 'GET') => worker.fetch(new Request(
    'https://registry.example/v1/services',
    {
      method,
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: method === 'POST' ? JSON.stringify({ id: 'sample', name: 'Sample', category: 'test' }) : undefined
    }
  ), env);

  assert.equal((await request()).status, 401);
  assert.equal((await request('opaque-token')).status, 401);
  assert.equal((await request(await issue({ scope: 'services:read' }, 'another-app'))).status, 401);
  assert.equal((await request(await issue({ scope: 'openid' }))).status, 403);

  const reader = await issue({ scope: 'services:read' });
  assert.equal((await request(reader)).status, 200);
  assert.equal((await request(reader, 'POST')).status, 403);
  assert.equal((await request(await issue({ scope: 'services:write' }), 'POST')).status, 403);

  const admin = await issue({ scope: 'services:write', roles: ['domislink:services:admin'] });
  assert.equal((await request(admin, 'POST')).status, 201);
  assert.equal(batches.length, 1);
  assert.match(batches[0][0].sql, /INSERT INTO services/);
  assert.match(batches[0][1].sql, /INSERT INTO audit_events/);
});
