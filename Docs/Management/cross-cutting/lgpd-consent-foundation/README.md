---
id: lgpd-consent-foundation
title: LGPD consent and audit foundation
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: Reusable consent record and audit log for personal data: versioned consent text, who consented and when, separate image-use consent, minors via guardian, no personal data in logs.
gate: Stakeholder decision on the consent model (options sheet by us)
---

# LGPD consent and audit foundation

Not specced yet. Write requirements, design and tasks before any code (Spec-Anchored SDD).

## Decision (Helder, 2026-11-27)
The consent model is a **stakeholder decision**, supported by us. Before the stakeholder meeting, prepare a short options sheet: consent text, data retention, data controller contact, beneficiary rights (access, correction, deletion).
- **Consent text editable by Root in the admin UI, versioned:** an edit creates a new version (never overwrites); each signup stores the version it accepted.
