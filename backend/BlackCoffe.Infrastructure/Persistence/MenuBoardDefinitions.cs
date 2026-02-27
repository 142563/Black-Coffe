using System.Security.Cryptography;
using System.Text;

namespace BlackCoffe.Infrastructure.Persistence;

public static class MenuBoardDefinitions
{
    public const string Currency = "Q";

    public static readonly SeedCategory HotDrinksCategory = Category("hot-drinks", "Hot Drinks", "Bebidas calientes");
    public static readonly SeedCategory ColdDrinksCategory = Category("cold-drinks", "Cold Drinks", "Bebidas frias");
    public static readonly SeedCategory FoodSavoryCategory = Category("food-savory", "Food Savory", "Comida salada");
    public static readonly SeedCategory FoodSweetCategory = Category("food-sweet", "Food Sweet", "Comida dulce");

    public static readonly IReadOnlyCollection<SeedCategory> Categories =
    [
        HotDrinksCategory,
        ColdDrinksCategory,
        FoodSavoryCategory,
        FoodSweetCategory
    ];

    public static readonly IReadOnlyCollection<SeedProduct> Products =
    [
        // Hot drinks
        Product("hot-espresso-short", HotDrinksCategory.Id, "Espresso Short", "Espresso", 15m, ImageHot),
        Product("hot-doppio-short", HotDrinksCategory.Id, "Doppio Short", "Doppio", 18m, ImageHot),
        Product("hot-macchiato-short", HotDrinksCategory.Id, "Macchiato Short", "*Macchiato", 25m, ImageHot),
        Product("hot-cortado-short", HotDrinksCategory.Id, "Cortado Short", "*Cortado", 25m, ImageHot),
        Product("hot-brown-sugar-cortado-short", HotDrinksCategory.Id, "Brown Sugar Cortado Short", "*Brown Sugar Cortado", 35m, ImageHot),
        Product("hot-americano-short", HotDrinksCategory.Id, "Americano Short", "Americano", 15m, ImageHot),
        Product("hot-americano-tall", HotDrinksCategory.Id, "Americano Tall", "Americano", 17m, ImageHot),
        Product("hot-americano-grande", HotDrinksCategory.Id, "Americano Grande", "Americano", 21m, ImageHot),
        Product("hot-americano-venti", HotDrinksCategory.Id, "Americano Venti", "Americano", 25m, ImageHot),
        Product("hot-cappuccino-short", HotDrinksCategory.Id, "Cappuccino Short", "Cappuccino", 24m, ImageHot),
        Product("hot-cappuccino-tall", HotDrinksCategory.Id, "Cappuccino Tall", "Cappuccino", 26m, ImageHot),
        Product("hot-cappuccino-grande", HotDrinksCategory.Id, "Cappuccino Grande", "Cappuccino", 28m, ImageHot),
        Product("hot-cappuccino-venti", HotDrinksCategory.Id, "Cappuccino Venti", "Cappuccino", 30m, ImageHot),
        Product("hot-flat-white-short", HotDrinksCategory.Id, "Flat White Short", "*Flat White", 30m, ImageHot),
        Product("hot-latte-short", HotDrinksCategory.Id, "Latte Short", "Latte", 23m, ImageHot),
        Product("hot-latte-tall", HotDrinksCategory.Id, "Latte Tall", "Latte", 25m, ImageHot),
        Product("hot-latte-grande", HotDrinksCategory.Id, "Latte Grande", "Latte", 27m, ImageHot),
        Product("hot-latte-venti", HotDrinksCategory.Id, "Latte Venti", "Latte", 29m, ImageHot),
        Product("hot-vanella-latte-short", HotDrinksCategory.Id, "Vanella Latte Short", "Vanella Latte", 25m, ImageHot),
        Product("hot-vanella-latte-tall", HotDrinksCategory.Id, "Vanella Latte Tall", "Vanella Latte", 28m, ImageHot),
        Product("hot-vanella-latte-grande", HotDrinksCategory.Id, "Vanella Latte Grande", "Vanella Latte", 30m, ImageHot),
        Product("hot-vanella-latte-venti", HotDrinksCategory.Id, "Vanella Latte Venti", "Vanella Latte", 32m, ImageHot),
        Product("hot-cinnamon-latte-short", HotDrinksCategory.Id, "Cinnamon Latte Short", "Cinnamon Latte", 29m, ImageHot),
        Product("hot-cinnamon-latte-tall", HotDrinksCategory.Id, "Cinnamon Latte Tall", "Cinnamon Latte", 32m, ImageHot),
        Product("hot-cinnamon-latte-grande", HotDrinksCategory.Id, "Cinnamon Latte Grande", "Cinnamon Latte", 35m, ImageHot),
        Product("hot-cinnamon-latte-venti", HotDrinksCategory.Id, "Cinnamon Latte Venti", "Cinnamon Latte", 38m, ImageHot),
        Product("hot-pistacho-latte-short", HotDrinksCategory.Id, "Pistacho Latte Short", "Pistacho Latte", 30m, ImageHot),
        Product("hot-pistacho-latte-tall", HotDrinksCategory.Id, "Pistacho Latte Tall", "Pistacho Latte", 33m, ImageHot),
        Product("hot-pistacho-latte-grande", HotDrinksCategory.Id, "Pistacho Latte Grande", "Pistacho Latte", 36m, ImageHot),
        Product("hot-pistacho-latte-venti", HotDrinksCategory.Id, "Pistacho Latte Venti", "Pistacho Latte", 39m, ImageHot),
        Product("hot-matcha-latte-short", HotDrinksCategory.Id, "Matcha Latte Short", "Matcha Latte", 30m, ImageHot),
        Product("hot-matcha-latte-tall", HotDrinksCategory.Id, "Matcha Latte Tall", "Matcha Latte", 33m, ImageHot),
        Product("hot-matcha-latte-grande", HotDrinksCategory.Id, "Matcha Latte Grande", "Matcha Latte", 36m, ImageHot),
        Product("hot-matcha-latte-venti", HotDrinksCategory.Id, "Matcha Latte Venti", "Matcha Latte", 39m, ImageHot),
        Product("hot-caramel-macchiato-short", HotDrinksCategory.Id, "Caramel Macchiato Short", "Caramel Macchiato", 30m, ImageHot),
        Product("hot-caramel-macchiato-tall", HotDrinksCategory.Id, "Caramel Macchiato Tall", "Caramel Macchiato", 33m, ImageHot),
        Product("hot-caramel-macchiato-grande", HotDrinksCategory.Id, "Caramel Macchiato Grande", "Caramel Macchiato", 36m, ImageHot),
        Product("hot-caramel-macchiato-venti", HotDrinksCategory.Id, "Caramel Macchiato Venti", "Caramel Macchiato", 39m, ImageHot),
        Product("hot-caffe-mocha-short", HotDrinksCategory.Id, "Caffe Mocha Short", "Caffe Mocha", 30m, ImageHot),
        Product("hot-caffe-mocha-tall", HotDrinksCategory.Id, "Caffe Mocha Tall", "Caffe Mocha", 33m, ImageHot),
        Product("hot-caffe-mocha-grande", HotDrinksCategory.Id, "Caffe Mocha Grande", "Caffe Mocha", 36m, ImageHot),
        Product("hot-caffe-mocha-venti", HotDrinksCategory.Id, "Caffe Mocha Venti", "Caffe Mocha", 39m, ImageHot),
        Product("hot-white-chocolate-mocha-short", HotDrinksCategory.Id, "White Chocolate Mocha Short", "White Chocolate Mocha", 30m, ImageHot),
        Product("hot-white-chocolate-mocha-tall", HotDrinksCategory.Id, "White Chocolate Mocha Tall", "White Chocolate Mocha", 33m, ImageHot),
        Product("hot-white-chocolate-mocha-grande", HotDrinksCategory.Id, "White Chocolate Mocha Grande", "White Chocolate Mocha", 36m, ImageHot),
        Product("hot-white-chocolate-mocha-venti", HotDrinksCategory.Id, "White Chocolate Mocha Venti", "White Chocolate Mocha", 39m, ImageHot),
        Product("hot-cinnamon-apple-spice-short", HotDrinksCategory.Id, "Cinnamon Apple Spice Short", "*Cinnamon Apple Spice (No coffee)", 29m, ImageHot),
        Product("hot-cinnamon-apple-spice-tall", HotDrinksCategory.Id, "Cinnamon Apple Spice Tall", "*Cinnamon Apple Spice (No coffee)", 33m, ImageHot),
        Product("hot-cinnamon-apple-spice-grande", HotDrinksCategory.Id, "Cinnamon Apple Spice Grande", "*Cinnamon Apple Spice (No coffee)", 37m, ImageHot),
        Product("hot-chocolate-short", HotDrinksCategory.Id, "Hot Chocolate Short", "Hot Chocolate (No coffee)", 25m, ImageHot),
        Product("hot-chocolate-tall", HotDrinksCategory.Id, "Hot Chocolate Tall", "Hot Chocolate (No coffee)", 29m, ImageHot),
        Product("hot-chocolate-grande", HotDrinksCategory.Id, "Hot Chocolate Grande", "Hot Chocolate (No coffee)", 33m, ImageHot),
        Product("hot-chocolate-venti", HotDrinksCategory.Id, "Hot Chocolate Venti", "Hot Chocolate (No coffee)", 37m, ImageHot),

        // Cold drinks
        Product("cold-cranberry-refresher-tall", ColdDrinksCategory.Id, "Cranberry Refresher Tall", "Cranberry Refresher", 20m, ImageCold),
        Product("cold-cranberry-refresher-grande", ColdDrinksCategory.Id, "Cranberry Refresher Grande", "Cranberry Refresher", 23m, ImageCold),
        Product("cold-cranberry-refresher-venti", ColdDrinksCategory.Id, "Cranberry Refresher Venti", "Cranberry Refresher", 25m, ImageCold),
        Product("cold-pink-drink-tall", ColdDrinksCategory.Id, "Pink Drink Tall", "Pink Drink", 24m, ImageCold),
        Product("cold-pink-drink-grande", ColdDrinksCategory.Id, "Pink Drink Grande", "Pink Drink", 26m, ImageCold),
        Product("cold-pink-drink-venti", ColdDrinksCategory.Id, "Pink Drink Venti", "Pink Drink", 28m, ImageCold),
        Product("cold-bloody-drink-tall", ColdDrinksCategory.Id, "Bloody Drink Tall", "Bloody Drink", 20m, ImageCold),
        Product("cold-bloody-drink-grande", ColdDrinksCategory.Id, "Bloody Drink Grande", "Bloody Drink", 23m, ImageCold),
        Product("cold-bloody-drink-venti", ColdDrinksCategory.Id, "Bloody Drink Venti", "Bloody Drink", 25m, ImageCold),
        Product("cold-shaken-espresso-tall", ColdDrinksCategory.Id, "Shaken Espresso Tall", "Shaken Espresso", 32m, ImageCold),
        Product("cold-shaken-espresso-grande", ColdDrinksCategory.Id, "Shaken Espresso Grande", "Shaken Espresso", 36m, ImageCold),
        Product("cold-shaken-espresso-venti", ColdDrinksCategory.Id, "Shaken Espresso Venti", "Shaken Espresso", 40m, ImageCold),

        // Savory food
        Product("savory-sausage-egg-muffin", FoodSavoryCategory.Id, "Sausage & Egg Muffin", "Sausage & Egg Muffin", 30m, ImageSavory, "food"),
        Product("savory-ham-egg-muffin", FoodSavoryCategory.Id, "Ham & Egg Muffin", "Ham & Egg Muffin", 30m, ImageSavory, "food"),
        Product("savory-egg-bites", FoodSavoryCategory.Id, "Egg Bites", "Egg Bites", 39m, ImageSavory, "food"),
        Product("savory-plane-bagel", FoodSavoryCategory.Id, "Plane Bagel", "Plane Bagel", 20m, ImageSavory, "food"),
        Product("savory-everything-bagel", FoodSavoryCategory.Id, "Everything Bagel", "Everything Bagel", 22m, ImageSavory, "food"),
        Product("savory-dry-fruit-small", FoodSavoryCategory.Id, "Dry Fruit S", "Dry Fruit", 23m, ImageSavory, "food"),
        Product("savory-dry-fruit-large", FoodSavoryCategory.Id, "Dry Fruit L", "Dry Fruit", 25m, ImageSavory, "food"),
        Product("savory-pop-corn-small", FoodSavoryCategory.Id, "Pop Corn S", "Pop Corn", 10m, ImageSavory, "food"),
        Product("savory-pop-corn-large", FoodSavoryCategory.Id, "Pop Corn L", "Pop Corn", 30m, ImageSavory, "food"),

        // Sweet food
        Product("sweet-brownie", FoodSweetCategory.Id, "Brownie", "Brownie", 20m, ImageSweet, "food"),
        Product("sweet-brownie-bite", FoodSweetCategory.Id, "Brownie Bite", "Brownie Bite", 8m, ImageSweet, "food"),
        Product("sweet-pie-dulde-de-leche", FoodSweetCategory.Id, "Pie Dulde de Leche", "Pie Dulde de Leche", 20m, ImageSweet, "food"),
        Product("sweet-pie-de-mora", FoodSweetCategory.Id, "Pie de Mora", "Pie de Mora", 20m, ImageSweet, "food"),
        Product("sweet-red-velvet", FoodSweetCategory.Id, "Red Velvet", "Red Velvet", 20m, ImageSweet, "food"),
        Product("sweet-creame-cheese-croissant", FoodSweetCategory.Id, "Creame Cheese Croissant", "Creame Cheese Croissant", 25m, ImageSweet, "food"),
        Product("sweet-banana-loaf", FoodSweetCategory.Id, "Banana Loaf", "Banana Loaf", 5m, ImageSweet, "food"),
        Product("sweet-trail-mix-bar", FoodSweetCategory.Id, "Trail Mix Bar", "Trail Mix Bar", 10m, ImageSweet, "food"),
        Product("sweet-chocolate-chip-bar", FoodSweetCategory.Id, "Chocolate Chip Bar", "Chocolate Chip Bar", 8m, ImageSweet, "food"),
        Product("sweet-chocolate-chip-cookie", FoodSweetCategory.Id, "Chocolate Chip Cookie", "Chocolate Chip Cookie", 8m, ImageSweet, "food"),
        Product("sweet-blueberry-muffins", FoodSweetCategory.Id, "Blueberry Muffins", "Blueberry Muffins", 10m, ImageSweet, "food")
    ];

    public static readonly IReadOnlyDictionary<string, SeedProduct> ProductsByCode =
        Products.ToDictionary(x => x.Code, StringComparer.OrdinalIgnoreCase);

    public static readonly IReadOnlyCollection<Guid> ProductIds = Products.Select(x => x.Id).ToArray();
    public static readonly IReadOnlyCollection<Guid> CategoryIds = Categories.Select(x => x.Id).ToArray();

    public static readonly IReadOnlyCollection<MenuBoardSectionDefinition> Sections =
    [
        new MenuBoardSectionDefinition(
            "hot-drinks",
            "Hot Drinks",
            "drink",
            [
                DrinkRow("Espresso", Option("hot-espresso-short", "Short", "short")),
                DrinkRow("Doppio", Option("hot-doppio-short", "Short", "short")),
                DrinkRow("*Macchiato", Option("hot-macchiato-short", "Short", "short")),
                DrinkRow("*Cortado", Option("hot-cortado-short", "Short", "short")),
                DrinkRow("*Brown Sugar Cortado", Option("hot-brown-sugar-cortado-short", "Short", "short")),
                DrinkRow("Americano",
                    Option("hot-americano-short", "Short", "short"),
                    Option("hot-americano-tall", "Tall", "tall"),
                    Option("hot-americano-grande", "Grande", "grande"),
                    Option("hot-americano-venti", "Venti", "venti")),
                DrinkRow("Cappuccino",
                    Option("hot-cappuccino-short", "Short", "short"),
                    Option("hot-cappuccino-tall", "Tall", "tall"),
                    Option("hot-cappuccino-grande", "Grande", "grande"),
                    Option("hot-cappuccino-venti", "Venti", "venti")),
                DrinkRow("*Flat White", Option("hot-flat-white-short", "Short", "short")),
                DrinkRow("Latte",
                    Option("hot-latte-short", "Short", "short"),
                    Option("hot-latte-tall", "Tall", "tall"),
                    Option("hot-latte-grande", "Grande", "grande"),
                    Option("hot-latte-venti", "Venti", "venti")),
                DrinkRow("Vanella Latte",
                    Option("hot-vanella-latte-short", "Short", "short"),
                    Option("hot-vanella-latte-tall", "Tall", "tall"),
                    Option("hot-vanella-latte-grande", "Grande", "grande"),
                    Option("hot-vanella-latte-venti", "Venti", "venti")),
                DrinkRow("Cinnamon Latte",
                    Option("hot-cinnamon-latte-short", "Short", "short"),
                    Option("hot-cinnamon-latte-tall", "Tall", "tall"),
                    Option("hot-cinnamon-latte-grande", "Grande", "grande"),
                    Option("hot-cinnamon-latte-venti", "Venti", "venti")),
                DrinkRow("Pistacho Latte",
                    Option("hot-pistacho-latte-short", "Short", "short"),
                    Option("hot-pistacho-latte-tall", "Tall", "tall"),
                    Option("hot-pistacho-latte-grande", "Grande", "grande"),
                    Option("hot-pistacho-latte-venti", "Venti", "venti")),
                DrinkRow("Matcha Latte",
                    Option("hot-matcha-latte-short", "Short", "short"),
                    Option("hot-matcha-latte-tall", "Tall", "tall"),
                    Option("hot-matcha-latte-grande", "Grande", "grande"),
                    Option("hot-matcha-latte-venti", "Venti", "venti")),
                DrinkRow("Caramel Macchiato",
                    Option("hot-caramel-macchiato-short", "Short", "short"),
                    Option("hot-caramel-macchiato-tall", "Tall", "tall"),
                    Option("hot-caramel-macchiato-grande", "Grande", "grande"),
                    Option("hot-caramel-macchiato-venti", "Venti", "venti")),
                DrinkRow("Caffe Mocha",
                    Option("hot-caffe-mocha-short", "Short", "short"),
                    Option("hot-caffe-mocha-tall", "Tall", "tall"),
                    Option("hot-caffe-mocha-grande", "Grande", "grande"),
                    Option("hot-caffe-mocha-venti", "Venti", "venti")),
                DrinkRow("White Chocolate Mocha",
                    Option("hot-white-chocolate-mocha-short", "Short", "short"),
                    Option("hot-white-chocolate-mocha-tall", "Tall", "tall"),
                    Option("hot-white-chocolate-mocha-grande", "Grande", "grande"),
                    Option("hot-white-chocolate-mocha-venti", "Venti", "venti")),
                DrinkRow("*Cinnamon Apple Spice (No coffee)",
                    Option("hot-cinnamon-apple-spice-short", "Short", "short"),
                    Option("hot-cinnamon-apple-spice-tall", "Tall", "tall"),
                    Option("hot-cinnamon-apple-spice-grande", "Grande", "grande")),
                DrinkRow("Hot Chocolate (No coffee)",
                    Option("hot-chocolate-short", "Short", "short"),
                    Option("hot-chocolate-tall", "Tall", "tall"),
                    Option("hot-chocolate-grande", "Grande", "grande"),
                    Option("hot-chocolate-venti", "Venti", "venti"))
            ],
            "* Presentacion en caliente unicamente."
        ),
        new MenuBoardSectionDefinition(
            "cold-drinks",
            "Cold Drinks",
            "drink",
            [
                DrinkRow("Cranberry Refresher",
                    Option("cold-cranberry-refresher-tall", "Tall", "tall"),
                    Option("cold-cranberry-refresher-grande", "Grande", "grande"),
                    Option("cold-cranberry-refresher-venti", "Venti", "venti")),
                DrinkRow("Pink Drink",
                    Option("cold-pink-drink-tall", "Tall", "tall"),
                    Option("cold-pink-drink-grande", "Grande", "grande"),
                    Option("cold-pink-drink-venti", "Venti", "venti")),
                DrinkRow("Bloody Drink",
                    Option("cold-bloody-drink-tall", "Tall", "tall"),
                    Option("cold-bloody-drink-grande", "Grande", "grande"),
                    Option("cold-bloody-drink-venti", "Venti", "venti")),
                DrinkRow("Shaken Espresso",
                    Option("cold-shaken-espresso-tall", "Tall", "tall"),
                    Option("cold-shaken-espresso-grande", "Grande", "grande"),
                    Option("cold-shaken-espresso-venti", "Venti", "venti"))
            ],
            null
        ),
        new MenuBoardSectionDefinition(
            "food-savory",
            "Food - Savory",
            "food",
            [
                FoodRow("Sausage & Egg Muffin", Option("savory-sausage-egg-muffin", "Unidad", "unit", "food")),
                FoodRow("Ham & Egg Muffin", Option("savory-ham-egg-muffin", "Unidad", "unit", "food")),
                FoodRow("Egg Bites", Option("savory-egg-bites", "Unidad", "unit", "food")),
                FoodRow("Plane Bagel", Option("savory-plane-bagel", "Unidad", "unit", "food")),
                FoodRow("Everything Bagel", Option("savory-everything-bagel", "Unidad", "unit", "food")),
                FoodRow("Dry Fruit",
                    Option("savory-dry-fruit-small", "S", "small", "food"),
                    Option("savory-dry-fruit-large", "L", "large", "food")),
                FoodRow("Pop Corn",
                    Option("savory-pop-corn-small", "S", "small", "food"),
                    Option("savory-pop-corn-large", "L", "large", "food"))
            ],
            null
        ),
        new MenuBoardSectionDefinition(
            "food-sweet",
            "Food - Sweet",
            "food",
            [
                FoodRow("Brownie", Option("sweet-brownie", "Unidad", "unit", "food")),
                FoodRow("Brownie Bite", Option("sweet-brownie-bite", "Unidad", "unit", "food")),
                FoodRow("Pie Dulde de Leche", Option("sweet-pie-dulde-de-leche", "Unidad", "unit", "food")),
                FoodRow("Pie de Mora", Option("sweet-pie-de-mora", "Unidad", "unit", "food")),
                FoodRow("Red Velvet", Option("sweet-red-velvet", "Unidad", "unit", "food")),
                FoodRow("Creame Cheese Croissant", Option("sweet-creame-cheese-croissant", "Unidad", "unit", "food")),
                FoodRow("Banana Loaf", Option("sweet-banana-loaf", "Unidad", "unit", "food")),
                FoodRow("Trail Mix Bar", Option("sweet-trail-mix-bar", "Unidad", "unit", "food")),
                FoodRow("Chocolate Chip Bar", Option("sweet-chocolate-chip-bar", "Unidad", "unit", "food")),
                FoodRow("Chocolate Chip Cookie", Option("sweet-chocolate-chip-cookie", "Unidad", "unit", "food")),
                FoodRow("Blueberry Muffins", Option("sweet-blueberry-muffins", "Unidad", "unit", "food"))
            ],
            null
        )
    ];

    private const string ImageHot = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80";
    private const string ImageCold = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80";
    private const string ImageSavory = "https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=900&q=80";
    private const string ImageSweet = "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80";

    static MenuBoardDefinitions()
    {
        var missingCodes = Sections
            .SelectMany(x => x.Rows)
            .SelectMany(x => x.Options)
            .Select(x => x.ProductCode)
            .Where(code => !ProductsByCode.ContainsKey(code))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (missingCodes.Length > 0)
        {
            throw new InvalidOperationException($"MenuBoardDefinitions contiene codigos sin producto: {string.Join(", ", missingCodes)}");
        }
    }

    private static SeedCategory Category(string code, string name, string description)
        => new(DeterministicGuid($"category:{code}"), name, description, true);

    private static SeedProduct Product(
        string code,
        Guid categoryId,
        string name,
        string description,
        decimal price,
        string imageUrl,
        string group = "drink")
        => new(code, DeterministicGuid($"product:{code}"), categoryId, name, description, price, imageUrl, true, group);

    private static MenuBoardRowDefinition DrinkRow(string label, params MenuBoardOptionDefinition[] options)
        => new(label, null, options);

    private static MenuBoardRowDefinition FoodRow(string label, params MenuBoardOptionDefinition[] options)
        => new(label, null, options);

    private static MenuBoardOptionDefinition Option(string productCode, string label, string sizeLabel, string group = "drink")
        => new(productCode, label, sizeLabel, group);

    private static Guid DeterministicGuid(string value)
    {
        var bytes = MD5.HashData(Encoding.UTF8.GetBytes($"black-coffe::{value}"));
        return new Guid(bytes);
    }
}

public sealed record SeedCategory(Guid Id, string Name, string Description, bool IsActive);

public sealed record SeedProduct(
    string Code,
    Guid Id,
    Guid CategoryId,
    string Name,
    string Description,
    decimal Price,
    string ImageUrl,
    bool IsAvailable,
    string Group);

public sealed record MenuBoardSectionDefinition(
    string Key,
    string Title,
    string Kind,
    IReadOnlyCollection<MenuBoardRowDefinition> Rows,
    string? Note);

public sealed record MenuBoardRowDefinition(
    string Label,
    string? Note,
    IReadOnlyCollection<MenuBoardOptionDefinition> Options);

public sealed record MenuBoardOptionDefinition(
    string ProductCode,
    string Label,
    string SizeLabel,
    string Group);
