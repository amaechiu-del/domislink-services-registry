const required=["tests","tenant_isolation","authentication","database_migration","rollback","cost_review","dependency_review"];
export function releaseReadiness(release){
 const blockers=[];
 if(!/^[a-f0-9]{40}$/.test(release?.commit||""))blockers.push("invalid_commit");
 for(const key of required){
 const e=release?.evidence?.[key];
 if(e?.status!=="pass"||e.commit!==release.commit||typeof e.reference!=="string"||!e.reference.trim())blockers.push(key);
 }
 if(!release?.requester||!release?.reviewer||release.requester===release.reviewer)blockers.push("independent_review_required");
 return {ready_for_manual_review:blockers.length===0,blockers,production_authorized:false,evidence_verified:false};
}
