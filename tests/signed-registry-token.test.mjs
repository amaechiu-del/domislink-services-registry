import test from "node:test";
import assert from "node:assert/strict";
import {generateKeyPair,SignJWT} from "jose";
import {verifyRegistryToken,requireReader,requireAdmin} from "../src/index.js";
const issuer="https://domislink-sso-registry-staging.amaechi-u.workers.dev", audience="domislink-central-services-registry";
const {privateKey,publicKey}=await generateKeyPair("RS256");
const other=await generateKeyPair("RS256");
async function token(overrides={},key=privateKey){
 const now=Math.floor(Date.now()/1000);
 return new SignJWT({iss:issuer,aud:audience,sub:"test-user",iat:now,nbf:now,exp:now+900,jti:"test-id",scope:"services:read",roles:[],...overrides}).setProtectedHeader({alg:"RS256"}).sign(key);
}
const verify=t=>verifyRegistryToken(t,publicKey,issuer,audience);
test("signed reader cannot administer",async()=>{const p=await verify(await token());assert.ok(p);assert.equal(requireReader(p),true);assert.equal(requireAdmin(p),false);});
test("signed administrator requires role and write scope",async()=>{
 for(const [scope,roles,expected] of [["services:read services:write",["domislink:services:admin"],true],["services:read",["domislink:services:admin"],false],["services:write",[],false]]){
 const p=await verify(await token({scope,roles}));assert.ok(p);assert.equal(requireAdmin(p),expected);
 }
});
test("wrong key is rejected",async()=>assert.equal(await verify(await token({},other.privateKey)),null));
test("wrong issuer or audience is rejected",async()=>{for(const claims of [{iss:"https://sso.domislink.com"},{aud:"other"}])assert.equal(await verify(await token(claims)),null);});
test("expired and future tokens are rejected",async()=>{const now=Math.floor(Date.now()/1000);for(const claims of [{nbf:now-1000,exp:now-100},{nbf:now+60,exp:now+960}])assert.equal(await verify(await token(claims)),null);});
test("missing required claims are rejected",async()=>{for(const claim of ["exp","nbf","iat","jti","sub"])assert.equal(await verify(await token({[claim]:undefined})),null);});
