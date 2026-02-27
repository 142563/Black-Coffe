using System.ComponentModel.DataAnnotations;
using BlackCoffe.Application.Validation;

namespace BlackCoffe.Application.DTOs.Inventory;

public record InventoryItemDto(Guid Id, string Name, string Unit, decimal CurrentStock, decimal MinimumStock, bool IsActive);

public record CreateInventoryItemRequest(
    [param: Required(ErrorMessage = "El nombre del item es obligatorio.")]
    [param: StringLength(120, MinimumLength = 2, ErrorMessage = "El nombre del item debe tener entre 2 y 120 caracteres.")]
    string Name,
    [param: Required(ErrorMessage = "La unidad es obligatoria.")]
    [param: StringLength(20, MinimumLength = 1, ErrorMessage = "La unidad debe tener entre 1 y 20 caracteres.")]
    string Unit,
    [param: Range(typeof(decimal), "0", "9999999", ErrorMessage = "El stock actual debe ser mayor o igual a 0.")]
    decimal CurrentStock,
    [param: Range(typeof(decimal), "0", "9999999", ErrorMessage = "El stock minimo debe ser mayor o igual a 0.")]
    decimal MinimumStock);

public record CreateStockMovementRequest(
    [param: NotEmptyGuid(ErrorMessage = "Debe enviar un inventoryItemId valido.")]
    Guid InventoryItemId,
    [param: Required(ErrorMessage = "El tipo de movimiento es obligatorio.")]
    [param: RegularExpression("(?i)^(Entrada|Salida|Ajuste)$", ErrorMessage = "Tipo de movimiento invalido.")]
    string Type,
    [param: Range(typeof(decimal), "0.0001", "9999999", ErrorMessage = "La cantidad debe ser mayor a 0.")]
    decimal Quantity,
    [param: StringLength(500, ErrorMessage = "Las notas no deben exceder 500 caracteres.")]
    string Notes);

public record LowStockAlertDto(Guid InventoryItemId, string Name, decimal CurrentStock, decimal MinimumStock);

