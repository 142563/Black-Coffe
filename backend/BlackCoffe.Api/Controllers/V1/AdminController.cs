using BlackCoffe.Application.DTOs.Catalog;
using BlackCoffe.Application.DTOs.Inventory;
using BlackCoffe.Application.DTOs.Orders;
using BlackCoffe.Application.DTOs.Reservations;
using BlackCoffe.Application.DTOs.Tables;
using BlackCoffe.Application.DTOs.Users;
using BlackCoffe.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers.V1;

[ApiController]
[Authorize(Policy = "AdminOrStaff")]
[Route("api/v1/admin")]
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICatalogService _catalogService;
    private readonly IOrderService _orderService;
    private readonly IReservationService _reservationService;
    private readonly ITableService _tableService;
    private readonly IInventoryService _inventoryService;

    public AdminController(
        IUserService userService,
        ICatalogService catalogService,
        IOrderService orderService,
        IReservationService reservationService,
        ITableService tableService,
        IInventoryService inventoryService)
    {
        _userService = userService;
        _catalogService = catalogService;
        _orderService = orderService;
        _reservationService = reservationService;
        _tableService = tableService;
        _inventoryService = inventoryService;
    }

    [HttpGet("users")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Users([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
        => Ok(await _userService.GetAllAsync(page, pageSize, cancellationToken));

    [HttpPatch("users/{id:guid}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request, CancellationToken cancellationToken)
    {
        await _userService.UpdateStatusAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpPatch("users/{id:guid}/roles")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateUserRoles(Guid id, [FromBody] UpdateUserRolesRequest request, CancellationToken cancellationToken)
    {
        await _userService.UpdateRolesAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] UpsertCategoryRequest request, CancellationToken cancellationToken)
        => Ok(await _catalogService.CreateCategoryAsync(request, cancellationToken));

    [HttpPut("categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpsertCategoryRequest request, CancellationToken cancellationToken)
        => Ok(await _catalogService.UpdateCategoryAsync(id, request, cancellationToken));

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        await _catalogService.DeleteCategoryAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] UpsertProductRequest request, CancellationToken cancellationToken)
        => Ok(await _catalogService.CreateProductAsync(request, cancellationToken));

    [HttpPut("products/{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpsertProductRequest request, CancellationToken cancellationToken)
        => Ok(await _catalogService.UpdateProductAsync(id, request, cancellationToken));

    [HttpDelete("products/{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        await _catalogService.DeleteProductAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpGet("orders")]
    public async Task<IActionResult> Orders([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
        => Ok(await _orderService.GetAllAsync(page, pageSize, cancellationToken));

    [HttpPatch("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        await _orderService.UpdateStatusAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpGet("reservations")]
    public async Task<IActionResult> Reservations([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
        => Ok(await _reservationService.GetAllAsync(page, pageSize, cancellationToken));

    [HttpPatch("reservations/{id:guid}/status")]
    public async Task<IActionResult> UpdateReservationStatus(Guid id, [FromBody] UpdateReservationStatusRequest request, CancellationToken cancellationToken)
    {
        await _reservationService.UpdateStatusAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpGet("tables")]
    public async Task<IActionResult> Tables(CancellationToken cancellationToken)
        => Ok(await _tableService.GetAllAsync(cancellationToken));

    [HttpPatch("tables/{id:guid}/status")]
    public async Task<IActionResult> UpdateTableStatus(Guid id, [FromBody] UpdateTableStatusRequest request, CancellationToken cancellationToken)
    {
        await _tableService.UpdateStatusAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpGet("inventory/items")]
    public async Task<IActionResult> InventoryItems(CancellationToken cancellationToken)
        => Ok(await _inventoryService.GetItemsAsync(cancellationToken));

    [HttpPost("inventory/items")]
    public async Task<IActionResult> CreateInventoryItem([FromBody] CreateInventoryItemRequest request, CancellationToken cancellationToken)
        => Ok(await _inventoryService.CreateItemAsync(request, cancellationToken));

    [HttpPost("inventory/movements")]
    public async Task<IActionResult> CreateInventoryMovement([FromBody] CreateStockMovementRequest request, CancellationToken cancellationToken)
    {
        await _inventoryService.CreateMovementAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpGet("inventory/alerts/low-stock")]
    public async Task<IActionResult> LowStock(CancellationToken cancellationToken)
        => Ok(await _inventoryService.GetLowStockAlertsAsync(cancellationToken));
}
