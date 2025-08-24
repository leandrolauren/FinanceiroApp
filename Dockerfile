FROM node:lts-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-builder
WORKDIR /src

COPY *.csproj .
RUN dotnet restore

COPY . .

RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=backend-builder /src/app/publish .

COPY --from=frontend-builder /app/wwwroot/js/dist ./wwwroot/js/dist

EXPOSE 8080

ENTRYPOINT ["dotnet", "FinanceiroApp.dll"]