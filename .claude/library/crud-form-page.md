# CRUD Page Design Laws — Form Page — laws and variants

> Section file. Index + never-miss rules: `crud-pages.md`.

> **Loading pattern (mandatory):** an edit form loads its record off the UI thread behind a loading flag and a `MudSkeleton`, ignores Save while loading, and shows a message and navigates back on a failed load — `code-style-reference.md § Loading Pattern — Lists and Data Loads`.

## Form Page — Laws and Variants

### Law
Add/Edit forms are routable pages (`@page`) on their own route, or a `MudDialog` when the design says the form is modal. Forms that accept keyboard input never live in a bottom sheet or an overlay that the on-screen keyboard can cover on mobile heads.

### Standard layout
```razor
<MudContainer MaxWidth="MaxWidth.Small" Class="pa-4">
    <MudForm @ref="_form" @bind-IsValid="_isValid">
        <!-- MudTextField / MudSelect / MudDatePicker fields, each with Validation -->
    </MudForm>
</MudContainer>
```

- Use `MudContainer` with `MaxWidth` so fields stay readable on wide web screens.
- On the Hybrid head the page padding includes `env(safe-area-inset-*)` through the shared layout CSS; the form does not add its own safe-area logic.
- Keyboard avoidance: the page scrolls; the focused field is scrolled into view by the layout. Verify on Android and iOS.

### Save/Cancel placement

**Law:** full-page forms put **Save** in the app bar's trailing area (`MudIconButton` or the page header's primary `MudButton`, consistent across forms — decided per feature design) and leave dismissal to the back navigation. A dialog-based form keeps its Save and Cancel buttons in `MudDialog.DialogActions`.

Save is disabled while the form is invalid, loading, or already saving. Double-submit is prevented by the saving flag, not by hiding the button.

### Validation (law)
All form fields validate per the **Form Validation Standard** in `dialogs-validation.md` — validate on blur (dirty fields), switch to keystroke-on-error so the error clears the moment it is fixed, and use Save as the safety net for cross-field / uniqueness / server checks. Errors are inline per field through `MudForm` validation (`Validation` delegates or `FluentValidation` rules) — never a summary dialog. Validation rules live in the API/service layer (business logic in services) and are mirrored in the form only for immediate feedback; the server remains the authority.

### Never
- Do not use `window.alert`, `window.confirm`, or native MAUI dialogs (`DisplayAlert`, `DisplayActionSheet`, `DisplayPromptAsync`) for validation or confirmation. Use `MudMessageBox` or inline errors — see `dialogs-validation.md`.
- Do not validate on Save only (the "Wall of Red" anti-pattern) — see the Form Validation Standard in `dialogs-validation.md`.
- Do not place a selection toolbar or floating action on a form page — it competes with the form's own Save action and with the on-screen keyboard.

---
