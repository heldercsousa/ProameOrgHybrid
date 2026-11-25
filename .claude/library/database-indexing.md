# Database Indexing Rules (PostgreSQL)

## The Rule

Every field used in a `WHERE` clause, `ORDER BY`, `JOIN`, or search filter **must** have an explicit index declared in the entity's EF Core `IEntityTypeConfiguration<T>` (Infrastructure project). PostgreSQL does not create indexes for foreign keys or filtered columns automatically, and a missing index on a searched field is a silent performance bug — it shows up only as slow queries under real data.

---

## Index Types and When to Use Each

### Standard index — for searched/sorted non-unique fields

```csharp
builder.HasIndex(p => p.Status)
       .HasDatabaseName("IX_Items_Status");
```

Use when: the field is filtered or sorted but values can repeat.

### Unique index — for unique non-nullable fields

```csharp
builder.HasIndex(p => p.Slug)
       .IsUnique()
       .HasDatabaseName("IX_Pages_Slug");
```

Use when: the field must be unique across all rows and is always populated. For case-insensitive uniqueness, use a `citext` column (see `constraints-reference.md § EF Core / PostgreSQL`) so the index does the work.

### Nullable unique index — for optional unique fields

PostgreSQL treats `NULL` as distinct in unique indexes, so multiple rows with `NULL` are allowed. This is the correct behaviour for an optional unique field.

### Partial (filtered) unique index — for conditional uniqueness

```csharp
builder.HasIndex(p => new { p.Name, p.ReferenceDate })
       .IsUnique()
       .HasFilter("\"ReferenceDate\" IS NOT NULL")
       .HasDatabaseName("IX_Items_Name_ReferenceDate");
```

Use when: uniqueness applies only when a field is populated. Confirm the rule in the feature requirements before writing the index.

### Composite index — for multi-field searches or composite keys

```csharp
builder.HasIndex(p => new { p.ProjectId, p.BeneficiaryId })
       .HasDatabaseName("IX_Enrollments_ProjectId_BeneficiaryId");
```

Column order matters: put the most selective equality column first, and the sort column last. Verify with `EXPLAIN ANALYZE` on realistic data.

### Text search indexes

- Case-insensitive equality: `citext` column, or an expression index on `lower(...)`.
- Case- and accent-insensitive equality: PostgreSQL rejects `unaccent(...)` in an index expression because it is only `STABLE`. Wrap it once in an `IMMUTABLE` function and index that, created in a migration with explicit SQL:
  ```sql
  CREATE EXTENSION IF NOT EXISTS unaccent;
  CREATE FUNCTION immutable_unaccent(text) RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $$ SELECT public.unaccent('public.unaccent', $1) $$;
  CREATE INDEX "IX_Projects_Name_Unaccent" ON "Projects" (lower(immutable_unaccent("Name")));
  ```
  The query must produce the same expression, so map `immutable_unaccent` as a `DbFunction` (`HasDbFunction`) and compare `lower(immutable_unaccent(col))` in the repository. `EF.Functions.ILike` alone is case-insensitive only and does not use this index.
- Substring search (`ILIKE '%term%'`): trigram GIN index (`pg_trgm`) created with `migrationBuilder.Sql(...)`.
- Full-text search, if needed later: a `tsvector` column with a GIN index, decided in the feature design.

The index type is recorded in the feature's design. Do not add a trigram or full-text index speculatively.

---

## Rules

- **Declare indexes in the entity configuration**, not in migrations written by hand, unless the index is an expression or extension index (then SQL inside the migration).
- **Name every index** with `HasDatabaseName("IX_<Table>_<Columns>")`.
- **Do not index columns that are never filtered or sorted.** Every index slows writes.
- **Foreign keys get an index** unless the design records why not.
- **Verify** with `EXPLAIN ANALYZE` on a seeded test database when a query is performance-sensitive (Level B tests, `testing-test-types.md`).
- **Normalisation:** never add a C#-computed `*Normalized` column for search; see `constraints-registry.md`.

---
