namespace BlackCoffe.Api.Configuration;

public sealed class BusinessSettingsOptions
{
    public const string SectionName = "BusinessSettings";

    public string Name { get; set; } = "Black Coffe";
    public string Slogan { get; set; } = "Mas que una bebida... es un estilo de vida.";
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Hours { get; set; }
    public List<SocialLinkOptions> SocialLinks { get; set; } = [];
}

public sealed class SocialLinkOptions
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}
