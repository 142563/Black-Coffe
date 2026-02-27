using BlackCoffe.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers.V1;

[ApiController]
[Route("api/v1/catalog")]
public class CatalogController : ControllerBase
{
    private readonly ICatalogService _catalogService;

    public CatalogController(ICatalogService catalogService)
    {
        _catalogService = catalogService;
    }

    /// <summary>
    /// Lista categorias del catalogo.
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Categories(CancellationToken cancellationToken)
        => Ok(await _catalogService.GetCategoriesAsync(cancellationToken));

    /// <summary>
    /// Lista productos con filtros opcionales de categoria y busqueda.
    /// </summary>
    [HttpGet("products")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Products(
        [FromQuery] Guid? categoryId,
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        CancellationToken cancellationToken)
        => Ok(await _catalogService.GetProductsAsync(categoryId, search, page, pageSize, cancellationToken));

    /// <summary>
    /// Obtiene carta estructurada para renderizado directo del menu.
    /// </summary>
    [HttpGet("menu-board")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MenuBoard(CancellationToken cancellationToken)
        => Ok(await _catalogService.GetMenuBoardAsync(cancellationToken));
}
