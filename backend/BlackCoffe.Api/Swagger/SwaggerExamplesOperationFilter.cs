using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BlackCoffe.Api.Swagger;

public sealed class SwaggerExamplesOperationFilter : IOperationFilter
{
    private static readonly Dictionary<(string Method, string Path), string> RequestExamples = new()
    {
        [("POST", "api/v1/auth/register")] =
            """{"fullName":"Ana Perez","email":"ana@correo.com","phone":"50370001133","password":"CafeSegura123*"}""",
        [("POST", "api/v1/auth/login")] =
            """{"email":"julio.cesar.ticas.demo@blackcoffe.local","password":"DemoCafe123*"}""",
        [("POST", "api/v1/auth/refresh")] =
            """{"refreshToken":"<refresh_token>"}""",
        [("POST", "api/v1/orders")] =
            """{"customerName":"Ana Perez","customerPhone":"50370001133","notes":"Recoger en restaurante","items":[{"productId":"44444444-4444-4444-4444-444444444444","quantity":2}]}""",
        [("POST", "api/v1/reservations")] =
            """{"tableId":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","reservationAtUtc":"2026-03-01T18:00:00Z","partySize":2,"notes":"Mesa junto a ventana"}"""
    };

    private static readonly Dictionary<(string Method, string Path, string StatusCode), string> ResponseExamples = new()
    {
        [("POST", "api/v1/auth/login", "200")] =
            """{"accessToken":"<jwt>","refreshToken":"<refresh>","expiresAtUtc":"2026-03-01T20:30:00Z","user":{"id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","fullName":"Julio Cesar Ticas Palencia","email":"julio.cesar.ticas.demo@blackcoffe.local","phone":"50370001122","status":"Activo","roles":["Admin"]}}""",
        [("POST", "api/v1/orders", "200")] =
            """{"id":"c0a80101-1111-2222-3333-444444444444","customerName":"Ana Perez","customerPhone":"50370001133","notes":"Recoger en restaurante","totalAmount":50.00,"status":"Pendiente","createdAtUtc":"2026-03-01T18:10:00Z","items":[{"productId":"44444444-4444-4444-4444-444444444444","productName":"Americano Tall","quantity":2,"unitPrice":25.00}]}""",
        [("POST", "api/v1/reservations", "200")] =
            """{"id":"d0a80101-1111-2222-3333-444444444444","tableId":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","tableName":"Mesa 1","reservationAtUtc":"2026-03-01T18:00:00Z","partySize":2,"status":"Pendiente","notes":"Mesa junto a ventana","createdAtUtc":"2026-03-01T17:50:00Z"}"""
    };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var method = context.ApiDescription.HttpMethod?.ToUpperInvariant() ?? string.Empty;
        var path = context.ApiDescription.RelativePath?.ToLowerInvariant() ?? string.Empty;

        if (RequestExamples.TryGetValue((method, path), out var requestExample)
            && operation.RequestBody?.Content is not null)
        {
            foreach (var mediaType in operation.RequestBody.Content.Values)
            {
                mediaType.Example = OpenApiAnyFactory.CreateFromJson(requestExample);
            }
        }

        foreach (var response in operation.Responses)
        {
            if (ResponseExamples.TryGetValue((method, path, response.Key), out var responseExample)
                && response.Value.Content is not null)
            {
                foreach (var mediaType in response.Value.Content.Values)
                {
                    mediaType.Example = OpenApiAnyFactory.CreateFromJson(responseExample);
                }
            }
        }
    }
}
