export function deploymentObservation(input){
 if(!input||typeof input.repository!=="string"||!/^amaechiu-del\/[A-Za-z0-9_.-]+$/.test(input.repository)||! /^[a-f0-9]{40}$/.test(input.commit||"")||!["staging","production"].includes(input.environment))throw Error("Invalid deployment metadata");
 const state=["success","failure","pending","cancelled"].includes(input.state)?input.state:"unknown";
 return {repository:input.repository,commit:input.commit,environment:input.environment,state,observed_at:new Date().toISOString(),evidence:"supplied_metadata",live_verified:false,release_authorized:false};
}
