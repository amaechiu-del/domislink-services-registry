# Social release handoff

Reuse domislink-social- after its actual API and branch are inspected. Registry owns release evidence and approval metadata, not social provider credentials or publishing.

Proposed handoff: application ID, immutable release commit, approved public summary, public URL, target channels, locale, unique event ID. No secrets, internal logs or customer records. Social Central generates AI-assisted drafts, requests human review, and publishes only approved content using separately authorized channel credentials. Deduplicate by event ID and channel; retries must not duplicate publication. No automatic paid AI calls or live publishing until approved.

This is a proposed contract, not an implemented transport or confirmed Social API.
