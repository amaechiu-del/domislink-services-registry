# Central ownership map

Repository names verified from the owner inventory. README availability is not deployment evidence.

| Capability | Repository | Responsibility |
|---|---|---|
| SSO | domislink-sso | Existing identity provider |
| OneLink | domislink-onelink | OIDC client registry and identity-facing UI |
| Service inventory | domislink-services-registry | Service metadata and integration approvals |
| PWA | pwa-central | Shared install and offline standards |
| Payments | domislink-pay | Payment orchestration |
| Branding | domislink-branding | Shared design assets; empty at inspection |
| Configuration | domislink-config- | Configuration metadata; empty at inspection |
| Control Centre | unresolved | No matching domislink-control in inspected owner inventory |
| Headquarters | unresolved repository mapping | domislink.com public entry point |

Do not confuse domislink-pwa (education application) with pwa-central.
Do not create a second OIDC registry in the services registry.
Control Centre should consume these services, not own their databases or credentials.
Confirm the headquarters and existing admin repository roles before choosing a Control Centre repository.
