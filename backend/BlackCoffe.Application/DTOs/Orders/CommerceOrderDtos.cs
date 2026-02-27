using System.ComponentModel.DataAnnotations;
using BlackCoffe.Application.Validation;

namespace BlackCoffe.Application.DTOs.Orders;

public record OrderSummaryDto(
    decimal Subtotal,
    decimal Shipping,
    decimal IvaRate,
    decimal IvaAmount,
    decimal Total);

public record OrderPreviewItemRequestDto(
    [param: NotEmptyGuid(ErrorMessage = "Debe enviar un productId valido.")]
    Guid ProductId,
    [param: Range(1, 100, ErrorMessage = "La cantidad debe estar entre 1 y 100.")]
    int Quantity,
    [param: StringLength(80, ErrorMessage = "La variante no debe exceder 80 caracteres.")]
    string? Variant);

public record OrderPreviewRequestDto(
    [param: Required(ErrorMessage = "Debes enviar al menos un item.")]
    [param: MinLength(1, ErrorMessage = "Debes enviar al menos un item.")]
    IReadOnlyCollection<OrderPreviewItemRequestDto> Items);

public record OrderPreviewLineDto(
    Guid ProductId,
    string Name,
    string? Variant,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public record OrderPreviewResponseDto(
    IReadOnlyCollection<OrderPreviewLineDto> Items,
    OrderSummaryDto Summary);

public record PlaceOrderRequestDto(
    [param: Required(ErrorMessage = "El nombre del cliente es obligatorio.")]
    [param: StringLength(120, MinimumLength = 2, ErrorMessage = "El nombre del cliente debe tener entre 2 y 120 caracteres.")]
    string CustomerName,
    [param: Required(ErrorMessage = "El telefono del cliente es obligatorio.")]
    [param: StringLength(24, MinimumLength = 8, ErrorMessage = "El telefono del cliente debe tener entre 8 y 24 caracteres.")]
    string CustomerPhone,
    [param: StringLength(20, ErrorMessage = "El NIT no debe exceder 20 caracteres.")]
    string? CustomerNit,
    [param: StringLength(50, ErrorMessage = "El tipo de servicio no debe exceder 50 caracteres.")]
    string? ServiceType,
    [param: StringLength(500, ErrorMessage = "Las notas no deben exceder 500 caracteres.")]
    string? Notes,
    [param: Required(ErrorMessage = "Debes enviar al menos un item.")]
    [param: MinLength(1, ErrorMessage = "Debes enviar al menos un item.")]
    IReadOnlyCollection<OrderPreviewItemRequestDto> Items);

public record OrderCreateResponseDto(
    Guid OrderId,
    string Status,
    DateTime CreatedAt,
    OrderSummaryDto Summary);

public record InvoiceBusinessDto(
    string Name,
    string Address,
    string Phone,
    string Whatsapp,
    string HoursText);

public record InvoiceItemDto(
    string Name,
    int Qty,
    decimal UnitPrice,
    decimal LineTotal);

public record InvoiceDto(
    string InvoiceNumber,
    DateTime Date,
    string? CustomerName,
    string? CustomerNit,
    IReadOnlyCollection<InvoiceItemDto> Items,
    decimal Subtotal,
    decimal Shipping,
    decimal IvaRate,
    decimal IvaAmount,
    decimal Total,
    InvoiceBusinessDto Business,
    string BusinessMessage);
