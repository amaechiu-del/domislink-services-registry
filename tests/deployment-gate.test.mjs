import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
test('Worker binds only the registry D1 database',()=>{assert.equal(config.d1_databases.length,1);assert.equal(config.d1_databases[0].binding,'DB');assert.equal(config.d1_databases[0].database_name,'domislink-central-services-db')});
test('uses dedicated registry audience and existing SSO authority',()=>{assert.equal(config.vars.SSO_ISSUER,'https://sso.domislink.com');assert.equal(config.vars.REGISTRY_AUDIENCE,'domislink-central-services-registry')});
test('database placeholder is explicitly blocked from deployment',()=>{const script=readFileSync(new URL('../scripts/check-deployment.mjs',import.meta.url),'utf8');assert.match(script,/Real D1 database UUID required/);assert.match(script,/process\.exitCode=1/)});
