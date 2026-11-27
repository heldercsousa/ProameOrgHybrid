---
id: api-foundation
title: API foundation (services layer conventions)
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: API base conventions every feature reuses: service registration entry point, ProblemDetails error handling, tuple service results, typed UI-side API client over Contracts DTOs, per-environment config and a database health check.
gate: none
---

# API foundation (services layer conventions)

Not specced yet. Write requirements, design and tasks before any code (Spec-Anchored SDD).

## Decisions (Helder, 2026-11-27) — input for the spec
**Public read routes**
- Separate public and private contracts: public routes return public DTOs only (never personal data) and are anonymous; private routes require admin auth.
- Built-in ASP.NET Core rate limiting (per IP) on public routes.
- Hard max page size enforced in the service layer.
- Public GET responses are cacheable at the edge (see `cloudflare-edge-dns-waf-turnstile`); the Web head renders public pages server-side and calls the API server-to-server.
- No per-request recording of visitors (IP = personal data under LGPD); usage stats come from Cloudflare Analytics / monitoring.

**Only PROAME clients may call the API**
- Origin locked: Azure access restrictions allow only Cloudflare and the Web head; the Web head adds a server-only secret header (never in a browser or app binary).
- CORS restricted to the PROAME web origins.
- Mobile app attestation (Play Integrity / App Attest via Firebase App Check): `app-attestation` item, at store release.

**Developer access (homolog / production)**
- Homolog: developer IP allow-list + per-developer App Check debug tokens; Postman works.
- Production: logs/monitoring first (`logging-observability`). Direct calls only through a Cloudflare Access-protected developer hostname (Google sign-in) + short-lived debug token; admin routes still need login + 2FA. Debug tokens never in the repo or app.
