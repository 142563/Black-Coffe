using System.Text.Json;
using BlackCoffe.Application.DTOs.Storefront;
using BlackCoffe.Application.Interfaces;
using Microsoft.Extensions.Hosting;

namespace BlackCoffe.Infrastructure.Services;

public sealed class StorefrontService : IStorefrontService
{
    private readonly string _seedRootPath;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public StorefrontService(IHostEnvironment hostEnvironment)
    {
        _seedRootPath = Path.Combine(hostEnvironment.ContentRootPath, "SeedData", "storefront");
    }

    public async Task<StorefrontSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var fallback = new StorefrontSettingsDto(
            "Black Coffe",
            "Cafe premium, rapido y a tu manera",
            "/assets/brand/logo-blackcoffe.svg",
            "#C6A15B",
            "+502 0000-0000",
            "+502 0000-0000",
            "Escuintla, Guatemala",
            "Lun-Vie 7:00-19:00 | Sab-Dom 8:00-18:00",
            "Pedidos listos en 10-15 min | Calidad premium | Reservas disponibles",
            new StorefrontSocialLinksDto("https://instagram.com/", "https://facebook.com/"));

        var model = await ReadSeedAsync("settings.json", new StorefrontSettingsSeedModel(), cancellationToken);
        if (model is null)
        {
            return fallback;
        }

        return new StorefrontSettingsDto(
            string.IsNullOrWhiteSpace(model.Name) ? fallback.Name : model.Name,
            string.IsNullOrWhiteSpace(model.Tagline) ? fallback.Tagline : model.Tagline,
            string.IsNullOrWhiteSpace(model.LogoUrl) ? fallback.LogoUrl : model.LogoUrl,
            string.IsNullOrWhiteSpace(model.AccentColor) ? fallback.AccentColor : model.AccentColor,
            string.IsNullOrWhiteSpace(model.Phone) ? fallback.Phone : model.Phone,
            string.IsNullOrWhiteSpace(model.Whatsapp) ? fallback.Whatsapp : model.Whatsapp,
            string.IsNullOrWhiteSpace(model.Address) ? fallback.Address : model.Address,
            string.IsNullOrWhiteSpace(model.HoursText) ? fallback.HoursText : model.HoursText,
            string.IsNullOrWhiteSpace(model.BusinessMessage) ? fallback.BusinessMessage : model.BusinessMessage,
            new StorefrontSocialLinksDto(
                model.SocialLinks?.Instagram ?? fallback.SocialLinks.Instagram,
                model.SocialLinks?.Facebook ?? fallback.SocialLinks.Facebook));
    }

    public async Task<IReadOnlyCollection<StorefrontBannerDto>> GetBannersAsync(CancellationToken cancellationToken = default)
    {
        var models = await ReadSeedAsync("banners.json", Array.Empty<StorefrontBannerSeedModel>(), cancellationToken);
        return models
            .Where(x => x.Active)
            .OrderBy(x => x.Order)
            .Select(x => new StorefrontBannerDto(
                x.Id,
                x.Title,
                x.Subtitle,
                x.CtaText,
                x.CtaLink,
                x.Type,
                x.Active,
                x.Order))
            .ToList();
    }

    public async Task<IReadOnlyCollection<StorefrontCategoryDto>> GetMenuCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var models = await ReadSeedAsync("categories.json", Array.Empty<StorefrontCategorySeedModel>(), cancellationToken);
        return models
            .Where(x => x.Visible)
            .OrderBy(x => x.Order)
            .Select(x => new StorefrontCategoryDto(
                x.Key,
                x.Name,
                x.IconKey,
                x.Order,
                x.Visible))
            .ToList();
    }

    public async Task<IReadOnlyCollection<FeaturedMenuItemDto>> GetFeaturedMenuAsync(CancellationToken cancellationToken = default)
    {
        var models = await ReadSeedAsync("featured.json", Array.Empty<FeaturedMenuItemSeedModel>(), cancellationToken);
        return models
            .Select(x => new FeaturedMenuItemDto(
                x.Id,
                x.Name,
                x.CategoryKey,
                x.PriceFrom,
                x.BadgeText,
                x.ImageUrl))
            .ToList();
    }

    private async Task<T> ReadSeedAsync<T>(string fileName, T fallback, CancellationToken cancellationToken)
    {
        var path = Path.Combine(_seedRootPath, fileName);
        if (!File.Exists(path))
        {
            return fallback;
        }

        try
        {
            var json = await File.ReadAllTextAsync(path, cancellationToken);
            var parsed = JsonSerializer.Deserialize<T>(json, _jsonOptions);
            return parsed is null ? fallback : parsed;
        }
        catch
        {
            return fallback;
        }
    }

    private sealed class StorefrontSettingsSeedModel
    {
        public string Name { get; set; } = string.Empty;
        public string Tagline { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string AccentColor { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Whatsapp { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string HoursText { get; set; } = string.Empty;
        public string BusinessMessage { get; set; } = string.Empty;
        public StorefrontSocialLinksSeedModel? SocialLinks { get; set; }
    }

    private sealed class StorefrontSocialLinksSeedModel
    {
        public string Instagram { get; set; } = string.Empty;
        public string Facebook { get; set; } = string.Empty;
    }

    private sealed class StorefrontBannerSeedModel
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string CtaText { get; set; } = string.Empty;
        public string CtaLink { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Active { get; set; }
        public int Order { get; set; }
    }

    private sealed class StorefrontCategorySeedModel
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string IconKey { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool Visible { get; set; }
    }

    private sealed class FeaturedMenuItemSeedModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CategoryKey { get; set; } = string.Empty;
        public decimal PriceFrom { get; set; }
        public string BadgeText { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }
}
