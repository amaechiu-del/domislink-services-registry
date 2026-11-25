import test from "node:test";
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
const schema=readFileSync(new URL("../migrations/0001_initial.sql",import.meta.url),"utf8");
const source=readFileSync(new URL("../src/index.js",import.meta.url),"utf8");
const update=source.match(/env\.DB\.prepare\("(UPDATE integration_approvals SET state=.*?)"\)/)?.[1];
const audit=source.match(/env\.DB\.prepare\("(INSERT INTO audit_events .*?WHERE changes\(\)=1)"\)/)?.[1];
assert.ok(update&&audit);
function fixture(){
 const db=new DatabaseSync(":memory:");
 db.exec(schema);
 db.exec("INSERT INTO services(id,name,category) VALUES ('test','Test','identity'); INSERT INTO integration_approvals(id,service_id,client_id,requested_scopes,state,requested_by) VALUES ('approval','test','client','[]','requested','alice')");
 return db;
}
function decide(db,state,actor,event="event"){
 db.exec("BEGIN");
 try{
 const previous=state==="revoked"?"approved":"requested";
 const r=db.prepare(update).run(state,actor,"approval",previous,actor);
 db.prepare(audit).run(event,actor,"approval."+state,"approval","{}");
 db.exec("COMMIT");return r.changes;
 }catch(e){db.exec("ROLLBACK");throw e;}
}
const state=db=>db.prepare("SELECT state FROM integration_approvals").get().state;
const count=db=>db.prepare("SELECT count(*) AS n FROM audit_events").get().n;
test("requester cannot approve own request",()=>{const db=fixture();assert.equal(decide(db,"approved","alice"),0);assert.equal(state(db),"requested");assert.equal(count(db),0);db.close();});
test("independent approval and revocation are audited",()=>{const db=fixture();assert.equal(decide(db,"approved","bob"),1);assert.equal(decide(db,"approved","bob","repeat"),0);assert.equal(decide(db,"revoked","carol","revoke"),1);assert.equal(state(db),"revoked");assert.equal(count(db),2);db.close();});
test("audit failure rolls back decision",()=>{const db=fixture();db.exec("INSERT INTO audit_events(id,actor_sub,action,target_id) VALUES ('event','test','test','test')");assert.throws(()=>decide(db,"approved","bob"));assert.equal(state(db),"requested");assert.equal(count(db),1);db.close();});
