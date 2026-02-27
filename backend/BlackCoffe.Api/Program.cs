using System.Reflection;
using System.Text.Json;
using BlackCoffe.Api.Configuration;
using BlackCoffe.Api.Health;
using BlackCoffe.Api.Middlewares;
using BlackCoffe.Api.Swagger;
using BlackCoffe.Domain.Entities;
using BlackCoffe.Domain.Enums;
using BlackCoffe.Infrastructure;
using BlackCoffe.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.Configure<BusinessSettingsOptions>(
    builder.Configuration.GetSection(BusinessSettingsOptions.SectionName));

builder.Services.AddProblemDetails();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var problem = new ValidationProblemDetails(context.ModelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Solicitud invalida.",
                Detail = "Revisa los datos enviados e intenta nuevamente.",
                Instance = context.HttpContext.Request.Path
            };
            problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
            return new BadRequestObjectResult(problem);
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", failureStatus: HealthStatus.Unhealthy, tags: ["ready", "db"]);

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Black Coffe API",
        Version = "v1",
        Description = "API REST para e-commerce y operacion interna de Black Coffe."
    });

    options.OperationFilter<ApiTagsOperationFilter>();
    options.OperationFilter<SwaggerExamplesOperationFilter>();

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa: Bearer {tu_token_jwt}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.WithOrigins("http://localhost:4200", "http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        if (allowedOrigins.Contains("*"))
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

var swaggerEnabled = app.Environment.IsDevelopment() || app.Configuration.GetValue("Swagger:Enabled", false);
if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Black Coffe API v1");
        options.DisplayRequestDuration();
    });
}

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("StartupBootstrap");
    var db = scope.ServiceProvider.GetRequiredService<BlackCoffeDbContext>();
    await EnsureDatabaseReadyAsync(db, logger);
    await EnsureDemoDataAsync(db, logger);
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = WriteHealthResponseAsync
});

app.Run();

static async Task WriteHealthResponseAsync(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";
    var payload = new
    {
        status = report.Status.ToString(),
        checks = report.Entries.Select(x => new
        {
            name = x.Key,
            status = x.Value.Status.ToString(),
            description = x.Value.Description,
            durationMs = x.Value.Duration.TotalMilliseconds
        }),
        totalDurationMs = report.TotalDuration.TotalMilliseconds
    };

    await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
}

static async Task EnsureDatabaseReadyAsync(BlackCoffeDbContext db, ILogger logger)
{
    if (await db.Database.CanConnectAsync())
    {
        return;
    }

    const string message = "No se pudo conectar a PostgreSQL. Configura ConnectionStrings__DefaultConnection antes de iniciar la API.";
    logger.LogCritical(message);
    throw new InvalidOperationException(message);
}

static async Task EnsureDemoDataAsync(BlackCoffeDbContext db, ILogger logger)
{
    var adminRole = await db.Roles.FirstOrDefaultAsync(x => x.Name == RoleType.Admin.ToString());
    if (adminRole is null)
    {
        adminRole = new Role
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = RoleType.Admin.ToString()
        };
        db.Roles.Add(adminRole);
    }

    if (!await db.Roles.AnyAsync(x => x.Name == RoleType.Staff.ToString()))
    {
        db.Roles.Add(new Role
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = RoleType.Staff.ToString()
        });
    }

    if (!await db.Roles.AnyAsync(x => x.Name == RoleType.Cliente.ToString()))
    {
        db.Roles.Add(new Role
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = RoleType.Cliente.ToString()
        });
    }

    var demoEmail = "julio.cesar.ticas.demo@blackcoffe.local";
    var demoUser = await db.Users
        .Include(x => x.Roles)
        .FirstOrDefaultAsync(x => x.Email == demoEmail);

    if (demoUser is null)
    {
        demoUser = new User
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            FullName = "Julio Cesar Ticas Palencia",
            Email = demoEmail,
            Phone = "50370001122",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("DemoCafe123*"),
            Status = UserStatus.Activo,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.Users.Add(demoUser);
        db.UserRoles.Add(new UserRole { User = demoUser, Role = adminRole });
    }
    else
    {
        demoUser.FullName = "Julio Cesar Ticas Palencia";
        demoUser.Phone = "50370001122";
        demoUser.Status = UserStatus.Activo;
        demoUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("DemoCafe123*");

        var hasAdminRole = demoUser.Roles.Any(x => x.RoleId == adminRole.Id);
        if (!hasAdminRole)
        {
            db.UserRoles.Add(new UserRole { UserId = demoUser.Id, RoleId = adminRole.Id });
        }
    }

    await EnsureMenuCatalogAsync(db);
    await db.SaveChangesAsync();
    logger.LogInformation("Bootstrap demo completado: {Email}", demoEmail);
}

static async Task EnsureMenuCatalogAsync(BlackCoffeDbContext db)
{
    var categoryIds = MenuBoardDefinitions.CategoryIds.ToArray();
    var categories = await db.Categories
        .Where(x => categoryIds.Contains(x.Id))
        .ToDictionaryAsync(x => x.Id);

    foreach (var seedCategory in MenuBoardDefinitions.Categories)
    {
        if (!categories.TryGetValue(seedCategory.Id, out var category))
        {
            db.Categories.Add(new Category
            {
                Id = seedCategory.Id,
                Name = seedCategory.Name,
                Description = seedCategory.Description,
                IsActive = seedCategory.IsActive
            });
            continue;
        }

        category.Name = seedCategory.Name;
        category.Description = seedCategory.Description;
        category.IsActive = seedCategory.IsActive;
    }

    var productIds = MenuBoardDefinitions.ProductIds.ToArray();
    var products = await db.Products
        .Where(x => productIds.Contains(x.Id))
        .ToDictionaryAsync(x => x.Id);

    foreach (var seedProduct in MenuBoardDefinitions.Products)
    {
        if (!products.TryGetValue(seedProduct.Id, out var product))
        {
            db.Products.Add(new Product
            {
                Id = seedProduct.Id,
                Name = seedProduct.Name,
                Description = seedProduct.Description,
                Price = seedProduct.Price,
                ImageUrl = seedProduct.ImageUrl,
                CategoryId = seedProduct.CategoryId,
                IsAvailable = seedProduct.IsAvailable
            });
            continue;
        }

        product.Name = seedProduct.Name;
        product.Description = seedProduct.Description;
        product.Price = seedProduct.Price;
        product.ImageUrl = seedProduct.ImageUrl;
        product.CategoryId = seedProduct.CategoryId;
        product.IsAvailable = seedProduct.IsAvailable;
    }
}
