# Deploy Black Coffe en Vercel + Render + Neon

## 1) Requisitos
- Repositorio en GitHub con esta estructura:
  - `backend/BlackCoffe.Api`
  - `storefront-next`
  - `render.yaml` en la raiz
- Base de datos Neon creada.

## 2) Variables sensibles
### Render (`blackcoffe-api`)
- `ConnectionStrings__DefaultConnection`
- `Jwt__SecretKey`
- `Cors__AllowedOrigins__0` (URL publica de tu frontend en Vercel)

### Vercel (`storefront-next`)
- `NEXT_PUBLIC_API_BASE_URL`

Ejemplo de cadena Neon (ya la tienes):
`postgresql://.../neondb?sslmode=require&channel_binding=require`

## 3) Crear backend en Render con Blueprint
1. Sube cambios a GitHub (`main`).
2. En Render: `New` -> `Blueprint`.
3. Selecciona tu repo.
4. Render detecta `render.yaml` y crea:
   - `blackcoffe-api` (Web Service Docker)

## 4) Configurar variables en `blackcoffe-api`
En Render -> servicio `blackcoffe-api` -> `Environment`:
- `ConnectionStrings__DefaultConnection` = tu cadena Neon
- `Jwt__SecretKey` = clave larga/segura (minimo 32+ caracteres)
- `Cors__AllowedOrigins__0` = `https://TU-PROYECTO.vercel.app`

Nota:
- Si luego usas dominio propio, cambia CORS a ese dominio real.

## 5) Verificar backend
- Health: `https://blackcoffe-api.onrender.com/health`
- Swagger: `https://blackcoffe-api.onrender.com/swagger`

Si falla en arranque:
- revisa logs de `blackcoffe-api`
- valida que Neon acepte conexiones y la cadena sea correcta.

## 6) Crear frontend en Vercel
1. En Vercel: `Add New...` -> `Project`.
2. Importa el mismo repo.
3. En `Root Directory`, selecciona `storefront-next`.
4. Framework: `Next.js`.
5. En variables de entorno:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://blackcoffe-api.onrender.com`
6. Deploy.

## 7) Verificar frontend
- URL: `https://TU-PROYECTO.vercel.app`
- Prueba catálogo, login y checkout contra la API de Render.

## 8) Deploy local rapido (opcional antes de subir)
Backend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe"
$env:ConnectionStrings__DefaultConnection="postgresql://...neon..."
dotnet run --project backend/BlackCoffe.Api --urls "http://localhost:5088"
```

Frontend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\storefront-next"
npm install
npm run dev
```

## 9) Comportamiento ya listo en este repo
- API en Docker para Render.
- Migraciones EF Core se aplican al iniciar la API.
- Seed demo/catalogo se asegura al iniciar.
- Storefront Next listo para Vercel.
