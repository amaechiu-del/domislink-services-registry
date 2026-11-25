import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { getService, listServices } from '../src/catalog.js';

test('catalog filters and paginates against the existing schema', async () => {
  const sqlite = new DatabaseSync(':memory:');
  try {
    sqlite.exec(readFileSync(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8'));
    sqlite.exec(`
      INSERT INTO services (id, name, category, lifecycle, repository) VALUES
        ('hq', 'DomisLink', 'website', 'ready', 'example/headquarters'),
        ('portal', 'DomisLink', 'website', 'ready', NULL),
        ('identity', 'SSO', 'identity', 'development', NULL);
      INSERT INTO service_dependencies VALUES ('hq', 'identity');
      INSERT INTO health_observations (id, service_id, status, checked_at, detail) VALUES
        ('old', 'hq', 'down', '2026-11-24', NULL),
        ('new', 'hq', 'healthy', '2026-11-25', 'internal note');
    `);
    const db = {
      prepare(sql) {
        const stmt = sqlite.prepare(sql);
        return {
          bind(...args) {
            return {
              all: () => ({ results: stmt.all(...args) }),
              first: () => stmt.get(...args)
            };
          }
        };
      },
      batch: statements => Promise.all(statements.map(statement => statement.all()))
    };

    const query = new URLSearchParams('q=DOMIS&category=website&lifecycle=ready&environment=production&limit=1');
    const first = await listServices(db, query);
    assert.equal(first.services[0].id, 'hq');
    assert.equal(first.nextCursor, 'hq');
    query.set('cursor', first.nextCursor);
    const second = await listServices(db, query);
    assert.equal(second.services[0].id, 'portal');
    assert.equal(second.nextCursor, null);
    assert.equal((await listServices(db, new URLSearchParams('q=headquarters'))).services[0].id, 'hq');
    assert.equal((await listServices(db, new URLSearchParams('q=%25'))).services.length, 0);
    assert.equal(await listServices(db, new URLSearchParams('limit=0')), null);
    assert.equal(await listServices(db, new URLSearchParams('cursor=missing')), null);

    const detail = await getService(db, 'hq');
    assert.deepEqual(detail.dependencies.map(row => row.id), ['identity']);
    assert.deepEqual({ ...detail.health }, { status: 'healthy', checked_at: '2026-11-25' });
    assert.equal((await getService(db, 'portal')).health, null);
    assert.equal(await getService(db, 'missing'), null);
  } finally {
    sqlite.close();
  }
});
