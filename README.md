# Black Coffe

Plataforma de cafetería con:
- `backend/` ASP.NET Core Web API (.NET 8 + PostgreSQL/Neon)
- `frontend/` Angular + Tailwind
- `storefront-next/` Next.js + Tailwind para el nuevo storefront en paralelo

## Estado actual
- Producción actual en Render: `frontend/`
- Nuevo storefront en desarrollo: `storefront-next/`
- Backend productivo: `backend/`

## Desarrollo local
Backend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe"
$env:ConnectionStrings__DefaultConnection="postgresql://..."
dotnet run --project backend/BlackCoffe.Api --urls "http://localhost:5088"
```

Frontend actual:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\frontend"
npm install
npm start
```

Nuevo storefront:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\storefront-next"
npm install
npm run dev
```

## Deploy Render + Neon
Revisa: [DEPLOY_RENDER_NEON.md](./DEPLOY_RENDER_NEON.md)
