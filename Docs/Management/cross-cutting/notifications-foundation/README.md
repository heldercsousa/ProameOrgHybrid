---
id: notifications-foundation
title: Notification channels foundation (e-mail / push)
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: Channel abstraction so the admin chooses where new signups and offers are notified: none, e-mail, push, or both (decision D6).
gate: Push provider accounts (FCM / APNs) — e-mail provider is an admin setting
---

# Notification channels foundation (e-mail / push)

Not specced yet. Write requirements, design and tasks before any code (Spec-Anchored SDD).

## Decisions (Helder, 2026-11-27) — input for the spec
- Per-user preference: e-mail, device push, both, or none.
- **Security e-mails always go out** regardless of preference (password reset, password changed, e-mail changed, 2FA changed).
- Notification e-mail editable any time by the user or a Root; a new address takes effect only after link confirmation.
- **E-mail provider is a Root-level admin setting (UI), not hard-coded nor CI/CD:** SMTP host, port, user, password, sender + "send test e-mail". Password encrypted at rest (ASP.NET Data Protection) and write-only in the UI. Dev: Helder's Gmail SMTP (app password) via user-secrets, never committed. Production: the stakeholder's own provider, set from the admin area.
- **Push** (FCM / APNs) is tied to the app build and store accounts → developer configuration (CI/CD secrets), not a UI setting.
