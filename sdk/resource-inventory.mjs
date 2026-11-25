export function resourceInventory(records){
 if(!Array.isArray(records)||records.length>10000)throw Error("Invalid inventory");
 const seen=new Map();
 return records.map(r=>{
 if(!r||!["worker","d1","r2"].includes(r.kind)||!["staging","production"].includes(r.environment)||![r.application,r.resource_id].every(v=>typeof v==="string"&&/^[-a-zA-Z0-9_.:]{1,160}$/.test(v)))throw Error("Invalid resource");
 const key=r.kind+":"+r.resource_id;
 const previous=seen.get(key);
 seen.set(key,r.environment);
 return {application:r.application,kind:r.kind,resource_id:r.resource_id,environment:r.environment,warning:previous&&previous!==r.environment?"cross_environment_reuse":null,evidence:"supplied_inventory",live_verified:false};
 });
}
