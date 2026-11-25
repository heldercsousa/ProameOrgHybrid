> **PROAME note:** inherited from MyVocaList governance. Stack-specific passages (.NET MAUI, DevExpress, Syncfusion, XAML, EF Core/SQLite, Android device steps) apply ONLY if the chosen stack is .NET; otherwise apply the stack-neutral principle and ignore the specifics. Chosen stack: see `Docs/Benchmark/benchmark.md`.

# Testing — Reference

> Extracted from `.claude/rules/testing.md` (2026-07-05, rules-file-refactoring Task 09–10). The rule file is now a routing table; this file holds the full detail (project structure, test-type patterns with code, naming, what-to-test, Tester/Builder split, TDD workflow, running tests, quality audit, anti-patterns). Mutation testing (Stryker) and property-based testing (FsCheck) live in their own on-demand files. Discovered via the `proame-coding` skill map or the rule's routing table.
> Content moved verbatim; only corrupted markdown code-fences (`` `ash ``, `` `json ``, ```` ```r ````) were normalized to proper fences — no wording changed.
> **Trimmed 2026-07-07 (Task 18, audit F9/R8):** generic xUnit/Moq scaffolding (csproj skeleton, OutputType trick, generic ViewModel test pattern, generic run commands) now lives in the enabled `maui-unit-testing` skill — this file keeps only what is project-specific and points there for the rest.

---

> **This file is now an index** (split 2026-07-14 for token-scoped subagent reads). Read ONLY the section file(s) your task needs — never all of them.

| Section file | Covers |
|---|---|
| `testing-structure.md` | Test project structure (csproj deltas, GlobalUsings) — PROAME.Tests layout, TFM/package deltas, usings |
| `testing-test-types.md` | Test types — Service, ViewModel, Repository + TestDbContextFactory — full code patterns per test type, real-SQLite factory, collation rationale |
| `testing-conventions.md` | Naming conventions + what to test per layer — class/method naming, layer test/skip table, query-test rule |
| `testing-tdd-roles.md` | Tester/Builder split + TDD workflow + running tests — role separation, Red-Green-Refactor, one-test-at-a-time, dispatch pattern, test commands |
| `testing-quality-audit.md` | Quality-audit checklist + Builder-must-not-modify + anti-patterns — per-test/per-class audit items, escalation protocol, anti-pattern table |

> **Authorship note:** This file must be human-reviewed before it is relied upon (CLAUDE.md § Continuous Enhancement — Authorship).
