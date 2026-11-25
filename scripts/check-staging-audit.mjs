import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const configPath = new URL('wrangler.staging.local.jsonc', root);
const config = JSON.parse(await readFile(configPath, 'utf8'));
const database = config.d1_databases?.find(entry => entry.binding === 'DB');
assert.equal(config.name, 'domislink-services-registry-staging');
assert.equal(database?.database_name, 'domislink-services-registry-staging-db');
assert.match(database.database_id, /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i);
const id = process.argv[2] ?? '';
assert.match(id, /^acceptance-[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i,
  'Pass the staging fixture ID emitted by check-staging.mjs --write');

const require = createRequire(import.meta.url);
const manifest = require.resolve('wrangler/package.json');
const cli = resolve(dirname(manifest), require(manifest).bin.wrangler);
const result = spawnSync(process.execPath, [
  cli, 'd1', 'execute', database.database_name, '--config', fileURLToPath(configPath),
  '--remote', '--json', '--command',
  `SELECT COUNT(*) AS event_count FROM audit_events WHERE action = 'service.created' AND target_id = '${id}'`
], { cwd: fileURLToPath(root), encoding: 'utf8', timeout: 30_000 });

assert(!result.error && result.status === 0, 'Staging D1 query failed. Check Wrangler access and migrations.');
const [query] = JSON.parse(result.stdout);
assert.equal(query?.success, true);
assert.equal(query.results?.[0]?.event_count, 1, 'Expected exactly one service.created audit event');
console.log(`PASS: exactly one staging audit event for ${id}`);
