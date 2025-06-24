# 💰 Financeiro Pessoal - ASP.NET Core + PostgreSQL

Este é um sistema de controle financeiro pessoal desenvolvido com **ASP.NET Core MVC**, utilizando **Entity Framework Core** para persistência de dados com banco **PostgreSQL**. O objetivo do projeto é permitir o gerenciamento simples e eficiente de **despesas, receitas, contas, categorias e lançamentos financeiros**.

---

## 🚀 Funcionalidades

- ✅ Cadastro de Pessoas
- ✅ Plano de Contas (hierarquia de categorias: receitas e despesas)
- ✅ Lançamentos financeiros com controle de datas
- ✅ Controle de Contas Bancárias
- ✅ Interface moderna e responsiva
- ✅ Notificações visuais com `notistack` (React)
- ✅ Integração de componentes JavaScript nas views Razor

---

## 🧰 Tecnologias Utilizadas

- **Backend:**
  - ASP.NET Core MVC (.NET 6+)
  - Entity Framework Core
  - PostgreSQL
  - FluentMapping
  
- **Frontend:**
  - HTML + Razor
  - JavaScript (com DataTables, Select2, etc.)
  - React 

- **Outros:**
  - Notistack (sistema de notificações)
  - TimeZoneConverter (para manipulação de datas em fuso horário do Brasil)
  - Validação com Data Annotations

---

## ⚙️ Requisitos

- [.NET SDK 6.0+](https://dotnet.microsoft.com/en-us/download)
- [Node.js (opcional para build do React)](https://nodejs.org/)
- PostgreSQL instalado e configurado

---

## 📦 Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Configure a string de conexão

No arquivo `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=financeiro_db;Username=seu_usuario;Password=sua_senha"
}
```

### 3. Aplique as migrações e crie o banco

```bash
dotnet ef database update
```

### 4. Rode o projeto

```bash
dotnet run
```

Acesse em: [http://localhost:5000](http://localhost:5000)

---

## 💡 Estrutura do Projeto

```
├── Controllers/
├── Models/
├── Views/
│   ├── Shared/
│   └── ...
├── wwwroot/
│   ├── css/
│   ├── js/
│   └── icons/
├── Data/                # DbContext e migrações
├── Components/React     # Componentes integrados com React
├── Program.cs
├── appsettings.json
```

---

## 🌎 Observações

- Todas as datas são armazenadas em **UTC no banco** e convertidas para **fuso horário brasileiro (America/Sao_Paulo)** no back-end e front-end.
- O projeto utiliza uma abordagem híbrida: **Razor tradicional com componentes React em pontos específicos** para maior interatividade.
- O layout base é baseado no **SB Admin 2 (Bootstrap)**.

---

## 🤝 Contribuição

Sinta-se à vontade para contribuir! Sugestões de melhoria, refatoração ou novas funcionalidades são bem-vindas.

---

## 🧑‍💻 Autor

Desenvolvido por **Leandro Laurenzette**  
💼 Desenvolvedor Full Stack  
📍 Hortolândia/SP  
📧 [www.linkedin.com/in/leandro-laurenzette-3b03a2167](https://linkedin.com/in/leandrolaurenzette)  

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.  
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
