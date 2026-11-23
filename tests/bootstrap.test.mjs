import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {bootstrapApplication,planBootstrap,inspectExisting} from "../sdk/bootstrap.mjs";
const app={id:"church",repository:"amaechiu-del/domislink-church",origin:"https://church.domislink.com",enabled:["messaging"]};
test("dry run reports pending integrations without writing",async()=>{
 const root=await mkdtemp(join(tmpdir(),"domislink-bootstrap-"));
 try{
  const result=await bootstrapApplication(root,app);
  assert.equal(result.dryRun,true);
  assert.equal(result.written.length,0);
  assert.equal(result.readiness.ready,false);
 }finally{await rm(root,{recursive:true,force:true});}
});
test("explicit write creates integration metadata without secrets or overwriting",async()=>{
 const root=await mkdtemp(join(tmpdir(),"domislink-bootstrap-"));
 try{
  const result=await bootstrapApplication(root,app,{dryRun:false});
  assert.equal(result.written.length,2);
  const manifest=await readFile(join(root,".domislink/integrations.json"),"utf8");
  assert.equal(JSON.parse(manifest).integrations.find(x=>x.key==="messaging").enabled,true);
  assert.equal((await inspectExisting(root)).ready,false);
  await assert.rejects(bootstrapApplication(root,app,{dryRun:false}),/EEXIST/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test("unknown centre fails closed",()=>assert.throws(()=>planBootstrap({...app,enabled:["paid-unknown"]})));
