using BlackCoffe.Application.DTOs.Orders;
using BlackCoffe.Application.Interfaces;
using BlackCoffe.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly ICommerceOrderService _commerceOrderService;

    public OrdersController(ICommerceOrderService commerceOrderService)
    {
        _commerceOrderService = commerceOrderService;
    }

    [HttpPost("preview")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OrderPreviewResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Preview([FromBody] OrderPreviewRequestDto request, CancellationToken cancellationToken) =>
        Ok(await _commerceOrderService.PreviewAsync(request, cancellationToken));

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(OrderCreateResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] PlaceOrderRequestDto request, CancellationToken cancellationToken) =>
        Ok(await _commerceOrderService.CreateAsync(User.GetUserId(), request, cancellationToken));

    [HttpGet("{id:guid}/invoice")]
    [Authorize]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Invoice(Guid id, CancellationToken cancellationToken)
    {
        var isAdminOrWorker = User.IsInRole("Admin") || User.IsInRole("Staff") || User.IsInRole("Worker");
        var invoice = await _commerceOrderService.GetInvoiceAsync(id, User.GetUserId(), isAdminOrWorker, cancellationToken);
        return Ok(invoice);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "AdminOrWorker")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        await _commerceOrderService.UpdateStatusAsync(id, request.Status, cancellationToken);
        return NoContent();
    }
}
