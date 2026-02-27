using System.ComponentModel.DataAnnotations;

namespace BlackCoffe.Application.DTOs.Auth;

public record RegisterRequest(
    [param: Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [param: StringLength(120, MinimumLength = 3, ErrorMessage = "El nombre completo debe tener entre 3 y 120 caracteres.")]
    string FullName,
    [param: Required(ErrorMessage = "El correo es obligatorio.")]
    [param: EmailAddress(ErrorMessage = "El correo no tiene un formato valido.")]
    [param: StringLength(254)]
    string Email,
    [param: Required(ErrorMessage = "El telefono es obligatorio.")]
    [param: StringLength(24, MinimumLength = 8, ErrorMessage = "El telefono debe tener entre 8 y 24 caracteres.")]
    string Phone,
    [param: Required(ErrorMessage = "La contrasena es obligatoria.")]
    [param: StringLength(100, MinimumLength = 8, ErrorMessage = "La contrasena debe tener entre 8 y 100 caracteres.")]
    string Password);

public record LoginRequest(
    [param: Required(ErrorMessage = "El correo es obligatorio.")]
    [param: EmailAddress(ErrorMessage = "El correo no tiene un formato valido.")]
    [param: StringLength(254)]
    string Email,
    [param: Required(ErrorMessage = "La contrasena es obligatoria.")]
    [param: StringLength(100, MinimumLength = 8, ErrorMessage = "La contrasena debe tener entre 8 y 100 caracteres.")]
    string Password);

public record RefreshRequest(
    [param: Required(ErrorMessage = "El refresh token es obligatorio.")]
    [param: StringLength(300, MinimumLength = 20, ErrorMessage = "El refresh token no es valido.")]
    string RefreshToken);

public record AuthResponse(string AccessToken, string RefreshToken, DateTime ExpiresAtUtc, UserProfileDto User);
public record UserProfileDto(Guid Id, string FullName, string Email, string Phone, string Status, IReadOnlyCollection<string> Roles);

