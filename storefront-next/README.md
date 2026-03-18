# Black Coffe Storefront Next

Nuevo storefront publico para Black Coffe construido en:

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query
- Zustand

## Objetivo

Este proyecto reemplaza gradualmente el frontend publico en Angular sin tocar:

- backend `.NET`
- contratos HTTP existentes
- storage keys del navegador

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta si hace falta:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5088
```

## Desarrollo local

Backend `.NET` en otra terminal:

```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe"
$env:ConnectionStrings__DefaultConnection="TU_CONNECTION_STRING"
dotnet run --project backend/BlackCoffe.Api --urls "http://localhost:5088"
```

Storefront Next:

```powershell
cd "C:\Users\julio\OneDrive\Desktop\Black Coffe\storefront-next"
npm install
npm run dev
```

El storefront queda en `http://localhost:4200`.

## Produccion

- Frontend: Vercel
- API: Render

## Notas

- `black_coffe_auth` y `black_coffe_cart` se mantienen iguales para una transicion limpia.
- El hero premium actual usa ilustracion + motion, no depende de WebGL ni de un modelo GLB.
- Este proyecto reemplaza gradualmente el storefront Angular, pero el deploy actual en Render sigue usando `frontend/`.
