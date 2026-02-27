using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BlackCoffe.Api.Swagger;

public sealed class ApiTagsOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var path = context.ApiDescription.RelativePath?.ToLowerInvariant() ?? string.Empty;
        var method = context.ApiDescription.HttpMethod?.ToUpperInvariant() ?? string.Empty;

        var tag = path switch
        {
            var p when p.StartsWith("api/v1/auth") => "Auth",
            var p when p.StartsWith("api/storefront") => "Storefront",
            var p when p.StartsWith("api/menu") => "Menu",
            var p when p.StartsWith("api/orders") && p.Contains("/invoice") => "Invoice",
            var p when p.StartsWith("api/orders") => "Orders",
            var p when p.StartsWith("api/v1/catalog") => "Menu",
            var p when p.StartsWith("api/v1/orders") && method == "POST" => "Cart",
            var p when p.StartsWith("api/v1/orders") => "Orders",
            var p when p.StartsWith("api/v1/reservations") => "Reservations",
            var p when p.StartsWith("api/v1/admin/inventory") => "Inventory",
            var p when p.StartsWith("api/v1/admin/orders") => "Orders",
            var p when p.StartsWith("api/v1/admin/reservations") => "Reservations",
            var p when p.StartsWith("api/v1/admin") => "Admin",
            var p when p.StartsWith("api/v1/users") => "Users",
            var p when p.StartsWith("api/v1/config") => "BusinessConfig",
            _ => "General"
        };

        operation.Tags = [new OpenApiTag { Name = tag }];
    }
}
