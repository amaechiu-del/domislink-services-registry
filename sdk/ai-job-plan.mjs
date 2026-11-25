export function aiJobPlan({application,purpose,approvalReference,maxCostMinor,currency}){
 if(typeof application!=="string"||!/^[a-z][a-z0-9-]{1,63}$/.test(application)||!["announcement","application_plan","content_draft"].includes(purpose))throw Error("Invalid AI job");
 if(!Number.isSafeInteger(maxCostMinor)||maxCostMinor<0||typeof currency!=="string"||!/^[A-Z]{3}$/.test(currency))throw Error("Invalid cost ceiling");
 return {application,purpose,repository:"amaechiu-del/domislink-ai-studio",maxCostMinor,currency,approval_reference_present:typeof approvalReference==="string"&&approvalReference.trim().length>0,execution_authorized:false,provider_called:false};
}
