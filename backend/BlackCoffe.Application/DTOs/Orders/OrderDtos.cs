using System.ComponentModel.DataAnnotations;
using BlackCoffe.Application.Validation;

namespace BlackCoffe.Application.DTOs.Orders;

public record CreateOrderItemRequest(
    [param: NotEmptyGuid(ErrorMessage = "Debe enviar un productId valido.")]
    Guid ProductId,
    [param: Range(1, 100, ErrorMessage = "La cantidad debe estar entre 1 y 100.")]
    int Quantity);

public record CreateOrderRequest(
    [param: Required(ErrorMessage = "El nombre del cliente es obligatorio.")]
    [param: StringLength(120, MinimumLength = 2, ErrorMessage = "El nombre del cliente debe tener entre 2 y 120 caracteres.")]
    string CustomerName,
    [param: Required(ErrorMessage = "El telefono del cliente es obligatorio.")]
    [param: StringLength(24, MinimumLength = 8, ErrorMessage = "El telefono del cliente debe tener entre 8 y 24 caracteres.")]
    string CustomerPhone,
    [param: StringLength(500, ErrorMessage = "Las notas no deben exceder 500 caracteres.")]
    string Notes,
    [param: Required(ErrorMessage = "Debe enviar al menos un item.")]
    [param: MinLength(1, ErrorMessage = "Debe enviar al menos un item.")]
    IReadOnlyCollection<CreateOrderItemRequest> Items);

public record OrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal UnitPrice);
public record OrderDto(Guid Id, string CustomerName, string CustomerPhone, string Notes, decimal TotalAmount, string Status, DateTime CreatedAtUtc, IReadOnlyCollection<OrderItemDto> Items);

public record UpdateOrderStatusRequest(
    [param: Required(ErrorMessage = "El estado del pedido es obligatorio.")]
    [param: RegularExpression("(?i)^(Pendiente|Confirmado|Preparando|Listo|Entregado|Cancelado)$", ErrorMessage = "Estado de pedido invalido.")]
    string Status);

