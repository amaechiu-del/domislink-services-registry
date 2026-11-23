import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT} from 'jose';
import {verifyRegistryToken,canReadServices,canManageServices} from '../src/security.js';
const env={SSO_ISSUER:'https://sso.domislink.com',SSO_JWKS_URL:'https://sso.domislink.com/.well-known/jwks.json',REGISTRY_AUDIENCE:'domislink-central-services-registry'};
const {publicKey,privateKey}=await generateKeyPair('RS256');
const publicJwk={...await exportJWK(publicKey),kid:'test-key-1',alg:'RS256',use:'sig'};
const jwks=createLocalJWKSet({keys:[publicJwk]});
async function signed(overrides={}){const claims={sub:'operator-123',scope:'services:read',roles:[],...overrides};return new SignJWT(claims).setProtectedHeader({alg:'RS256',kid:'test-key-1'}).setIssuer(env.SSO_ISSUER).setAudience(env.REGISTRY_AUDIENCE).setIssuedAt().setExpirationTime('5m').sign(privateKey)}
test('accepts correctly signed reader token',async()=>{const payload=await verifyRegistryToken(await signed(),env,{jwks});assert.equal(payload.sub,'operator-123');assert.equal(canReadServices(payload),true);assert.equal(canManageServices(payload),false)});
test('accepts correctly signed admin role and write scope',async()=>{const payload=await verifyRegistryToken(await signed({roles:['domislink:services:admin'],scope:'services:read services:write'}),env,{jwks});assert.equal(canManageServices(payload),true)});
test('rejects wrong audience',async()=>{const token=await signed();await assert.rejects(verifyRegistryToken(token,{...env,REGISTRY_AUDIENCE:'another-service'},{jwks}))});
test('rejects wrong issuer',async()=>{const token=await signed();await assert.rejects(verifyRegistryToken(token,{...env,SSO_ISSUER:'https://another.example',SSO_JWKS_URL:'https://another.example/jwks'},{jwks}))});
test('rejects altered signature',async()=>{const token=await signed();const parts=token.split('.');parts[2]=(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);await assert.rejects(verifyRegistryToken(parts.join('.'),env,{jwks}))});
test('rejects expired token',async()=>{const token=await new SignJWT({sub:'operator-123',scope:'services:read'}).setProtectedHeader({alg:'RS256',kid:'test-key-1'}).setIssuer(env.SSO_ISSUER).setAudience(env.REGISTRY_AUDIENCE).setIssuedAt(Math.floor(Date.now()/1000)-3600).setExpirationTime(Math.floor(Date.now()/1000)-1800).sign(privateKey);await assert.rejects(verifyRegistryToken(token,env,{jwks}))});
test('rejects missing subject',async()=>{const token=await signed({sub:''});await assert.rejects(verifyRegistryToken(token,env,{jwks}))});
test('rejects token signed with untrusted key',async()=>{const other=await generateKeyPair('RS256');const token=await new SignJWT({sub:'attacker',scope:'services:read'}).setProtectedHeader({alg:'RS256',kid:'test-key-1'}).setIssuer(env.SSO_ISSUER).setAudience(env.REGISTRY_AUDIENCE).setIssuedAt().setExpirationTime('5m').sign(other.privateKey);await assert.rejects(verifyRegistryToken(token,env,{jwks}))});
