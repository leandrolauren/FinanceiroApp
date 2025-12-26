# Estágio 1: Construir o Front-end
FROM node:lts-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY webpack.config.js postcss.config.js tailwind.config.js .babelrc ./
COPY wwwroot/css ./wwwroot/css
COPY wwwroot/js ./wwwroot/js
RUN npm run build

# Estágio 2: Construir o Back-end
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-builder
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY Program.cs ./
COPY Controllers ./Controllers
COPY Data ./Data
COPY Dtos ./Dtos
COPY Hubs ./Hubs
COPY Migrations ./Migrations
COPY Models ./Models
COPY Services ./Services
COPY Views ./Views
COPY Properties ./Properties
RUN dotnet publish -c Release -o /app/publish

# Estágio 3: Imagem Final de Execução
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=backend-builder /app/publish .
COPY wwwroot/favicon.ico ./wwwroot/
COPY wwwroot/img ./wwwroot/img

COPY --from=frontend-builder /app/wwwroot/js/dist ./wwwroot/js/dist

EXPOSE 8080
ENTRYPOINT ["dotnet", "FinanceiroApp.dll"]