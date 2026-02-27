using BlackCoffe.Domain.Entities;
using BlackCoffe.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BlackCoffe.Infrastructure.Persistence;

public class BlackCoffeDbContext : DbContext
{
    public BlackCoffeDbContext(DbContextOptions<BlackCoffeDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<CafeTable> Tables => Set<CafeTable>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(200);
            entity.Property(x => x.FullName).HasMaxLength(200);
            entity.Property(x => x.Phone).HasMaxLength(30);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(x => x.Name).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(x => new { x.UserId, x.RoleId });
            entity.HasOne(x => x.User).WithMany(x => x.Roles).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(x => x.Token).IsUnique();
            entity.Property(x => x.Token).HasMaxLength(200);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(120);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(150);
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.HasOne(x => x.User).WithMany(x => x.Orders).HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.HasOne(x => x.Order).WithMany(x => x.Items).HasForeignKey(x => x.OrderId);
            entity.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasOne(x => x.User).WithMany(x => x.Reservations).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.Table).WithMany(x => x.Reservations).HasForeignKey(x => x.TableId);
        });

        modelBuilder.Entity<CafeTable>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(120);
            entity.Property(x => x.Unit).HasMaxLength(20);
        });

        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasOne(x => x.InventoryItem).WithMany(x => x.Movements).HasForeignKey(x => x.InventoryItemId);
        });

        Seed(modelBuilder);
    }

    private static void Seed(ModelBuilder modelBuilder)
    {
        var seedCreatedAtUtc = new DateTime(2026, 02, 26, 0, 0, 0, DateTimeKind.Utc);
        const string adminPasswordHash = "$2a$11$bzzpUCmyByk3zrJB0cfJnugs.2Zpwcik4x66YBFeF8r2wHKJfl2F6";

        var adminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var staffRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var clientRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var adminId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var categoryCafeId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var categoryPostreId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        var tableOneId = Guid.Parse("66666666-6666-6666-6666-666666666666");

        modelBuilder.Entity<Role>().HasData(
            new Role { Id = adminRoleId, Name = RoleType.Admin.ToString() },
            new Role { Id = staffRoleId, Name = RoleType.Staff.ToString() },
            new Role { Id = clientRoleId, Name = RoleType.Cliente.ToString() }
        );

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = adminId,
            FullName = "Julio Cesar Ticas Palencia",
            Email = "julio.cesar.ticas.demo@blackcoffe.local",
            Phone = "50370001122",
            PasswordHash = adminPasswordHash,
            Status = UserStatus.Activo,
            CreatedAtUtc = seedCreatedAtUtc
        });

        modelBuilder.Entity<UserRole>().HasData(new UserRole
        {
            UserId = adminId,
            RoleId = adminRoleId
        });

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = categoryCafeId, Name = "Cafes", Description = "Bebidas de cafe", IsActive = true },
            new Category { Id = categoryPostreId, Name = "Postres", Description = "Acompanamientos dulces", IsActive = true }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                Name = "Americano",
                Description = "Cafe americano tradicional",
                Price = 2.50m,
                CategoryId = categoryCafeId,
                ImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
                IsAvailable = true
            },
            new Product
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                Name = "Cheesecake",
                Description = "Porcion de cheesecake",
                Price = 4.20m,
                CategoryId = categoryPostreId,
                ImageUrl = "https://images.unsplash.com/photo-1533134242443-d4fd215305ad",
                IsAvailable = true
            }
        );

        modelBuilder.Entity<CafeTable>().HasData(
            new CafeTable { Id = tableOneId, Name = "Mesa 1", Capacity = 4, Status = TableStatus.Libre, IsActive = true },
            new CafeTable { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Name = "Mesa 2", Capacity = 2, Status = TableStatus.Libre, IsActive = true }
        );

        modelBuilder.Entity<InventoryItem>().HasData(
            new InventoryItem
            {
                Id = Guid.Parse("abababab-abab-abab-abab-abababababab"),
                Name = "Grano de cafe",
                Unit = "kg",
                CurrentStock = 12,
                MinimumStock = 5,
                IsActive = true
            }
        );
    }
}
