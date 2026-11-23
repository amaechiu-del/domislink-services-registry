/** Dependency-free shared integration manifest for DomisLink apps. No credentials. */
export const CENTRES=Object.freeze({
 identity:{name:"OneLink",required:true},
 pwa:{name:"PWA Central",required:true},
 registry:{name:"Services Registry",required:true},
 branding:{name:"Branding Centre",required:true},
 audit:{name:"Audit Centre",required:true},
 deployment:{name:"Deployment Centre",required:true},
 payments:{name:"Paystack Central",required:false},
 messaging:{name:"Communications Centre",required:false},
 whatsapp:{name:"WhatsApp Command Centre",required:false},
 advertising:{name:"Advertising Studio",required:false},
 analytics:{name:"Analytics Centre",required:false},
 ai:{name:"AI Studio",required:false}
});
export function createIntegrationManifest({id,repository,origin,enabled=[]}={}){
 if(typeof id!=="string"||!/^[a-z][a-z0-9-]{1,63}$/.test(id))throw new TypeError("Invalid application ID");
 if(typeof repository!=="string"||!/^[\w.-]+\/[\w.-]+$/.test(repository))throw new TypeError("Invalid repository");
 let url;try{url=new URL(origin);}catch{throw new TypeError("Invalid HTTPS origin");}
 if(url.protocol!=="https:"||url.origin!==origin||url.username||url.password)throw new TypeError("Invalid HTTPS origin");
 if(!Array.isArray(enabled)||enabled.some(key=>!Object.hasOwn(CENTRES,key)))throw new TypeError("Unknown central integration");
 const selected=new Set([...Object.keys(CENTRES).filter(k=>CENTRES[k].required),...enabled]);
 return {schemaVersion:1,application:{id,repository,origin},integrations:Object.keys(CENTRES).map(key=>({key,required:CENTRES[key].required,enabled:selected.has(key),state:"unverified"}))};
}
export function assessIntegrationManifest(manifest){
 if(manifest?.schemaVersion!==1||!Array.isArray(manifest.integrations))return {ready:false,errors:["Invalid manifest"]};
 const errors=[];
 for(const key of Object.keys(CENTRES)){
  const rows=manifest.integrations.filter(x=>x.key===key);
  if(rows.length!==1)errors.push(`Missing or duplicate integration: ${key}`);
  else if(CENTRES[key].required&&!rows[0].enabled)errors.push(`Required integration disabled: ${key}`);
  else if(rows[0].enabled&&rows[0].state!=="verified")errors.push(`Integration not verified: ${key}`);
 }
 return {ready:errors.length===0,errors};
}
