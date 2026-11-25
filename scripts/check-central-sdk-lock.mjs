import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,relative,isAbsolute} from "node:path";
import {realpathSync} from "node:fs";
const root=realpathSync(resolve(process.argv[2]||"."));
const lock=JSON.parse(readFileSync(resolve(root,"central-sdk-lock.json"),"utf8"));
if(!Array.isArray(lock.files)||!lock.files.length||lock.files.length>200)throw Error("Invalid SDK lock");
for(const f of lock.files){
 if(!/^vendor\/[a-z0-9-]+\/[a-zA-Z0-9_.-]+$/.test(f.path)||!/^amaechiu-del\/[A-Za-z0-9_.-]+$/.test(f.repository)||! /^[a-f0-9]{40}$/.test(f.commit)||! /^[a-f0-9]{64}$/.test(f.sha256))throw Error("Invalid lock entry");
 const path=realpathSync(resolve(root,f.path)),rel=relative(root,path);
 if(rel.startsWith("..")||isAbsolute(rel))throw Error("SDK outside application");
 if(createHash("sha256").update(readFileSync(path)).digest("hex")!==f.sha256)throw Error("SDK digest mismatch: "+f.path);
}
console.log("Local SDK digests match lock; upstream provenance requires independent verification.");
