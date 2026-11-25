const central={sso:"domislink-sso",pwa:"pwa-central",pay:"domislink-pay",branding:"domislink-branding",config:"domislink-config-",audit:"domislink-audit-",analytics:"domislink-analytics-",social:"domislink-social-",communications:"domislink-communications"};
export function onboardingPlan(app){
 if(!app||typeof app.id!=="string"||!/^[a-z][a-z0-9-]{1,63}$/.test(app.id)||!["staging","production"].includes(app.environment))throw Error("Invalid application");
 const required=["sso","pwa","branding","config","audit",...(app.payments===true?["pay"]:[]),...(app.analytics===true?["analytics"]:[]),...(app.announcements===true?["social"]:[]),...(app.messaging===true?["communications"]:[])];
 return {application:app.id,environment:app.environment,integrations:required.map(service=>({service,repository:"amaechiu-del/"+central[service],status:"review_required"})),deployment_authorized:false,paid_activation_authorized:false};
}
