using BlackCoffe.Application.DTOs.Auth;
using BlackCoffe.Application.DTOs.Catalog;
using BlackCoffe.Application.DTOs.Inventory;
using BlackCoffe.Application.DTOs.Orders;
using BlackCoffe.Application.DTOs.Reservations;
using BlackCoffe.Application.DTOs.Storefront;
using BlackCoffe.Application.DTOs.Tables;
using BlackCoffe.Application.DTOs.Users;

namespace BlackCoffe.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);
}

public interface IUserService
{
    Task<UserProfileDto> GetMeAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<AdminUserDto>> GetAllAsync(int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Guid userId, UpdateUserStatusRequest request, CancellationToken cancellationToken = default);
    Task UpdateRolesAsync(Guid userId, UpdateUserRolesRequest request, CancellationToken cancellationToken = default);
}

public interface ICatalogService
{
    Task<IReadOnlyCollection<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ProductDto>> GetProductsAsync(Guid? categoryId, string? search, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task<MenuBoardDto> GetMenuBoardAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateCategoryAsync(UpsertCategoryRequest request, CancellationToken cancellationToken = default);
    Task<CategoryDto> UpdateCategoryAsync(Guid id, UpsertCategoryRequest request, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateProductAsync(UpsertProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateProductAsync(Guid id, UpsertProductRequest request, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IOrderService
{
    Task<OrderDto> CreateAsync(Guid userId, CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderDto>> GetMyOrdersAsync(Guid userId, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderDto>> GetAllAsync(int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default);
}

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(Guid userId, CreateReservationRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReservationDto>> GetMyReservationsAsync(Guid userId, int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReservationDto>> GetAllAsync(int? page = null, int? pageSize = null, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Guid reservationId, UpdateReservationStatusRequest request, CancellationToken cancellationToken = default);
}

public interface ITableService
{
    Task<IReadOnlyCollection<TableDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Guid tableId, UpdateTableStatusRequest request, CancellationToken cancellationToken = default);
}

public interface IInventoryService
{
    Task<IReadOnlyCollection<InventoryItemDto>> GetItemsAsync(CancellationToken cancellationToken = default);
    Task<InventoryItemDto> CreateItemAsync(CreateInventoryItemRequest request, CancellationToken cancellationToken = default);
    Task CreateMovementAsync(CreateStockMovementRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<LowStockAlertDto>> GetLowStockAlertsAsync(CancellationToken cancellationToken = default);
}

public interface IStorefrontService
{
    Task<StorefrontSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StorefrontBannerDto>> GetBannersAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StorefrontCategoryDto>> GetMenuCategoriesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<FeaturedMenuItemDto>> GetFeaturedMenuAsync(CancellationToken cancellationToken = default);
}

public interface ICommerceOrderService
{
    Task<OrderPreviewResponseDto> PreviewAsync(OrderPreviewRequestDto request, CancellationToken cancellationToken = default);
    Task<OrderCreateResponseDto> CreateAsync(Guid userId, PlaceOrderRequestDto request, CancellationToken cancellationToken = default);
    Task<InvoiceDto> GetInvoiceAsync(Guid orderId, Guid userId, bool isAdminOrWorker, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Guid orderId, string status, CancellationToken cancellationToken = default);
}
