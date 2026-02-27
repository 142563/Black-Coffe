namespace BlackCoffe.Application.DTOs.Storefront;

public record StorefrontSocialLinksDto(string Instagram, string Facebook);

public record StorefrontSettingsDto(
    string Name,
    string Tagline,
    string LogoUrl,
    string AccentColor,
    string Phone,
    string Whatsapp,
    string Address,
    string HoursText,
    string BusinessMessage,
    StorefrontSocialLinksDto SocialLinks);

public record StorefrontBannerDto(
    string Id,
    string Title,
    string Subtitle,
    string CtaText,
    string CtaLink,
    string Type,
    bool Active,
    int Order);

public record StorefrontCategoryDto(
    string Key,
    string Name,
    string IconKey,
    int Order,
    bool Visible);

public record FeaturedMenuItemDto(
    int Id,
    string Name,
    string CategoryKey,
    decimal PriceFrom,
    string BadgeText,
    string ImageUrl);
