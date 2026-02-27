using System.ComponentModel.DataAnnotations;
using BlackCoffe.Application.Validation;

namespace BlackCoffe.Application.DTOs.Reservations;

public record CreateReservationRequest(
    [param: NotEmptyGuid(ErrorMessage = "Debe enviar un tableId valido.")]
    Guid TableId,
    [param: Required(ErrorMessage = "La fecha y hora de reserva es obligatoria.")]
    DateTime ReservationAtUtc,
    [param: Range(1, 30, ErrorMessage = "El tamano del grupo debe estar entre 1 y 30 personas.")]
    int PartySize,
    [param: StringLength(500, ErrorMessage = "Las notas no deben exceder 500 caracteres.")]
    string Notes);

public record ReservationDto(Guid Id, Guid TableId, string TableName, DateTime ReservationAtUtc, int PartySize, string Status, string Notes, DateTime CreatedAtUtc);

public record UpdateReservationStatusRequest(
    [param: Required(ErrorMessage = "El estado de reserva es obligatorio.")]
    [param: RegularExpression("(?i)^(Pendiente|Confirmada|Cancelada|NoShow)$", ErrorMessage = "Estado de reserva invalido.")]
    string Status);

