---
id: admin-auth
title: Admin authentication and roles
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: Admin sign-in and role-based authorization shared by the Web and App heads, protecting every private API endpoint (LGPD).
gate: Helder decision on auth scheme (web cookie vs token for the MAUI app)
---

# Admin authentication and roles

Not specced yet. Write requirements, design and tasks before any code (Spec-Anchored SDD).

## Decisions (Helder, 2026-11-27) — input for the spec
- **Scheme:** ASP.NET Core Identity (PostgreSQL). Web head: secure HttpOnly cookie. MAUI head: short-lived bearer + refresh token (Identity API endpoints), stored in `SecureStorage`.
- **Roles:** `Root` (everything, incl. create/edit/deactivate/promote admins and roots) and `Admin` (content only). The last active Root cannot be removed or demoted.
- **Bootstrap Root:** seeded at first deploy from secret configuration (e-mail + one-time password); password change forced at first login. No fixed default password.
- **2FA:** TOTP (authenticator app) + recovery codes — mandatory for Root, optional for Admin.
- **External login:** none in MVP. Google sign-in is a post-MVP candidate (invite-only — e-mail must be pre-registered by a Root). Instagram: no.
- **Admin users page:** name, e-mail, role, 2FA on/off, last login, active. Deactivate, never delete (audit).
- **Hardening:** lockout after 5 failed attempts; minimum password length 12; security e-mail on password / 2FA / e-mail change.
