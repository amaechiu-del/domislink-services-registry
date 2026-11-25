export function accountHealth(record,now=Date.now()){
 const warnings=[];
 const date=(value,label)=>{if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return warnings.push(label+"_unverified");const t=Date.parse(value+"T00:00:00Z");if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==value)return warnings.push(label+"_unverified");if(t<=now)warnings.push(label+"_due");else if(t-now<=30*86400000)warnings.push(label+"_due_within_30_days");};
 date(record.card_expiry_review_date,"card_review");
 date(record.domain_renewal_date,"domain_renewal");
 if(!["free","paid"].includes(record.plan))warnings.push("plan_unverified");
 if(record.plan==="paid"&&record.cost_approved!==true)warnings.push("paid_plan_requires_review");
 if(typeof record.quota_used_percent!=="number"||!Number.isFinite(record.quota_used_percent)||record.quota_used_percent<0)warnings.push("quota_unverified");
 else if(record.quota_used_percent>=80)warnings.push("quota_near_or_over_limit");
 if(record.account_status!=="active")warnings.push("account_status_requires_review");
 return {warnings,evidence:"supplied_metadata_only",live_verified:false};
}
