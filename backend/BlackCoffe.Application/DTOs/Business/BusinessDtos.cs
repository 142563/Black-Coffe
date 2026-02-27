namespace BlackCoffe.Application.DTOs.Business;

public record SocialLinkDto(string Platform, string Url);

public record BusinessSettingsDto(
    string Name,
    string Slogan,
    string? LogoUrl,
    string? Address,
    string? Phone,
    string? Hours,
    IReadOnlyCollection<SocialLinkDto> SocialLinks);
