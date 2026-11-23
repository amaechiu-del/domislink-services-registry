# Registry deployment gate

The independent registry must not be deployed with a placeholder D1 binding or an unverified SSO claim contract.

## CI
Pull requests run contract tests, Node syntax validation and a Wrangler **dry-run only**. No CI deployment tokens are needed and CI cannot modify Cloudflare infrastructure. A passing dry-run does **not** establish a working D1 binding or SSO integration.

## Manual provisioning and release checklist
1. Create `domislink-central-services-db` in the intended Cloudflare account.
2. Replace the placeholder `database_id` in `wrangler.jsonc` with the actual UUID; commit through review.
3. Verify that `sso.domislink.com` really serves the configured JWKS path and issues signed access tokens with the registry audience and the proposed `roles` / `scope` claims. Do not modify the existing SSO merely to satisfy this contract without a migration plan.
4. Run `npm install`, `npm test`, and `node scripts/check-deployment.mjs`.
5. Run `npx wrangler d1 migrations apply domislink-central-services-db --remote` only after inspecting the migration.
6. Test authorized and unauthorized access against a staging Worker and D1. Check cross-origin restrictions, duplicate service IDs, and audit behavior.
7. Deploy to production only after explicit operational approval and passing integration tests.

## Remaining hardening
The current API uses sequential audit writes, so a failed audit write can leave a successful mutation without an audit record. Make business mutation and audit atomic before production. Approval decisions and revocation, rate limiting, health-probe allowlists and real issuer verification also remain pending.
