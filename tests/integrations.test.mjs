import test from "node:test";
import assert from "node:assert/strict";
import {createIntegrationManifest,assessIntegrationManifest} from "../sdk/integrations.mjs";
const input={id:"church",repository:"amaechiu-del/domislink-church",origin:"https://church.domislink.com"};
test("default integrations include central essentials but no optional billing",()=>{
 const m=createIntegrationManifest(input);
 assert.equal(m.integrations.find(x=>x.key==="identity").enabled,true);
 assert.equal(m.integrations.find(x=>x.key==="payments").enabled,false);
 assert.equal(m.integrations.every(x=>x.state==="unverified"),true);
 assert.equal(assessIntegrationManifest(m).ready,false);
});
test("optional integrations are explicit",()=>{
 const m=createIntegrationManifest({...input,enabled:["payments","whatsapp"]});
 assert.equal(m.integrations.find(x=>x.key==="payments").enabled,true);
});
test("rejects invalid origins and unknown centres",()=>{
 assert.throws(()=>createIntegrationManifest({...input,origin:"http://church.domislink.com"}));
 assert.throws(()=>createIntegrationManifest({...input,enabled:["unknown"]}));
});
test("verified required integrations satisfy policy",()=>{
 const m=createIntegrationManifest(input);
 m.integrations.forEach(x=>{if(x.enabled)x.state="verified";});
 assert.equal(assessIntegrationManifest(m).ready,true);
});
