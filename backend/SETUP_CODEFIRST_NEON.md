# Backend Black Coffe (Database-First)

Este backend ahora trabaja en modo **database-first operativo**:
- No usa `EnsureCreated`.
- No aplica migraciones automaticamente al iniciar.
- Usa la base Neon existente como fuente principal.

## 1) Configurar conexion (PowerShell)

```powershell
$env:ConnectionStrings__DefaultConnection="postgresql://neondb_owner:...@ep-orange-silence-a8fg1glm-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
```

## 2) Levantar backend

Desde la carpeta `backend`:

```powershell
dotnet run --project .\BlackCoffe.Api\BlackCoffe.Api.csproj --urls http://localhost:5088
```

## Usuario demo garantizado al arranque

El backend valida/ajusta este usuario demo al iniciar:
- Nombre: `Julio Cesar Ticas Palencia`
- Email: `julio.cesar.ticas.demo@blackcoffe.local`
- Password: `DemoCafe123*`

## Nota de estructura

Ahora el repositorio esta separado en:
- `backend/` (API .NET)
- `frontend/` (Angular)

La ejecucion recomendada es manual en dos terminales: primero backend y luego frontend.
