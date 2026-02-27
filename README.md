# Black Coffe

Plataforma de cafetería con:
- `backend/` ASP.NET Core Web API (.NET 8 + PostgreSQL/Neon)
- `frontend/` Angular + Tailwind

## Desarrollo local
Backend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe"
$env:ConnectionStrings__DefaultConnection="postgresql://..."
dotnet run --project backend/BlackCoffe.Api --urls "http://localhost:5088"
```

Frontend:
```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\frontend"
npm install
npm start
```

## Deploy Render + Neon
Revisa: [DEPLOY_RENDER_NEON.md](/c:/Users/julio/OneDrive/Desktop/Black%20Coffe/DEPLOY_RENDER_NEON.md)
