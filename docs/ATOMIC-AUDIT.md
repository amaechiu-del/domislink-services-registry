# Atomic D1 audit writes

The service creation and integration approval request handlers now submit both mutation and audit insert using one Cloudflare D1 `DB.batch([...])` transaction. D1 batch is transactional: if a statement fails, the batch rolls back, preventing an unlogged successful mutation. The API fails closed when `batch` is missing.

## Verification still required
Run `npm test` and execute D1 integration tests against a local Wrangler D1 database, including a deliberately failing audit insert to demonstrate rollback. This source-level change has **not** been tested against a real D1 binding. Do not interpret it as completed production readiness. Add server-side rate limiting, SSO issuer integration verification and approval decision governance before launch.
