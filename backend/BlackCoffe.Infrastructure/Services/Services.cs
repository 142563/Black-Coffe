using System.Security.Claims;
using BlackCoffe.Application;
using BlackCoffe.Application.DTOs.Auth;
using BlackCoffe.Application.DTOs.Catalog;
using BlackCoffe.Application.DTOs.Inventory;
using BlackCoffe.Application.DTOs.Orders;
using BlackCoffe.Application.DTOs.Reservations;
using BlackCoffe.Application.DTOs.Tables;
using BlackCoffe.Application.DTOs.Users;
using BlackCoffe.Application.Interfaces;
using BlackCoffe.Domain.Entities;
using BlackCoffe.Domain.Enums;
using BlackCoffe.Infrastructure.Configuration;
using BlackCoffe.Infrastructure.Persistence;
using BlackCoffe.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BlackCoffe.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly BlackCoffeDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly JwtOptions _jwtOptions;

    public AuthService(BlackCoffeDbContext db, ITokenService tokenService, IOptions<JwtOptions> jwtOptions)
    {
        _db = db;
        _tokenService = tokenService;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(x => x.Email == email, cancellationToken))
        {
            throw new AppException("El correo ya esta registrado.", 409);
        }

        var clienteRole = await _db.Roles.FirstOrDefaultAsync(x => x.Name == RoleType.Cliente.ToString(), cancellationToken);
        if (clienteRole is null)
        {
            throw new AppException("No se encontro el rol Cliente. Verifica la configuracion inicial.", 503);
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Phone = request.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Status = UserStatus.Activo
        };

        user.Roles.Add(new UserRole { User = user, RoleId = clienteRole.Id });
        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return await BuildAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users
            .Include(x => x.Roles)
            .ThenInclude(x => x.Role)
            .Include(x => x.RefreshTokens)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new AppException("Credenciales invalidas.", 401);
        }

        if (user.Status == UserStatus.Bloqueado)
        {
            throw new AppException("Usuario bloqueado.", 403);
        }

        return await BuildAuthResponseAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var refresh = await _db.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x!.Roles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Token == request.RefreshToken && !x.Revoked, cancellationToken);

        if (refresh is null || refresh.ExpiresAtUtc < DateTime.UtcNow || refresh.User is null)
        {
            throw new AppException("Refresh token invalido.", 401);
        }

        refresh.Revoked = true;
        return await BuildAuthResponseAsync(refresh.User, cancellationToken);
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(User user, CancellationToken cancellationToken)
    {
        await _db.Entry(user).Collection(x => x.Roles).Query().Include(x => x.Role).LoadAsync(cancellationToken);
        var roles = user.Roles.Select(x => x.Role!.Name).ToArray();

        var (accessToken, expiresAt) = _tokenService.GenerateAccessToken(user, roles);
        var refreshTokenValue = _tokenService.GenerateRefreshToken();
        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays)
        });

        await _db.SaveChangesAsync(cancellationToken);

        var profile = new UserProfileDto(user.Id, user.FullName, user.Email, user.Phone, user.Status.ToString(), roles);
        return new AuthResponse(accessToken, refreshTokenValue, expiresAt, profile);
    }
}

public class UserService : IUserService
{
    private readonly BlackCoffeDbContext _db;

    public UserService(BlackCoffeDbContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto> GetMeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.Include(x => x.Roles).ThenInclude(x => x.Role).FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new AppException("Usuario no encontrado.", 404);

        return new UserProfileDto(user.Id, user.FullName, user.Email, user.Phone, user.Status.ToString(), user.Roles.Select(x => x.Role!.Name).ToArray());
    }

    public async Task<IReadOnlyCollection<AdminUserDto>> GetAllAsync(int? page = null, int? pageSize = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Users
            .Include(x => x.Roles).ThenInclude(x => x.Role)
            .OrderByDescending(x => x.CreatedAtUtc)
            .AsQueryable();

        query = PaginationHelper.Apply(query, page, pageSize);

        return await query
            .Select(x => new AdminUserDto(x.Id, x.FullName, x.Email, x.Phone, x.Status.ToString(), x.Roles.Select(r => r.Role!.Name).ToArray(), x.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateStatusAsync(Guid userId, UpdateUserStatusRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new AppException("Usuario no encontrado.", 404);

        if (!Enum.TryParse<UserStatus>(request.Status, true, out var status))
        {
            throw new AppException("Estado de usuario invalido.");
        }

        user.Status = status;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateRolesAsync(Guid userId, UpdateUserRolesRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.Include(x => x.Roles).FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new AppException("Usuario no encontrado.", 404);

        var validRoles = await _db.Roles.Where(x => request.Roles.Contains(x.Name)).ToListAsync(cancellationToken);
        if (validRoles.Count == 0)
        {
            throw new AppException("Debe enviar al menos un rol valido.");
        }

        _db.UserRoles.RemoveRange(user.Roles);
        foreach (var role in validRoles)
        {
            _db.UserRoles.Add(new UserRole { UserId = userId, RoleId = role.Id });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class CatalogService : ICatalogService
{
    private readonly BlackCoffeDbContext _db;

    public CatalogService(BlackCoffeDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default) =>
        await _db.Categories.OrderBy(x => x.Name).Select(x => new CategoryDto(x.Id, x.Name, x.Description, x.IsActive)).ToListAsync(cancellationToken);

    public async Task<IReadOnlyCollection<ProductDto>> GetProductsAsync(Guid? categoryId, string? search, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Products.Include(x => x.Category).AsQueryable();
        if (categoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search) || x.Description.Contains(search));
        }

        query = query.OrderBy(x => x.Name);
        query = PaginationHelper.Apply(query, page, pageSize);

        return await query
            .Select(x => new ProductDto(x.Id, x.Name, x.Description, x.Price, x.ImageUrl, x.CategoryId, x.Category!.Name, x.IsAvailable))
            .ToListAsync(cancellationToken);
    }

    public async Task<MenuBoardDto> GetMenuBoardAsync(CancellationToken cancellationToken = default)
    {
        var menuProductIds = MenuBoardDefinitions.ProductIds.ToArray();
        var menuProducts = await _db.Products
            .Where(x => menuProductIds.Contains(x.Id))
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Price,
                x.IsAvailable
            })
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        var sections = MenuBoardDefinitions.Sections
            .Select(section => new MenuSectionDto(
                section.Key,
                section.Title,
                section.Kind,
                section.Note,
                section.Rows.Select(row => new MenuRowDto(
                    row.Label,
                    row.Note,
                    row.Options.Select(option =>
                    {
                        var seed = MenuBoardDefinitions.ProductsByCode[option.ProductCode];
                        var hasDbProduct = menuProducts.TryGetValue(seed.Id, out var dbProduct);
                        return new MenuOptionDto(
                            seed.Id,
                            hasDbProduct ? dbProduct!.Name : seed.Name,
                            option.SizeLabel,
                            hasDbProduct ? dbProduct!.Price : seed.Price,
                            MenuBoardDefinitions.Currency,
                            hasDbProduct && dbProduct!.IsAvailable,
                            option.Group);
                    }).ToList()
                )).ToList()
            ))
            .ToList();

        return new MenuBoardDto(sections);
    }

    public async Task<CategoryDto> CreateCategoryAsync(UpsertCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = new Category { Name = request.Name.Trim(), Description = request.Description.Trim(), IsActive = request.IsActive };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);
        return new CategoryDto(category.Id, category.Name, category.Description, category.IsActive);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpsertCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new AppException("Categoria no encontrada.", 404);

        category.Name = request.Name.Trim();
        category.Description = request.Description.Trim();
        category.IsActive = request.IsActive;
        await _db.SaveChangesAsync(cancellationToken);
        return new CategoryDto(category.Id, category.Name, category.Description, category.IsActive);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new AppException("Categoria no encontrada.", 404);
        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProductDto> CreateProductAsync(UpsertProductRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Price < 0) throw new AppException("El precio no puede ser negativo.");
        var category = await _db.Categories.FirstOrDefaultAsync(x => x.Id == request.CategoryId, cancellationToken)
            ?? throw new AppException("Categoria no encontrada.", 404);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl.Trim(),
            CategoryId = request.CategoryId,
            IsAvailable = request.IsAvailable
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);
        return new ProductDto(product.Id, product.Name, product.Description, product.Price, product.ImageUrl, product.CategoryId, category.Name, product.IsAvailable);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpsertProductRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Price < 0) throw new AppException("El precio no puede ser negativo.");
        var category = await _db.Categories.FirstOrDefaultAsync(x => x.Id == request.CategoryId, cancellationToken)
            ?? throw new AppException("Categoria no encontrada.", 404);
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new AppException("Producto no encontrado.", 404);

        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Price = request.Price;
        product.ImageUrl = request.ImageUrl.Trim();
        product.CategoryId = request.CategoryId;
        product.IsAvailable = request.IsAvailable;
        await _db.SaveChangesAsync(cancellationToken);

        return new ProductDto(product.Id, product.Name, product.Description, product.Price, product.ImageUrl, product.CategoryId, category.Name, product.IsAvailable);
    }

    public async Task DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new AppException("Producto no encontrado.", 404);
        _db.Products.Remove(product);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class OrderService : IOrderService
{
    private readonly BlackCoffeDbContext _db;

    public OrderService(BlackCoffeDbContext db)
    {
        _db = db;
    }

    public async Task<OrderDto> CreateAsync(Guid userId, CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Items.Count == 0) throw new AppException("El pedido debe incluir items.");

        var productIds = request.Items.Select(x => x.ProductId).ToArray();
        var products = await _db.Products.Where(x => productIds.Contains(x.Id) && x.IsAvailable).ToListAsync(cancellationToken);

        var order = new Order
        {
            UserId = userId,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            Notes = request.Notes.Trim(),
            Status = OrderStatus.Pendiente
        };

        foreach (var item in request.Items)
        {
            var product = products.FirstOrDefault(x => x.Id == item.ProductId) ?? throw new AppException($"Producto no disponible: {item.ProductId}");
            if (item.Quantity <= 0) throw new AppException("La cantidad debe ser mayor a cero.");

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            });
        }

        order.TotalAmount = order.Items.Sum(x => x.Quantity * x.UnitPrice);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(cancellationToken);
        return await MapOrderAsync(order.Id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<OrderDto>> GetMyOrdersAsync(Guid userId, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default)
    {
        var idsQuery = _db.Orders
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => x.Id);
        idsQuery = PaginationHelper.Apply(idsQuery, page, pageSize);

        var ids = await idsQuery.ToListAsync(cancellationToken);
        var list = new List<OrderDto>();
        foreach (var id in ids) list.Add(await MapOrderAsync(id, cancellationToken));
        return list;
    }

    public async Task<IReadOnlyCollection<OrderDto>> GetAllAsync(int? page = null, int? pageSize = null, CancellationToken cancellationToken = default)
    {
        var idsQuery = _db.Orders
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => x.Id);
        idsQuery = PaginationHelper.Apply(idsQuery, page, pageSize);

        var ids = await idsQuery.ToListAsync(cancellationToken);
        var list = new List<OrderDto>();
        foreach (var id in ids) list.Add(await MapOrderAsync(id, cancellationToken));
        return list;
    }

    public async Task UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken)
            ?? throw new AppException("Pedido no encontrado.", 404);

        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var status))
        {
            throw new AppException("Estado de pedido invalido.");
        }

        order.Status = status;
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<OrderDto> MapOrderAsync(Guid id, CancellationToken cancellationToken)
    {
        var order = await _db.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstAsync(x => x.Id == id, cancellationToken);

        return new OrderDto(
            order.Id,
            order.CustomerName,
            order.CustomerPhone,
            order.Notes,
            order.TotalAmount,
            order.Status.ToString(),
            order.CreatedAtUtc,
            order.Items.Select(x => new OrderItemDto(x.ProductId, x.Product!.Name, x.Quantity, x.UnitPrice)).ToList());
    }
}

public class ReservationService : IReservationService
{
    private readonly BlackCoffeDbContext _db;

    public ReservationService(BlackCoffeDbContext db)
    {
        _db = db;
    }

    public async Task<ReservationDto> CreateAsync(Guid userId, CreateReservationRequest request, CancellationToken cancellationToken = default)
    {
        var table = await _db.Tables.FirstOrDefaultAsync(x => x.Id == request.TableId && x.IsActive, cancellationToken)
            ?? throw new AppException("Mesa no encontrada.", 404);

        if (request.PartySize > table.Capacity)
        {
            throw new AppException("La capacidad de la mesa es insuficiente.");
        }

        var conflict = await _db.Reservations.AnyAsync(x =>
            x.TableId == request.TableId &&
            x.ReservationAtUtc == request.ReservationAtUtc &&
            (x.Status == ReservationStatus.Pendiente || x.Status == ReservationStatus.Confirmada), cancellationToken);

        if (conflict)
        {
            throw new AppException("La mesa ya esta reservada en ese horario.");
        }

        var reservation = new Reservation
        {
            UserId = userId,
            TableId = request.TableId,
            ReservationAtUtc = request.ReservationAtUtc,
            PartySize = request.PartySize,
            Notes = request.Notes.Trim(),
            Status = ReservationStatus.Pendiente
        };

        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync(cancellationToken);
        return new ReservationDto(reservation.Id, table.Id, table.Name, reservation.ReservationAtUtc, reservation.PartySize, reservation.Status.ToString(), reservation.Notes, reservation.CreatedAtUtc);
    }

    public async Task<IReadOnlyCollection<ReservationDto>> GetMyReservationsAsync(Guid userId, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Reservations.Include(x => x.Table)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .AsQueryable();

        query = PaginationHelper.Apply(query, page, pageSize);

        return await query
            .Select(x => new ReservationDto(x.Id, x.TableId, x.Table!.Name, x.ReservationAtUtc, x.PartySize, x.Status.ToString(), x.Notes, x.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ReservationDto>> GetAllAsync(int? page = null, int? pageSize = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Reservations.Include(x => x.Table)
            .OrderByDescending(x => x.CreatedAtUtc)
            .AsQueryable();

        query = PaginationHelper.Apply(query, page, pageSize);

        return await query
            .Select(x => new ReservationDto(x.Id, x.TableId, x.Table!.Name, x.ReservationAtUtc, x.PartySize, x.Status.ToString(), x.Notes, x.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateStatusAsync(Guid reservationId, UpdateReservationStatusRequest request, CancellationToken cancellationToken = default)
    {
        var reservation = await _db.Reservations.FirstOrDefaultAsync(x => x.Id == reservationId, cancellationToken)
            ?? throw new AppException("Reserva no encontrada.", 404);

        if (!Enum.TryParse<ReservationStatus>(request.Status, true, out var status))
        {
            throw new AppException("Estado de reserva invalido.");
        }

        reservation.Status = status;
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class TableService : ITableService
{
    private readonly BlackCoffeDbContext _db;

    public TableService(BlackCoffeDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<TableDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Tables.OrderBy(x => x.Name).Select(x => new TableDto(x.Id, x.Name, x.Capacity, x.Status.ToString(), x.IsActive)).ToListAsync(cancellationToken);

    public async Task UpdateStatusAsync(Guid tableId, UpdateTableStatusRequest request, CancellationToken cancellationToken = default)
    {
        var table = await _db.Tables.FirstOrDefaultAsync(x => x.Id == tableId, cancellationToken)
            ?? throw new AppException("Mesa no encontrada.", 404);

        if (!Enum.TryParse<TableStatus>(request.Status, true, out var status))
        {
            throw new AppException("Estado de mesa invalido.");
        }

        table.Status = status;
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class InventoryService : IInventoryService
{
    private readonly BlackCoffeDbContext _db;

    public InventoryService(BlackCoffeDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<InventoryItemDto>> GetItemsAsync(CancellationToken cancellationToken = default) =>
        await _db.InventoryItems.OrderBy(x => x.Name).Select(x => new InventoryItemDto(x.Id, x.Name, x.Unit, x.CurrentStock, x.MinimumStock, x.IsActive)).ToListAsync(cancellationToken);

    public async Task<InventoryItemDto> CreateItemAsync(CreateInventoryItemRequest request, CancellationToken cancellationToken = default)
    {
        var item = new InventoryItem
        {
            Name = request.Name.Trim(),
            Unit = request.Unit.Trim(),
            CurrentStock = request.CurrentStock,
            MinimumStock = request.MinimumStock,
            IsActive = true
        };

        _db.InventoryItems.Add(item);
        await _db.SaveChangesAsync(cancellationToken);
        return new InventoryItemDto(item.Id, item.Name, item.Unit, item.CurrentStock, item.MinimumStock, item.IsActive);
    }

    public async Task CreateMovementAsync(CreateStockMovementRequest request, CancellationToken cancellationToken = default)
    {
        var item = await _db.InventoryItems.FirstOrDefaultAsync(x => x.Id == request.InventoryItemId, cancellationToken)
            ?? throw new AppException("Item de inventario no encontrado.", 404);

        if (!Enum.TryParse<StockMovementType>(request.Type, true, out var movementType))
        {
            throw new AppException("Tipo de movimiento invalido.");
        }

        if (request.Quantity <= 0)
        {
            throw new AppException("Cantidad invalida.");
        }

        var movement = new StockMovement
        {
            InventoryItemId = item.Id,
            Quantity = request.Quantity,
            Notes = request.Notes.Trim(),
            Type = movementType
        };

        _db.StockMovements.Add(movement);

        if (movementType == StockMovementType.Entrada) item.CurrentStock += request.Quantity;
        if (movementType == StockMovementType.Salida) item.CurrentStock -= request.Quantity;
        if (movementType == StockMovementType.Ajuste) item.CurrentStock = request.Quantity;

        if (item.CurrentStock < 0) throw new AppException("El stock no puede quedar negativo.");
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<LowStockAlertDto>> GetLowStockAlertsAsync(CancellationToken cancellationToken = default) =>
        await _db.InventoryItems
            .Where(x => x.IsActive && x.CurrentStock < x.MinimumStock)
            .OrderBy(x => x.CurrentStock)
            .Select(x => new LowStockAlertDto(x.Id, x.Name, x.CurrentStock, x.MinimumStock))
            .ToListAsync(cancellationToken);
}

internal static class PaginationHelper
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public static IQueryable<T> Apply<T>(IQueryable<T> query, int? page, int? pageSize)
    {
        if (!page.HasValue && !pageSize.HasValue)
        {
            return query;
        }

        var safePage = page.GetValueOrDefault(DefaultPage);
        if (safePage < 1)
        {
            safePage = DefaultPage;
        }

        var safePageSize = pageSize.GetValueOrDefault(DefaultPageSize);
        if (safePageSize < 1)
        {
            safePageSize = DefaultPageSize;
        }
        else if (safePageSize > MaxPageSize)
        {
            safePageSize = MaxPageSize;
        }

        return query.Skip((safePage - 1) * safePageSize).Take(safePageSize);
    }
}

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue(ClaimTypes.Name);
        return Guid.TryParse(value, out var id) ? id : Guid.Empty;
    }
}
