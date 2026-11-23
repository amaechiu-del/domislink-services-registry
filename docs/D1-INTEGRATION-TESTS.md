# Local D1 transactional integration test

Run `npm install` and `npm test` at the standalone registry repository root. The Miniflare test starts an isolated local Cloudflare D1 database, applies the actual initial migration, deliberately fails the audit insert inside a `DB.batch`, and asserts the service insert was rolled back. It also checks the success path persists both rows. No remote Cloudflare resources are modified.

The test verifies D1 transaction behavior, not the full HTTP route, live SSO token verification or production D1 provisioning. Those require separate staging acceptance tests. No test should use production secrets.
