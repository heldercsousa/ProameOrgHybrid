---
id: azure-environment
title: Azure environment under PROAME accounts
status: 💡 Pending
section: cross-cutting
kind: feature
target: 2026-12
goal: App Service, PostgreSQL Flexible Server and Blob Storage provisioned in PROAME's own Azure account, with secrets in app settings and a deploy path from CI.
gate: PROAME Azure subscription access
---

# Azure environment under PROAME accounts

Not specced yet. Write requirements, design and tasks before any code (Spec-Anchored SDD).

## Decisions (Helder, 2026-11-27)
- Early dev runs fully local (Docker: PostgreSQL + Azurite) — no Azure cost.
- Only needed near the first production deploy. If Helder's own account is used temporarily: free tiers only (App Service F1, PostgreSQL Flexible B1ms 12-month free) and a budget alert set first. Production lives in PROAME's subscription.
- Two environments: **homolog** (own app + database) and **production**. Deploy pipeline: `ci-cd-deploy`.
