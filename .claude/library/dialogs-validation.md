# Dialogs & Validation Rules

> Full detail for dialogs, form validation and non-blocking feedback in PROAME (MudBlazor). Routing from `rules/` and `crud-form-page.md`. Component API questions go to the MudBlazor MCP at the manifest version.

## Non-Negotiable: No Native Dialogs

Use **only** MudBlazor for dialogs, confirmations and prompts:
- `MudMessageBox` via the injected `IDialogService` (instance call `DialogService.ShowMessageBox(...)`, not a static `Show`) for confirmations and destructive actions. Verify the signature against the MudBlazor MCP at the manifest version.
- `MudDialog` (service `IDialogService`) for modal forms and pickers that return a result.
- `MudSnackbar` for non-blocking feedback (saved, copied, failed-but-retryable).

Forbidden: `window.alert`, `window.confirm`, `window.prompt`, native MAUI dialogs (`DisplayAlert`, `DisplayActionSheet`, `DisplayPromptAsync`), and third-party dialog libraries. Hook-enforced where the hook applies (`CLAUDE.md § Constitutional Constraints`).

## Confirmation

- Destructive actions (delete, discard unsaved changes, publish or unpublish a public page or edital) use `MudMessageBox`. The confirm button uses the error colour from the MudTheme tokens; cancel is the default focus.
- Titles, messages and buttons are pt-BR and come from the localization layer (`theme-locale.md § Locale`).
- Confirmation text states what is affected (name of the record, number of records). Never a generic "Are you sure?" alone.

## Dialog and Modal Forms vs Routable Pages

| Situation | Use |
|-----------|-----|
| Full form with several fields, or a form that must survive reload | Routable page (`crud-form-page.md`) |
| Small modal edit (1–3 fields) or a picker that returns one value | `MudDialog` via `IDialogService`, returns result through `DialogResult` |
| Confirmation | `MudMessageBox` |
| Keyboard input inside a bottom sheet or overlay | Not allowed on mobile heads — the keyboard covers the surface |

## Form Validation Standard

This is the single, canonical form-input validation standard. Every form page and dialog form follows it.

### Where rules live
- **Business and uniqueness rules live in the API / service layer** (`Validate<Field>` methods returning `(bool isValid, string message)`). The form mirrors simple rules (required, length, format) for immediate feedback; the server is the authority.
- Error messages are pt-BR, produced by the service layer or the shared validation message catalogue, not inline strings scattered across pages.

### Validation timing — blur first, keystroke on error, submit as safety net
1. A field validates when it **loses focus** and is dirty.
2. Once a field shows an error, it re-validates **on each keystroke**, so the error clears the moment it is fixed.
3. **Submit** validates everything and is the safety net for cross-field and server checks (uniqueness, conflicts). Server errors are mapped back onto the field that caused them.

### Decision table — field type → when it validates

| Field type | Validates on | Notes |
|------------|--------------|-------|
| Text (required, length, format) | Blur, then keystroke while in error | Trim before validating |
| Numeric (`MudNumericField`) | Blur, then change while in error | Range checks in the service layer too |
| Date (`MudDatePicker`) | Selection / blur | Validate range against the spec, not the device locale |
| Select (`MudSelect`, `MudAutocomplete`) | Selection | Required fields show the error after the first interaction |
| Cross-field and uniqueness | Submit (server) | Map server error to the field |

### Anti-patterns — forbidden as the primary channel
- **Wall of red:** validating only on submit, showing every error at once for a blank form.
- **Summary-only errors:** a list of errors in a dialog or snackbar with no inline marker.
- **Toast-only errors:** a snackbar as the only indication of a field error.
- **Silent disable:** a disabled Save button with no explanation. Show the reason inline.

### Wiring (MudBlazor)
- Wrap the fields in `MudForm` with `@ref` and bind `IsValid`. Each field carries `Required`, `Validation` or `Error`/`ErrorText` as needed.
- Put the rule set in one place per form (a method or a validator class in `Proame.UI`), passed to the fields. No rule duplicated in markup and code-behind.
- Save: `await _form.Validate()`; if invalid, focus the first invalid field; if valid, call the API and map server errors back onto fields.

### Error surfacing — inline only
Errors appear inline under the field (`ErrorText`) and in the field's accessible description. A summary above the form is allowed only as a complement, never as the sole channel. Errors are announced to screen readers through the field's helper text.

### Masked inputs — dates
Dates are entered and displayed in `dd/MM/yyyy` (pt-BR). Use `MudDatePicker` with the pt-BR culture; if a text entry is needed (for example day and month only), use a text field with a mask or parser, validate the parsed value in the service layer, and show the parse error inline. Partial dates are a spec decision — record it in the feature requirements before implementation.

### Integer inputs
Use `MudNumericField<int>` with `Min`/`Max` where the spec defines them, and validate the range in the service layer as well.

## Character Counter Pattern

Text fields with a length limit show a counter (`MaxLength` plus `Counter`/`HelperText` with "n/max") so the limit is visible before the user hits it. The limit comes from the spec or the shared constant, never a literal repeated in markup.

## Snackbar (non-blocking feedback)

`MudSnackbar` for: "saved", "copied", "link sent", transient failures that can be retried. Messages are pt-BR, short, and do not carry validation errors (those are inline). Snackbars do not block; never rely on them for a required decision.

## Dialog State Management (Code-Behind Pattern)

- Open a dialog from the page's code-behind through `IDialogService`; await the result (`DialogResult`) and branch on `Canceled`/`Data`.
- The dialog component owns its own form state; the caller receives only the final value.
- Dismissing a dialog with unsaved input asks for confirmation through `MudMessageBox` before closing.
- Keep dialog components in `Proame.UI`; one component per dialog.

---
