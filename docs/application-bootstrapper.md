# DomisLink Application Bootstrapper — Milestone 2

Use this dependency-free CLI when starting or upgrading a DomisLink app:

```sh
node scripts/bootstrap-app.mjs --target ../domislink-church --id church --repository amaechiu-del/domislink-church --origin https://church.domislink.com --enable messaging,payments
```

By default the command is **dry-run** and does not write. After review, repeat with `--write`. This creates `.domislink/integrations.json` and `.domislink/readiness.json`, both containing only public metadata and unverified readiness. It refuses to overwrite existing files.

All essential centres are declared by default; optional integrations require explicit selection. The bootstrapper does not call paid APIs, create Cloudflare resources, modify existing login flows, register applications remotely, or falsely mark integrations as verified.

Next: add a reusable per-repository CI check that consumes these manifests, verifies their schema, and reports missing integration evidence without exposing secrets. Actual OneLink, PWA, and other service wiring must be implemented and verified separately.
