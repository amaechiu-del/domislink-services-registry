# Central Services Registry API

Independent Cloudflare Worker + D1 service **within the OneLink monorepo temporarily**. This is **not** the existing OIDC client registry and **not** a new SSO provider. Future repository extraction requires no new authentication system.

## Routes
- `GET /health`: unauthenticated process liveness, not database or provider health.
- `GET /v1/services`: authenticated service inventory, `services:read` scope or administrator role + write scope.
- `GET /v1/services/:id`: authenticated service metadata.
- `POST /v1/services`: authenticated admin creation, audited.
- `GET /v1/approvals`: authenticated admin list.
- `POST /v1/approvals`: authenticated admin approval *request*, not grant; creates `requested` state only.

## Existing SSO contract
Verify JWT against the **existing** `https://sso.domislink.com` issuer and its published JWKS. Expected audience `domislink-central-services-registry`; reader scope `services:read`; admin requires `roles` array containing `domislink:services:admin` **and** `services:write` scope. These claims are proposed integration contracts and must be confirmed against the actual issuer before production deployment. No fallback shared admin token, no password store, no token issuance. Restrict CORS at the gateway; this Worker does not enable cross-origin browser access by default.

## Provisioning (not yet performed)
1. Create Cloudflare D1 database `domislink-central-services-db`.
2. Replace placeholder `database_id` in `wrangler.jsonc` with actual UUID.
3. From this service directory run `npm install`, `npm test`, `npx wrangler d1 migrations apply domislink-central-services-db --remote`, `npm run deploy` after contract verification.
4. Use a service-specific audience and grant only minimum SSO scopes; restrict operator permissions and audit events.

## Next security and product work
Implement SSO integration acceptance tests; enforce transactionally coupled audit writes; approval decision/revocation with separation of duties; explicit health probe allowlist and scheduler; pagination and rate limiting; robust input limits, per-tenant authorization if introduced; CSRF protection for any future cookie-authenticated frontend; D1 database integration tests; production observability. Do not expose this API publicly for administration until these controls are verified.

**Status:** Source committed; no tests, D1 provisioning, deployment, live token verification or production health checks claimed.
