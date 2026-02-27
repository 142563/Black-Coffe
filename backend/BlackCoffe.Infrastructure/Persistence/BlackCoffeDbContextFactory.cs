using BlackCoffe.Infrastructure.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace BlackCoffe.Infrastructure.Persistence;

public class BlackCoffeDbContextFactory : IDesignTimeDbContextFactory<BlackCoffeDbContext>
{
    public BlackCoffeDbContext CreateDbContext(string[] args)
    {
        var basePath = ResolveApiBasePath();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var rawConnectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Missing connection string: DefaultConnection");
        var connectionString = PostgresConnectionStringNormalizer.Normalize(rawConnectionString);

        var optionsBuilder = new DbContextOptionsBuilder<BlackCoffeDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new BlackCoffeDbContext(optionsBuilder.Options);
    }

    private static string ResolveApiBasePath()
    {
        var current = Directory.GetCurrentDirectory();
        var candidates = new[]
        {
            Path.Combine(current, "BlackCoffe.Api"),
            Path.Combine(current, "..", "BlackCoffe.Api"),
            Path.Combine(current, "..", "..", "BlackCoffe.Api")
        };

        foreach (var candidate in candidates)
        {
            var fullPath = Path.GetFullPath(candidate);
            if (Directory.Exists(fullPath))
            {
                return fullPath;
            }
        }

        return current;
    }
}
