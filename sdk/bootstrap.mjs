import {mkdir,writeFile,readFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {createIntegrationManifest,assessIntegrationManifest} from "./integrations.mjs";

/** Create an integration plan; no network calls, credentials, or deployment. */
export function planBootstrap(options){
 const manifest=createIntegrationManifest(options);
 const readiness=assessIntegrationManifest(manifest);
 return {manifest,readiness,files:[{path:".domislink/integrations.json",content:JSON.stringify(manifest,null,2)+"\n"},{path:".domislink/readiness.json",content:JSON.stringify(readiness,null,2)+"\n"}]};
}
export async function bootstrapApplication(root,options,{dryRun=true}={}){
 if(typeof root!=="string"||!root.trim())throw new TypeError("Target directory required");
 const target=resolve(root);
 const plan=planBootstrap(options);
 if(dryRun)return {...plan,dryRun:true,written:[]};
 // Never overwrite existing integration files: manual review is required.
 const folder=join(target,".domislink");
 await mkdir(folder,{recursive:true});
 const written=[];
 for(const file of plan.files){
  const location=join(target,file.path);
  await writeFile(location,file.content,{flag:"wx",mode:0o600});
  written.push(file.path);
 }
 return {...plan,dryRun:false,written};
}
export async function inspectExisting(root){
 const content=await readFile(join(resolve(root),".domislink/integrations.json"),"utf8");
 return assessIntegrationManifest(JSON.parse(content));
}
