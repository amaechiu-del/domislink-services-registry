# DomisLink repository consolidation audit — baseline 2026-11-23

## Policy
No repository deletion, migration, DNS cutover, database changes, or production deployment is authorized by this audit. Classifications are provisional until source, dependencies, secrets references, Cloudflare bindings, GitHub Actions and active callers have been inspected.

## Initial evidence and recommendations

| Repository | Observed evidence | Provisional classification | Required next check |
| --- | --- | --- | --- |
| domislink-admin | Wrangler config defines Cloudflare project with static assets and nodejs compatibility | KEEP / integrate with Registry | Inspect actual UI routes, SSO and deploy ownership |
| domislink-cms | README identifies CMS backend and PWA engine | KEEP / REVIEW PWA overlap | Inspect source and PWA implementation |
| domislink-data | README only identifies repository name | INVESTIGATE | Inspect tree, database assets and callers |
| domislink-webhook | README describes generic HMAC webhook receiver; package.json describes Paystack licensing and emails, Node Express server | MIGRATION CANDIDATE / KEEP until verified | Inspect server.js and routes, distinguish generic ingress vs Paystack fulfillment; retain event signatures and idempotency |
| domislink-ai-studio | README documents AI app builder prototype, not production generator | KEEP | Review roadmap and code boundaries |

## Canonical service boundaries
- SSO: authentication issuer only.
- OneLink: user-facing account and app portal.
- Services Registry: service inventory, dependencies and governance.
- Admin: administrative UI, not a second registry backend.
- CMS: editorial content; Branding: shared brand assets.
- Data: reference datasets or ETL only if confirmed; Analytics: event ingestion/aggregation.
- Webhook: transport/signature validation; payment service: Paystack verification, settlement and licensing fulfillment.
- AI Studio: application-builder product; no duplicate central identity or payment processors.

## Migration gate
1. Record canonical owner, live domains, consumers, code entrypoints, environment secrets **names only**, database/bucket bindings, workflows and rollback plan.
2. Inventory routes and features with evidence; map each to a target repository.
3. Copy/migrate via reviewed PRs, preserving tests and idempotency, and validate against staging.
4. Cut over callers incrementally with health/telemetry and rollback.
5. Archive superseded repository only after owner approval and no active dependencies.
6. Delete only with a separate explicit approval and verified backup. Never cascade-delete Cloudflare infrastructure.

## New foundations
domislink-communications, domislink-branding, domislink-config, domislink-analytics, domislink-audit and domislink-social are intended to register as `development` or `planned`, not `ready`, until code and deployment evidence is verified.
