# Feedback & Innovation Centre
Universal free feedback across all apps, independent of subscription. Registry owns integration discovery, not feedback records. Runtime owner pending full overlap audit; reuse existing admin/control UI, OneLink, communications, AI Studio, PWA Central, GitHub and audit. No new repo or paid infrastructure by default.
Initial audit: primary account inventory has no explicitly named feedback repository; main trees of registry, admin and AI Studio have no feedback/suggestion filenames. This is not a complete code or secondary-account audit. Registry README confirms inventory API and unverified SSO contract. Do not extend registry into a feedback datastore.
## Milestones (all pending except roadmap)
FB01 complete overlap audit and assign owner.
FB02 D1 schema: app/tenant identity, private feedback, status history, moderation, consent.
FB03 authenticated API, bounded input, rate limits, tenant isolation.
FB04 reusable accessible widget.
FB05 OneLink identity and authorization.
FB06 offline drafts, explicit sync and idempotency.
FB07 moderated public ideas board, explicit publication consent.
FB08 unique verified vote per idea, abuse controls.
FB09 user status tracking.
FB10 opt-in voice transcription.
FB11 private R2 attachments, size/type limits, malware review and retention.
FB12 multilingual feedback.
FB13 recognition; financial rewards disabled pending approval.
FB14 AI classification, untrusted input, redact personal data.
FB15 duplicate grouping preserving originals.
FB16 explainable priority recommendations, human review.
FB17 developer dashboard with app/severity/status filters.
FB18 approved GitHub issue creation, redact private data, deduplicate.
FB19 testable requirement generation.
FB20 verified release linkage.
FB21 opt-in notifications.
FB22 approved public roadmap.
FB23 approved social announcements.
FB24 versioned widget rollout and future app manifest requirement.
FB25 security, privacy, moderation, confidential vulnerability channel, deletion and retention.
FB26 quotas and free-tier cost review.
FB27 staging tests: isolation, consent, vote uniqueness, retry, accessibility, no secret leakage.
FB28 incremental production rollout with rollback and explicit release approval.
## Gates
FB01 before schema; FB02–05 before public submissions; FB07–08 before voting; FB14–16 before AI triage; human approval before GitHub or public announcements. No auto deployment from feedback. Pilot MyCity then Headquarters, then eligible apps. Security reports never public. No live integrations or deployment in this commit.
