export async function emailPreflight(binding,{app,audience}){
 if(!binding||typeof binding.fetch!=="function")throw Error("Communications binding required");
 if(typeof app!=="string"||typeof audience!=="string"||!/^[-a-zA-Z0-9_]{1,120}$/.test(app)||!/^[-a-zA-Z0-9_]{1,120}$/.test(audience))throw Error("Invalid audience");
 const r=await binding.fetch(new Request("https://communications.internal/v1/email/consent/preflight",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({app,audience,channel:"email"})}));
 if(!r.ok)throw Error("Consent preflight unavailable");
 const v=await r.json();
 if(v.app!==app||v.audience!==audience||![v.total,v.eligible,v.unsubscribed].every(n=>Number.isSafeInteger(n)&&n>=0)||v.eligible+v.unsubscribed>v.total)throw Error("Invalid consent response");
 return {app,audience,total:v.total,eligible:v.eligible,unsubscribed:v.unsubscribed,delivery_authorized:false};
}
