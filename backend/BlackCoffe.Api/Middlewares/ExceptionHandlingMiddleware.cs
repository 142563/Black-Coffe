using BlackCoffe.Application;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BlackCoffe.Api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "Regla de negocio: {Message}", ex.Message);
            await WriteProblemDetailsAsync(context, ex.StatusCode, "Error de negocio", ex.Message);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error al persistir datos en la base de datos.");
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status503ServiceUnavailable,
                "Base de datos no disponible",
                "La base de datos no esta disponible temporalmente.");
        }
        catch (NpgsqlException ex)
        {
            _logger.LogError(ex, "Error de conectividad con PostgreSQL.");
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status503ServiceUnavailable,
                "No hay conexion con la base de datos",
                "No se pudo establecer conexion con la base de datos.");
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Timeout de infraestructura.");
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status503ServiceUnavailable,
                "Tiempo de espera agotado",
                "Tiempo de espera agotado al consultar base de datos.");
        }
        catch (OperationCanceledException ex) when (context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation(ex, "Solicitud cancelada por el cliente.");
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status499ClientClosedRequest,
                "Solicitud cancelada",
                "La solicitud fue cancelada por el cliente.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error interno no controlado.");
            await WriteProblemDetailsAsync(
                context,
                StatusCodes.Status500InternalServerError,
                "Error interno del servidor",
                "Ha ocurrido un error interno no controlado.");
        }
    }

    private async Task WriteProblemDetailsAsync(HttpContext context, int statusCode, string title, string detail)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{statusCode}",
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = context.TraceIdentifier;
        if (_environment.IsDevelopment())
        {
            problem.Extensions["method"] = context.Request.Method;
        }

        await context.Response.WriteAsJsonAsync(problem);
    }
}
