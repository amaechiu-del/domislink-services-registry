import {createRemoteJWKSet,jwtVerify} from 'jose';
const jwksCache=new Map();
export async function verifyRegistryToken(token,env,options={}){
 if(!env?.SSO_ISSUER||!env?.SSO_JWKS_URL||!env?.REGISTRY_AUDIENCE)throw new Error('SSO configuration missing');
 const issuer=new URL(env.SSO_ISSUER),jwksUrl=new URL(env.SSO_JWKS_URL);
 if(issuer.protocol!=='https:'||jwksUrl.protocol!=='https:'||issuer.origin!==jwksUrl.origin||issuer.username||issuer.password||jwksUrl.username||jwksUrl.password)throw new Error('Invalid SSO configuration');
 const cacheKey=jwksUrl.href;let jwks=options.jwks ?? jwksCache.get(cacheKey);if(!jwks){jwks=createRemoteJWKSet(jwksUrl);jwksCache.set(cacheKey,jwks)}
 const {payload,protectedHeader}=await jwtVerify(token,jwks,{issuer:env.SSO_ISSUER,audience:env.REGISTRY_AUDIENCE,algorithms:['RS256','ES256'],clockTolerance:5});
 if(!payload.sub||typeof payload.sub!=='string'||!protectedHeader.kid)throw new Error('Missing subject or key id');
 return payload;
}
const scopes=p=>typeof p?.scope==='string'?p.scope.split(/\\s+/):[];
export const canManageServices=p=>Array.isArray(p?.roles)&&p.roles.includes('domislink:services:admin')&&scopes(p).includes('services:write');
export const canReadServices=p=>canManageServices(p)||scopes(p).includes('services:read');
