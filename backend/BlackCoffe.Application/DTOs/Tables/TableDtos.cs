using System.ComponentModel.DataAnnotations;

namespace BlackCoffe.Application.DTOs.Tables;

public record TableDto(Guid Id, string Name, int Capacity, string Status, bool IsActive);

public record UpdateTableStatusRequest(
    [param: Required(ErrorMessage = "El estado de mesa es obligatorio.")]
    [param: RegularExpression("(?i)^(Libre|Reservada|Ocupada|Mantenimiento)$", ErrorMessage = "Estado de mesa invalido.")]
    string Status);

