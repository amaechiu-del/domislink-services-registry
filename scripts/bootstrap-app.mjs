#!/usr/bin/env node
import {bootstrapApplication} from "../sdk/bootstrap.mjs";
const args=process.argv.slice(2);
const get=(flag)=>{const i=args.indexOf(flag);return i>=0?args[i+1]:undefined;};
const root=get("--target"),id=get("--id"),repository=get("--repository"),origin=get("--origin");
const enabled=(get("--enable")||"").split(",").map(s=>s.trim()).filter(Boolean);
const write=args.includes("--write");
if(!root||!id||!repository||!origin){
 console.error("Usage: node scripts/bootstrap-app.mjs --target <folder> --id <id> --repository <owner/repo> --origin <https-origin> [--enable payments,messaging] [--write]");
 process.exitCode=2;
}else{
 try{
  const result=await bootstrapApplication(root,{id,repository,origin,enabled},{dryRun:!write});
  console.log(JSON.stringify({dryRun:result.dryRun,written:result.written,manifest:result.manifest,readiness:result.readiness},null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
