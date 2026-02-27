using BlackCoffe.Api.Configuration;
using BlackCoffe.Application.DTOs.Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace BlackCoffe.Api.Controllers.V1;

[ApiController]
[Route("api/v1/config")]
public class BusinessConfigController : ControllerBase
{
    private readonly IOptions<BusinessSettingsOptions> _businessSettings;

    public BusinessConfigController(IOptions<BusinessSettingsOptions> businessSettings)
    {
        _businessSettings = businessSettings;
    }

    /// <summary>
    /// Obtiene configuracion publica del negocio para personalizar el storefront.
    /// </summary>
    [HttpGet("business")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(BusinessSettingsDto), StatusCodes.Status200OK)]
    public IActionResult Business()
    {
        var settings = _businessSettings.Value;
        var response = new BusinessSettingsDto(
            settings.Name,
            settings.Slogan,
            settings.LogoUrl,
            settings.Address,
            settings.Phone,
            settings.Hours,
            settings.SocialLinks
                .Where(x => !string.IsNullOrWhiteSpace(x.Platform) && !string.IsNullOrWhiteSpace(x.Url))
                .Select(x => new SocialLinkDto(x.Platform, x.Url))
                .ToList());

        return Ok(response);
    }
}
