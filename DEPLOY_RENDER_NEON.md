# Deploy Black Coffe en Render + Neon

## 1) Requisitos
- Repositorio en GitHub con esta estructura:
  - `backend/BlackCoffe.Api`
  - `frontend`
  - `render.yaml` en la raiz
- Base de datos Neon creada.

## 2) Variables sensibles que vas a cargar en Render
- `ConnectionStrings__DefaultConnection`
- `Jwt__SecretKey`
- `Cors__AllowedOrigins__0` (URL publica de tu frontend en Render)

Ejemplo de cadena Neon (ya la tienes):
`postgresql://.../neondb?sslmode=require&channel_binding=require`

## 3) Crear servicios con Blueprint (recomendado)
1. Sube cambios a GitHub (`main`).
2. En Render: `New` -> `Blueprint`.
3. Selecciona tu repo.
4. Render detecta `render.yaml` y crea:
   - `blackcoffe-api` (Web Service Docker)
   - `blackcoffe-frontend` (Static Site)

## 4) Configurar variables en `blackcoffe-api`
En Render -> servicio `blackcoffe-api` -> `Environment`:
- `ConnectionStrings__DefaultConnection` = tu cadena Neon
- `Jwt__SecretKey` = clave larga/segura (minimo 32+ caracteres)
- `Cors__AllowedOrigins__0` = `https://blackcoffe-frontend.onrender.com`

Nota:
- Si cambias el nombre del frontend, usa ese dominio real.

## 5) Verificar backend
- Health: `https://blackcoffe-api.onrender.com/health`
- Swagger: `https://blackcoffe-api.onrender.com/swagger`

Si falla en arranque:
- revisa logs de `blackcoffe-api`
- valida que Neon acepte conexiones y la cadena sea correcta.

## 6) Verificar frontend
- URL: `https://blackcoffe-frontend.onrender.com`
- El `render.yaml` ya enruta `/api/*` del frontend hacia `blackcoffe-api`.

## 7) Deploy local rapido (opcional antes de subir)
Backend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe"
$env:ConnectionStrings__DefaultConnection="postgresql://...neon..."
dotnet run --project backend/BlackCoffe.Api --urls "http://localhost:5088"
```

Frontend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\frontend"
npm install
npm start
```

## 8) Comportamiento ya listo en este repo
- API en Docker para Render.
- Migraciones EF Core se aplican al iniciar la API.
- Seed demo/catalogo se asegura al iniciar.
- Frontend Angular compilable para static hosting.
