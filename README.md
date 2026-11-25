# Central Services Registry API

Independent Cloudflare Worker + D1 service in its **own GitHub repository**. This is **not** the OneLink OIDC client registry and **not** a new SSO provider. OneLink hosts the administrator interface and consumes this API only after existing SSO authorization is verified.

## Routes
- `GET /health`: unauthenticated process liveness, not database or provider health.
- `GET /v1/services`: authenticated service inventory. Use `q` to search IDs, names and repositories. Combine it with exact `category`, `lifecycle` and `environment` filters. Set `limit` from 1 to 250 (default 250), then pass the returned `nextCursor` as `cursor` with the same filters. A null cursor marks the final page.
- `GET /v1/services/:id`: authenticated service metadata, direct dependencies and the latest recorded health status and timestamp. Health is null until an observation exists.
- `POST /v1/services`: authenticated admin creation, audited.
- `GET /v1/approvals`: authenticated admin list.
- `POST /v1/approvals`: authenticated admin approval *request*, not grant; creates `requested` state only.

## Existing SSO contract
Verify JWT against the **existing** `https://sso.domislink.com` issuer and its published JWKS. Expected audience `domislink-central-services-registry`; reader scope `services:read`; admin requires `roles` array containing `domislink:services:admin` **and** `services:write` scope. These claims are proposed integration contracts and must be confirmed against the actual issuer before production deployment. No fallback shared admin token, no password store, no token issuance. Restrict CORS at the gateway; this Worker does not enable cross-origin browser access by default.

## Provisioning (not yet performed)
1. Create Cloudflare D1 database `domislink-central-services-db`.
2. Replace placeholder `database_id` in `wrangler.jsonc` with actual UUID.
3. From the repository root run `npm install`, `npm test`, `npx wrangler d1 migrations apply domislink-central-services-db --remote`, `npm run deploy` after contract verification.
4. Use a service-specific audience and grant only minimum SSO scopes; restrict operator permissions and audit events.

## Next security and product work
Implement SSO integration acceptance tests; approval decision/revocation with separation of duties; explicit health probe allowlist and scheduler; rate limiting; robust input limits, per-tenant authorization if introduced; CSRF protection for any future cookie-authenticated frontend; D1 database integration tests; production observability. Do not expose this API publicly for administration until these controls are verified.

**Verification:** Run the local suite with Node.js 24 and `npm test`. Live token verification and Cloudflare provisioning are pending.

The registry owns service metadata and dependency records. DomisLink Control Centre can consume these authenticated API routes for its operational views. DomisLink.com remains the public headquarters.
