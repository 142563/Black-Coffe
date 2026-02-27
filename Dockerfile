FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend ./backend

RUN dotnet restore "backend/BlackCoffe.Api/BlackCoffe.Api.csproj"
RUN dotnet publish "backend/BlackCoffe.Api/BlackCoffe.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet BlackCoffe.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
