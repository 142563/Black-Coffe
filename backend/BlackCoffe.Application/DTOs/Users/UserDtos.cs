using System.ComponentModel.DataAnnotations;

namespace BlackCoffe.Application.DTOs.Users;

public record AdminUserDto(Guid Id, string FullName, string Email, string Phone, string Status, IReadOnlyCollection<string> Roles, DateTime CreatedAtUtc);

public record UpdateUserStatusRequest(
    [param: Required(ErrorMessage = "El estado de usuario es obligatorio.")]
    [param: RegularExpression("(?i)^(Activo|Bloqueado)$", ErrorMessage = "Estado de usuario invalido.")]
    string Status);

public record UpdateUserRolesRequest(
    [param: Required(ErrorMessage = "Debe enviar al menos un rol.")]
    [param: MinLength(1, ErrorMessage = "Debe enviar al menos un rol.")]
    IReadOnlyCollection<string> Roles);

