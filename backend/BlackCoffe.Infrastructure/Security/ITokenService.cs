using BlackCoffe.Domain.Entities;

namespace BlackCoffe.Infrastructure.Security;

public interface ITokenService
{
    (string token, DateTime expiresAtUtc) GenerateAccessToken(User user, IReadOnlyCollection<string> roles);
    string GenerateRefreshToken();
}
