namespace BlackCoffe.Infrastructure.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "BlackCoffe.Api";
    public string Audience { get; set; } = "BlackCoffe.Clients";
    public string SecretKey { get; set; } = "super-secret-key-please-change-in-production";
    public int AccessTokenMinutes { get; set; } = 60;
    public int RefreshTokenDays { get; set; } = 7;
}
