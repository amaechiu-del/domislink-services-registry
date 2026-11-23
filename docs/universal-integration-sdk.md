# DomisLink Universal Integration SDK — foundation

This module lives in the **existing** central Services Registry repository to avoid creating another central registry or a new paid service.

Import `sdk/integrations.mjs` into build tooling and create an integration manifest for every new DomisLink app. Required centres are identity (OneLink), PWA, Services Registry, Branding, Audit and Deployment. Optional centres include Paystack, Communications, WhatsApp, Advertising, Analytics and AI. All start `unverified`; configuration does not imply successful connection.

Example:
```js
import {createIntegrationManifest} from "./sdk/integrations.mjs";
const manifest=createIntegrationManifest({id:"church",repository:"amaechiu-del/domislink-church",origin:"https://church.domislink.com",enabled:["payments","messaging"]});
```

This is a policy contract, **not automatic runtime wiring**. The next stage is a reusable installer/build template that validates service endpoints and generates per-app configuration without copying credentials. Avoid embedding secrets in manifests. Reuse OneLink SSO and the existing service owners, never add duplicate payment or authentication engines.

Run `node --test tests/integrations.test.mjs`. No database migration or deployment is required.
