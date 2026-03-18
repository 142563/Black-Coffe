# Black Coffe

Plataforma de cafetería con:
- `backend/` ASP.NET Core Web API (.NET 8 + PostgreSQL/Neon)
- `storefront-next/` Next.js + Tailwind como storefront público oficial

## Estado actual
- Frontend público objetivo: `storefront-next/` en Vercel
- Backend productivo: `backend/` en Render
- Base de datos: Neon

## Desarrollo local
Backend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe"
$env:ConnectionStrings__DefaultConnection="postgresql://..."
dotnet run --project backend/BlackCoffe.Api --urls "http://localhost:5088"
```

Storefront público:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\storefront-next"
npm install
npm run dev
```

## Deploy Render + Neon
Revisa: [DEPLOY_RENDER_NEON.md](./DEPLOY_RENDER_NEON.md)
