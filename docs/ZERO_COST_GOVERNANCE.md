# DomisLink zero-additional-cost development policy

Effective: 2026-11-23. Applies to proposed shared-service integrations and releases.

## Default: no additional charges
- Reuse existing repositories, deployed Workers, D1 databases, R2 buckets, domains, and integrations before provisioning new resources.
- Prefer free and open-source tooling, local tests, GitHub's available free allowances, and Cloudflare's available free allowances.
- Do not enable paid plans, payment methods, billable AI models, paid messaging, premium GitHub runners, paid observability, or third-party subscriptions without explicit owner approval.
- Do not assume a service is permanently free: verify the account's plan, usage, regional availability, and billing terms before enabling it.
- No automatic production deployments, DNS changes, remote migrations, or resource provisioning in a documentation-only phase.
- Never commit live .env files, credentials, API tokens, or private keys. Use .env.example and platform secret stores.
- Prefer bounded polling, request budgets, local development, and manual approvals over always-on paid jobs.
- A free-tier quota is not a spending cap. Where hard limits are unavailable, keep the feature disabled until monitoring and owner-approved billing safeguards exist.

## Mandatory pre-change cost assessment
Every infrastructure pull request must record:
1. Existing component or repository that can be reused.
2. New services or resources requested, if any.
3. Expected incremental cost and evidence supporting a zero-cost claim.
4. Free-tier quotas, usage limits, and possible overage triggers.
5. Whether a credit card, billing activation, or paid plan is required.
6. Explicit owner approval before any charge-bearing activation.
7. Rollback plan preserving existing production services.

If cost cannot be verified, mark **COST UNVERIFIED — DO NOT ACTIVATE**.

## Proposed shared-services layout
- `domislink-services-registry`: service and infrastructure inventory API.
- `domislink-onelink` / existing SSO: identity authority and application registry; never duplicate identity stores.
- `domislink-admin`: candidate management UI, pending security review of its existing login.
- `domislink-app`: public website; keep separated from privileged administration.
- `domislink-pwa`: currently a school examination product, not a generic shared PWA SDK.

## Staged implementation
1. Audit existing repositories, production routes, authentication, and costs.
2. Validate OneLink JWT issuer, audience, scopes and roles in a local test environment.
3. Build a protected admin interface against the existing services registry API.
4. Add read-only GitHub and Cloudflare inventory adapters with bounded requests.
5. Add secret *metadata* validation, branding/PWA standards, and approval-only social drafts.
6. Run tests and security reviews before any approved deployment.

This policy does not alter existing payment routes or production services.
