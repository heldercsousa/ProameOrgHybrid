---
id: admin-guided-tutor
title: Admin guided tutor
status: 💡 Pending
target: 2026-11
section: BusinessFeatures
goal: Per-screen '?' contextual help and short guided tours for low-digital-literacy admins; drift guarded by tests (every admin page has help; tour anchors exist) and a release checklist.
kind: feature
---

# Admin guided tutor

Per-screen '?' contextual help and short guided tours for low-digital-literacy admins; drift guarded by tests (every admin page has help; tour anchors exist) and a release checklist.

## Decision (Helder, 2026-11-27) — two help levels, admin AND public
- **Page "?" button** → general info about the page or form: what it is for and the steps (`MudIconButton` that opens a `MudDialog`).
- **Field help** → one short hint per field, next to the field: what to type, an example, and why it is asked (e.g. CadÚnico, LGPD consent). Simple fields get MudBlazor `HelperText`. A field that needs more gets a `MudTooltip` on an info icon. Both follow the MD3 rules for supporting text and plain tooltips.
- **Mobile:** hover does not exist on touch screens, so the tooltip must open on tap and be readable by screen readers (WCAG AA). Essential help is never tooltip-only, it stays visible as `HelperText`.
- **Scope:** admin pages and forms, and also public pages and forms (beneficiary signup, collaborator offer, Transparência).
- **Admin autonomy:** for admin-created form fields (project signup forms), the field-builder gets an optional "texto de ajuda" per field, written by the NGO.
- Built as one shared component, so tooltip/help behaviour stays consistent. It becomes governed once it has a second consumer.
