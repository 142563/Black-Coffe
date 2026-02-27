using System.ComponentModel.DataAnnotations;
using BlackCoffe.Application.Validation;

namespace BlackCoffe.Application.DTOs.Catalog;

public record CategoryDto(Guid Id, string Name, string Description, bool IsActive);
public record ProductDto(Guid Id, string Name, string Description, decimal Price, string ImageUrl, Guid CategoryId, string CategoryName, bool IsAvailable);
public record MenuBoardDto(IReadOnlyCollection<MenuSectionDto> Sections);
public record MenuSectionDto(string Key, string Title, string Kind, string? Note, IReadOnlyCollection<MenuRowDto> Rows);
public record MenuRowDto(string Label, string? Note, IReadOnlyCollection<MenuOptionDto> Options);
public record MenuOptionDto(Guid ProductId, string Label, string SizeLabel, decimal Price, string Currency, bool Available, string Group);

public record UpsertCategoryRequest(
    [param: Required(ErrorMessage = "El nombre de categoria es obligatorio.")]
    [param: StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre de categoria debe tener entre 2 y 100 caracteres.")]
    string Name,
    [param: StringLength(300, ErrorMessage = "La descripcion de categoria no debe exceder 300 caracteres.")]
    string Description,
    bool IsActive);

public record UpsertProductRequest(
    [param: Required(ErrorMessage = "El nombre del producto es obligatorio.")]
    [param: StringLength(120, MinimumLength = 2, ErrorMessage = "El nombre del producto debe tener entre 2 y 120 caracteres.")]
    string Name,
    [param: StringLength(500, ErrorMessage = "La descripcion no debe exceder 500 caracteres.")]
    string Description,
    [param: Range(typeof(decimal), "0", "9999999", ErrorMessage = "El precio debe ser mayor o igual a 0.")]
    decimal Price,
    [param: StringLength(500, ErrorMessage = "La URL de imagen no debe exceder 500 caracteres.")]
    string ImageUrl,
    [param: NotEmptyGuid(ErrorMessage = "Debe enviar un categoryId valido.")]
    Guid CategoryId,
    bool IsAvailable);

