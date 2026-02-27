using System.Collections.Concurrent;
using BlackCoffe.Application;
using BlackCoffe.Application.DTOs.Orders;
using BlackCoffe.Application.Interfaces;
using BlackCoffe.Domain.Entities;
using BlackCoffe.Domain.Enums;
using BlackCoffe.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BlackCoffe.Infrastructure.Services;

public sealed class CommerceOrderService : ICommerceOrderService
{
    private const decimal IvaRate = 0.12m;
    private const decimal ShippingCost = 0.00m;

    private static int _invoiceSequence = 0;
    private static readonly ConcurrentDictionary<Guid, string> InvoiceNumbers = new();
    private static readonly ConcurrentDictionary<Guid, OrderMetaData> OrderMetadata = new();

    private readonly BlackCoffeDbContext _dbContext;
    private readonly IStorefrontService _storefrontService;

    public CommerceOrderService(BlackCoffeDbContext dbContext, IStorefrontService storefrontService)
    {
        _dbContext = dbContext;
        _storefrontService = storefrontService;
    }

    public async Task<OrderPreviewResponseDto> PreviewAsync(
        OrderPreviewRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (request.Items.Count == 0)
        {
            throw new AppException("El pedido debe incluir al menos un item.");
        }

        var normalizedItems = request.Items
            .GroupBy(
                x => new
                {
                    x.ProductId,
                    Variant = (x.Variant ?? string.Empty).Trim()
                })
            .Select(group => new
            {
                group.Key.ProductId,
                Variant = string.IsNullOrWhiteSpace(group.Key.Variant) ? null : group.Key.Variant,
                Quantity = group.Sum(x => x.Quantity)
            })
            .ToList();

        var productIds = normalizedItems.Select(x => x.ProductId).Distinct().ToArray();
        var products = await _dbContext.Products
            .Where(x => productIds.Contains(x.Id) && x.IsAvailable)
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        var lines = new List<OrderPreviewLineDto>(normalizedItems.Count);
        foreach (var item in normalizedItems)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
            {
                throw new AppException($"Producto no disponible: {item.ProductId}", 404);
            }

            var unitPrice = RoundMoney(product.Price);
            var lineTotal = RoundMoney(unitPrice * item.Quantity);
            lines.Add(new OrderPreviewLineDto(
                item.ProductId,
                product.Name,
                item.Variant,
                item.Quantity,
                unitPrice,
                lineTotal));
        }

        var summary = BuildSummary(lines.Sum(x => x.LineTotal));
        return new OrderPreviewResponseDto(lines, summary);
    }

    public async Task<OrderCreateResponseDto> CreateAsync(
        Guid userId,
        PlaceOrderRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
        {
            throw new AppException("Debes iniciar sesion para crear pedidos.", 401);
        }

        var preview = await PreviewAsync(new OrderPreviewRequestDto(request.Items), cancellationToken);
        var order = new Order
        {
            UserId = userId,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            Notes = BuildOrderNotes(request.ServiceType, request.CustomerNit, request.Notes),
            Status = OrderStatus.Pendiente,
            TotalAmount = preview.Summary.Total
        };

        foreach (var line in preview.Items)
        {
            order.Items.Add(new OrderItem
            {
                ProductId = line.ProductId,
                Quantity = line.Quantity,
                UnitPrice = line.UnitPrice
            });
        }

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync(cancellationToken);

        OrderMetadata[order.Id] = new OrderMetaData(
            string.IsNullOrWhiteSpace(request.CustomerNit) ? null : request.CustomerNit.Trim(),
            string.IsNullOrWhiteSpace(request.ServiceType) ? null : request.ServiceType.Trim());

        return new OrderCreateResponseDto(
            order.Id,
            order.Status.ToString(),
            order.CreatedAtUtc,
            preview.Summary);
    }

    public async Task<InvoiceDto> GetInvoiceAsync(
        Guid orderId,
        Guid userId,
        bool isAdminOrWorker,
        CancellationToken cancellationToken = default)
    {
        var order = await _dbContext.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken)
            ?? throw new AppException("Pedido no encontrado.", 404);

        if (!isAdminOrWorker && order.UserId != userId)
        {
            throw new AppException("No autorizado para ver esta factura.", 403);
        }

        var invoiceItems = order.Items
            .Select(x =>
            {
                var lineTotal = RoundMoney(x.UnitPrice * x.Quantity);
                return new InvoiceItemDto(
                    x.Product?.Name ?? x.ProductId.ToString(),
                    x.Quantity,
                    RoundMoney(x.UnitPrice),
                    lineTotal);
            })
            .ToList();

        var summary = BuildSummary(invoiceItems.Sum(x => x.LineTotal));
        var settings = await _storefrontService.GetSettingsAsync(cancellationToken);
        var invoiceNumber = InvoiceNumbers.GetOrAdd(order.Id, _ => NextInvoiceNumber());

        var customerNit = ResolveCustomerNit(order.Id, order.Notes);
        var business = new InvoiceBusinessDto(
            settings.Name,
            settings.Address,
            settings.Phone,
            settings.Whatsapp,
            settings.HoursText);

        return new InvoiceDto(
            invoiceNumber,
            order.CreatedAtUtc,
            order.CustomerName,
            customerNit,
            invoiceItems,
            summary.Subtotal,
            summary.Shipping,
            summary.IvaRate,
            summary.IvaAmount,
            summary.Total,
            business,
            settings.BusinessMessage);
    }

    public async Task UpdateStatusAsync(Guid orderId, string status, CancellationToken cancellationToken = default)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken)
            ?? throw new AppException("Pedido no encontrado.", 404);

        if (!Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            throw new AppException("Estado de pedido invalido.");
        }

        order.Status = parsedStatus;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static OrderSummaryDto BuildSummary(decimal subtotal)
    {
        var safeSubtotal = RoundMoney(subtotal);
        var ivaAmount = RoundMoney(safeSubtotal * IvaRate);
        var total = RoundMoney(safeSubtotal + ShippingCost + ivaAmount);
        return new OrderSummaryDto(
            safeSubtotal,
            ShippingCost,
            IvaRate,
            ivaAmount,
            total);
    }

    private static decimal RoundMoney(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);

    private static string BuildOrderNotes(string? serviceType, string? customerNit, string? notes)
    {
        var chunks = new List<string>();
        if (!string.IsNullOrWhiteSpace(serviceType))
        {
            chunks.Add($"ServiceType:{serviceType.Trim()}");
        }

        if (!string.IsNullOrWhiteSpace(customerNit))
        {
            chunks.Add($"NIT:{customerNit.Trim()}");
        }

        if (!string.IsNullOrWhiteSpace(notes))
        {
            chunks.Add(notes.Trim());
        }

        return string.Join(" | ", chunks);
    }

    private static string? ResolveCustomerNit(Guid orderId, string notes)
    {
        if (OrderMetadata.TryGetValue(orderId, out var metadata) && !string.IsNullOrWhiteSpace(metadata.CustomerNit))
        {
            return metadata.CustomerNit;
        }

        var marker = "NIT:";
        var index = notes.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (index < 0)
        {
            return null;
        }

        var tail = notes[(index + marker.Length)..];
        var token = tail.Split('|', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return string.IsNullOrWhiteSpace(token) ? null : token;
    }

    private static string NextInvoiceNumber()
    {
        var number = Interlocked.Increment(ref _invoiceSequence);
        return $"BC-{number:D6}";
    }

    private sealed record OrderMetaData(string? CustomerNit, string? ServiceType);
}
