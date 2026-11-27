---
id: admin-auth
title: Admin authentication and roles
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: Admin sign-in and role-based authorization shared by the Web and App heads, protecting every private API endpoint (LGPD).
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
- **2FA everywhere for staff accounts** outside the app too (Google, GitHub, Azure, Cloudflare).
- **Audit log** of admin actions (who, what, when) + security e-mail on each new admin sign-in.
- **Developers:** a separate Admin (not Root) account in production; at most a temporary Root granted by a PROAME Root.

**Root continuity**
- Recommend ≥ 2 active Roots; warning banner while only one exists.
- Lost password → e-mail reset; lost phone → recovery codes; or another Root resets password/2FA.
- **Temporary Root:** Root grant with an optional expiry date, auto-revoked.
- Death / long absence → another Root deactivates the account (never deleted).
- **Break-glass** (all Roots lost): no in-app back door; a documented CI/CD job creates a new Root with a one-time password, runs only after a PROAME person approves in GitHub, and is logged.
- Board keeps a sealed envelope with the main Root's recovery codes.
- Every Root grant / removal / expiry → security e-mail to all Roots + audit entry.
