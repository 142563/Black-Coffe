using Npgsql;

namespace BlackCoffe.Infrastructure.Configuration;

public static class PostgresConnectionStringNormalizer
{
    public static string Normalize(string rawConnectionString)
    {
        if (string.IsNullOrWhiteSpace(rawConnectionString))
        {
            throw new InvalidOperationException("Connection string is empty.");
        }

        var trimmed = rawConnectionString.Trim();
        if (trimmed.StartsWith("Host=", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("Server=", StringComparison.OrdinalIgnoreCase))
        {
            return trimmed;
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "postgresql" && uri.Scheme != "postgres"))
        {
            return trimmed;
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432
        };

        var database = uri.AbsolutePath.Trim('/');
        if (!string.IsNullOrWhiteSpace(database))
        {
            builder.Database = Uri.UnescapeDataString(database);
        }

        if (!string.IsNullOrWhiteSpace(uri.UserInfo))
        {
            var userInfoParts = uri.UserInfo.Split(':', 2);
            builder.Username = Uri.UnescapeDataString(userInfoParts[0]);
            if (userInfoParts.Length > 1)
            {
                builder.Password = Uri.UnescapeDataString(userInfoParts[1]);
            }
        }

        foreach (var (key, value) in ParseQuery(uri.Query))
        {
            switch (key.ToLowerInvariant())
            {
                case "sslmode":
                    if (Enum.TryParse<SslMode>(value, true, out var sslMode))
                    {
                        builder.SslMode = sslMode;
                    }
                    break;
                case "channel_binding":
                    if (Enum.TryParse<ChannelBinding>(value, true, out var channelBinding))
                    {
                        builder.ChannelBinding = channelBinding;
                    }
                    break;
                default:
                    TryAssignExtraParameter(builder, key, value);
                    break;
            }
        }

        return builder.ConnectionString;
    }

    private static IEnumerable<(string Key, string Value)> ParseQuery(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            yield break;
        }

        foreach (var pair in query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = pair.Split('=', 2);
            var key = Uri.UnescapeDataString(kv[0]);
            var value = kv.Length > 1 ? Uri.UnescapeDataString(kv[1]) : string.Empty;
            yield return (key, value);
        }
    }

    private static void TryAssignExtraParameter(NpgsqlConnectionStringBuilder builder, string key, string value)
    {
        try
        {
            builder[key] = value;
        }
        catch (ArgumentException)
        {
            // Ignore unknown URI parameters not supported by Npgsql builder.
        }
    }
}
