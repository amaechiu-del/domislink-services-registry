import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const require = createRequire(import.meta.url);
const packagePath = require.resolve('wrangler/package.json');
const wrangler = resolve(dirname(packagePath), require(packagePath).bin.wrangler);
const template = JSON.parse(await readFile(new URL('wrangler.staging.example.jsonc', root), 'utf8'));
const gateway = new URL(process.env.ONELINK_STAGING_ORIGIN ?? '');
assert.equal(gateway.protocol, 'https:');
assert.equal(gateway.origin, process.env.ONELINK_STAGING_ORIGIN);
assert.match(gateway.hostname, /^domislink-sso-registry-staging\.[a-z0-9-]+\.workers\.dev$/);

const database = template.d1_databases[0];
assert.equal(database.database_name, 'domislink-services-registry-staging-db');
assert.equal(template.name, 'domislink-services-registry-staging');
assert(!template.route && !template.routes, 'Staging template must not claim a custom route');

const inventory = spawnSync(process.execPath, [wrangler, 'd1', 'list', '--json'], {
  cwd: fileURLToPath(root),
  encoding: 'utf8',
  timeout: 30_000
});
if (inventory.error || inventory.status !== 0) {
  throw new Error('Could not list Cloudflare D1 databases. Check Wrangler authentication and the selected account.');
}
const databases = JSON.parse(inventory.stdout);
assert(Array.isArray(databases), 'Unexpected Wrangler D1 inventory response');
const candidates = databases.filter(item => item.name === database.database_name);
assert(candidates.length <= 1, 'Multiple matching staging databases. Verify the Cloudflare account.');
if (!candidates.length) {
  console.log(`Missing: ${database.database_name}. No configuration generated.`);
  process.exitCode = 1;
} else {
  assert.match(candidates[0].uuid, /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i);
  database.database_id = candidates[0].uuid;
  template.vars.SSO_ISSUER = gateway.origin;
  template.vars.SSO_JWKS_URL = new URL('/oauth/jwks', gateway).href;
  const output = 'wrangler.staging.local.jsonc';
  await writeFile(new URL(output, root), JSON.stringify(template, null, 2) + '\n', { flag: 'wx' });
  console.log(`Reused ${database.database_name}. Generated ${output} for local deployment use.`);
}
