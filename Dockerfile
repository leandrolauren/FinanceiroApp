# Etapa 1: Build do backend .NET
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia csproj e restaura
COPY *.csproj ./
RUN dotnet restore

# Copia o restante do código
COPY . .

# Publica a aplicação
RUN dotnet publish -c Release -o /app/publish


# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copia aplicação publicada
COPY --from=build /app/publish .

# Copia os bundles já prontos do front
COPY ./wwwroot/js/dist ./wwwroot/js/dist

# Expõe porta do Kestrel
EXPOSE 8080

ENTRYPOINT ["dotnet", "FinanceiroApp.dll"]
