using BlackCoffe.Application.DTOs.Orders;
using BlackCoffe.Application.Interfaces;
using BlackCoffe.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers.V1;

[ApiController]
[Authorize]
[Route("api/v1/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    /// <summary>
    /// Crea un pedido para el usuario autenticado.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
        => Ok(await _orderService.CreateAsync(User.GetUserId(), request, cancellationToken));

    /// <summary>
    /// Lista los pedidos del usuario autenticado.
    /// </summary>
    [HttpGet("my")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> My([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
        => Ok(await _orderService.GetMyOrdersAsync(User.GetUserId(), page, pageSize, cancellationToken));
}
