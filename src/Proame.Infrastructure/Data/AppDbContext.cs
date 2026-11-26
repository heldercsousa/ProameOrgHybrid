using Microsoft.EntityFrameworkCore;

namespace Proame.Infrastructure.Data;

/// <summary>
/// The PROAME database context (PostgreSQL via Npgsql). No entities yet: the initial migration is empty.
/// Feature work adds DbSets and their configuration here.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
