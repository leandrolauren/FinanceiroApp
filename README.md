# 💸 FinanceiroApp

Um sistema de gestão financeira pessoal completo, desenvolvido com **ASP.NET Core MVC**, **React**, **PostgreSQL** e **RabbitMQ**, tudo orquestrado com **Docker**.  
Interface moderna e responsiva com componentes dinâmicos para uma experiência de usuário fluida.

---

## 🚀 Tecnologias

- **Backend**
  - ASP.NET Core MVC (.NET 9)
  - Entity Framework Core
  - PostgreSQL
  - RabbitMQ (mensageria)
  - Redis (cache)
  - Autenticação Google (Google Client ID)
  - Gemini API (categorização de transações e assistente de IA)
- **Frontend**
  - React (componentes integrados nas views Razor)
  - Material UI (MUI)
  - Notistack (notificações)
- **DevOps**
  - Docker & Docker Compose

---

## ⚙️ Pré-requisitos

Para executar este projeto, você precisará apenas de:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente incluído no Docker Desktop)

---

## 🛠️ Executando Localmente com Docker

Siga estes passos para ter o ambiente completo rodando na sua máquina.

### 1. Clone o repositório

```sh
git clone https://github.com/leandrolauren/FinanceiroApp.git
cd FinanceiroApp
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASSWORD=sua-senha
```

Configure também o `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=financeiro_db;Username=usuario;Password=senha"
}
```

### 3. Instale as dependências Node.js

```sh
npm install
```

### 4. Compile os bundles React

```sh
npx webpack --mode production
```

Ou para desenvolvimento:

```sh
npx webpack --mode development --watch
```

### 5. Aplique as migrações do banco

```sh
dotnet ef database update
```

### 6. Inicie o RabbitMQ

- Certifique-se que o serviço RabbitMQ está rodando localmente ou em seu servidor.

### 7. Execute o projeto

```sh
dotnet run
```

Acesse: [http://localhost:5084](http://localhost:5084)

---

## 🧩 Funcionalidades

- Cadastro e edição de pessoas físicas/jurídicas
- Plano de contas hierárquico (receitas e despesas)
- Lançamentos financeiros com controle de datas, valores e status
- Controle de contas bancárias
- Dashboard com gráficos dinâmicos (React + MUI)
- Notificações visuais (Notistack)
- Autenticação via Google
- Confirmação de e-mail via RabbitMQ + SMTP
- Busca dinâmica de CEP/CNPJ
- Responsividade e usabilidade aprimorada

---

## 📦 Estrutura do Projeto

```
├── Controllers/
├── Models/
├── Views/
│   ├── Shared/
│   └── ...
├── wwwroot/
│   ├── css/
│   ├── js/
│   │   └── components/
│   └── img/
├── Data/
├── Program.cs
├── appsettings.json
├── .env
```

---

## 
---

## 📝 Observações

-- O projeto utiliza uma arquitetura híbrida: Razor tradicional + componentes React para interatividade avançada.
-- Mensageria com RabbitMQ garante escalabilidade e desacoplamento para envio de e-mails e outras tarefas assíncronas.
+- O ambiente de desenvolvimento é **totalmente containerizado**, simplificando o setup e garantindo consistência entre diferentes máquinas.
+- A arquitetura combina o melhor do **ASP.NET Core MVC** para a estrutura e o **React** para componentes ricos e interativos no frontend.
+- O uso de **RabbitMQ** para mensageria desacopla tarefas demoradas, como o envio de e-mails, melhorando a performance e a resiliência da aplicação.

---

## 🤝 Contribua

Pull requests, sugestões e melhorias são bem-vindas!  
+Abra uma issue ou envie seu PR.

---

## 👨‍💻 Autor

Desenvolvido por **Leandro Laurenzette**  
-LinkedIn
+[!LinkedIn](https://www.linkedin.com/in/leandro-laurenzette-3b03a2167)

## 📄 Licença

MIT. Veja o arquivo [LICENSE](LICENSE)
