import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Miniflare} from 'miniflare';

// Miniflare provides Cloudflare's local D1 implementation; no remote account needed.
test('D1 batch rolls back service creation when audit insertion fails',async()=>{
  const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-11-01',d1Databases:['DB']});
  try{
    const db=await mf.getD1Database('DB');
    const schema=readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8');
    await db.exec(schema);
    const mutation=db.prepare('INSERT INTO services (id,name,category) VALUES (?,?,?)').bind('rollback-case','Rollback Test','Platform');
    const invalidAudit=db.prepare('INSERT INTO audit_events (id,actor_sub,action,target_id) VALUES (?,?,?,?)').bind('audit-rollback','operator-1',null,'rollback-case');
    await assert.rejects(db.batch([mutation,invalidAudit]));
    const row=await db.prepare('SELECT id FROM services WHERE id=?').bind('rollback-case').first();
    assert.equal(row,null,'service must not persist without audit');
    await db.batch([
      db.prepare('INSERT INTO services (id,name,category) VALUES (?,?,?)').bind('committed','Committed Test','Platform'),
      db.prepare('INSERT INTO audit_events (id,actor_sub,action,target_id) VALUES (?,?,?,?)').bind('audit-ok','operator-1','service.created','committed')
    ]);
    assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM services WHERE id=?').bind('committed').first()).total,1);
    assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM audit_events WHERE target_id=?').bind('committed').first()).total,1);
  }finally{await mf.dispose()}
});
