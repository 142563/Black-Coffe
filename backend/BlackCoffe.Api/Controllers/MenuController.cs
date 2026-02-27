using BlackCoffe.Application.DTOs.Storefront;
using BlackCoffe.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly IStorefrontService _storefrontService;

    public MenuController(IStorefrontService storefrontService)
    {
        _storefrontService = storefrontService;
    }

    [HttpGet("categories")]
    [ProducesResponseType(typeof(IReadOnlyCollection<StorefrontCategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Categories(CancellationToken cancellationToken) =>
        Ok(await _storefrontService.GetMenuCategoriesAsync(cancellationToken));

    [HttpGet("featured")]
    [ProducesResponseType(typeof(IReadOnlyCollection<FeaturedMenuItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Featured(CancellationToken cancellationToken) =>
        Ok(await _storefrontService.GetFeaturedMenuAsync(cancellationToken));
}
