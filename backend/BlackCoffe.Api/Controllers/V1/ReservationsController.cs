using BlackCoffe.Application.DTOs.Reservations;
using BlackCoffe.Application.Interfaces;
using BlackCoffe.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers.V1;

[ApiController]
[Authorize]
[Route("api/v1/reservations")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    /// <summary>
    /// Crea una reserva para el usuario autenticado.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ReservationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateReservationRequest request, CancellationToken cancellationToken)
        => Ok(await _reservationService.CreateAsync(User.GetUserId(), request, cancellationToken));

    /// <summary>
    /// Lista las reservas del usuario autenticado.
    /// </summary>
    [HttpGet("my")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> My([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
        => Ok(await _reservationService.GetMyReservationsAsync(User.GetUserId(), page, pageSize, cancellationToken));
}
