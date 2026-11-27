---
id: cloudflare-edge-dns-waf-turnstile
title: Cloudflare edge (DNS, WAF, Turnstile)
status: 💡 Pending
target: 2026-11
section: cross-cutting
goal: "Cloudflare free plan in front of Azure: DNS + proxy, DDoS/WAF, rate limit on admin login, cache only public static assets (never API/admin), Turnstile on public forms. PROAME-owned account."
gate: PROAME domain (proame.org) DNS access
kind: feature
---

# Cloudflare edge (DNS, WAF, Turnstile)

Cloudflare free plan in front of Azure: DNS + proxy, DDoS/WAF, rate limit on admin login, cache only public static assets (never API/admin), Turnstile on public forms. PROAME-owned account.

## Decision (Helder, 2026-11-27)
Adopted: the API will be an attack target, and an edge protection layer adds reliability. Rollout with `azure-environment` (first deploy); verify Blazor WebSockets through the proxy in homolog. **Turnstile is designed in from the start** of the public signup and collaborator-offer forms (server-side token validation in the API).
