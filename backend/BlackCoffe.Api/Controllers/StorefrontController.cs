using BlackCoffe.Application.DTOs.Storefront;
using BlackCoffe.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackCoffe.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/storefront")]
public class StorefrontController : ControllerBase
{
    private readonly IStorefrontService _storefrontService;

    public StorefrontController(IStorefrontService storefrontService)
    {
        _storefrontService = storefrontService;
    }

    [HttpGet("settings")]
    [ProducesResponseType(typeof(StorefrontSettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Settings(CancellationToken cancellationToken) =>
        Ok(await _storefrontService.GetSettingsAsync(cancellationToken));

    [HttpGet("banners")]
    [ProducesResponseType(typeof(IReadOnlyCollection<StorefrontBannerDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Banners(CancellationToken cancellationToken) =>
        Ok(await _storefrontService.GetBannersAsync(cancellationToken));
}
