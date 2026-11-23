# SSO verification boundary

The registry consumes JWT access tokens from the existing SSO. It never issues tokens or accepts shared browser administrator tokens. The JWT verifier requires an HTTPS JWKS URL on the configured issuer's origin, checks issuer/audience/signature/expiration with an allowed algorithm set, and rejects tokens without subject or key ID. JWKS retrieval uses a per-isolate cache.

Permissions are server-side: `services:read` for inventory access; `domislink:services:admin` role **and** `services:write` scope for mutations. These claim names are a proposed contract and must be confirmed against the real SSO issuer before rollout.

## Still required
Add signed-token acceptance and rejection integration tests with a local JWKS HTTP fixture (without weakening the HTTPS production requirement), then test the deployed SSO's published JWKS and actual access-token claim shape. Verify least-privilege scopes and tenant restrictions before exposing admin endpoints. Tests here validate policy and configuration only; they do not demonstrate live issuer compatibility.
