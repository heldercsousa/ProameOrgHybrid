---
id: notifications-foundation
title: Notification channels foundation (e-mail / push)
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: Channel abstraction so the admin chooses where new signups and offers are notified: none, e-mail, push, or both (decision D6).
gate: Helder choice of free-tier e-mail and push providers
---

# Notification channels foundation (e-mail / push)

Not specced yet. Write requirements, design and tasks before any code (Spec-Anchored SDD).

## Decisions (Helder, 2026-11-27) — input for the spec
- Per-user preference: e-mail, device push, both, or none.
- **Security e-mails always go out** regardless of preference (password reset, password changed, e-mail changed, 2FA changed).
- Notification e-mail editable any time by the user or a Root; a new address takes effect only after link confirmation.
- Providers: still open (free tier).
