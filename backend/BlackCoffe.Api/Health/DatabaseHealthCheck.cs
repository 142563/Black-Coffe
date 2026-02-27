using BlackCoffe.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace BlackCoffe.Api.Health;

public sealed class DatabaseHealthCheck : IHealthCheck
{
    private readonly BlackCoffeDbContext _dbContext;

    public DatabaseHealthCheck(BlackCoffeDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
            return canConnect
                ? HealthCheckResult.Healthy("Conexion con PostgreSQL disponible.")
                : HealthCheckResult.Unhealthy("No se pudo conectar con PostgreSQL.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Error verificando conectividad con PostgreSQL.", ex);
        }
    }
}
