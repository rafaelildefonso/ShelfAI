# ShelfAI - Backend Documentation

## Visão Geral

O backend da plataforma ShelfAI é uma API RESTful construída com **Node.js** e **Express**, utilizando **Prisma ORM** para interação com banco de dados PostgreSQL (hospedado no Supabase).

## Stack Tecnológico

### Core

- **Node.js**: Runtime Javascript.
- **Express 5**: Framework web rápido e minimalista.
- **TypeScript**: Linguagem base para tipagem estática.

### Banco de Dados & ORM

- **PostgreSQL**: Banco de dados relacional.
- **Prisma**: Moderno ORM para Node.js e TypeScript.
- **Supabase**: Plataforma utilizada para hospedar o banco e storage.

### Segurança & Autenticação

- **JWT (JSON Web Token)**: Para autenticação stateless.
- **Bcrypt**: Hashing de senhas.
- **Helmet**: Headers de segurança HTTP.
- **Rate Limiting**: Proteção contra abuso de requisições.
- **CORS**: Controle de acesso cross-origin.

### Ferramentas Adicionais

- **Zod**: Validação de schemas e dados de entrada.
- **Multer**: Upload de arquivos (imagens/planilhas).
- **Swagger**: Documentação interativa da API (ambiente de desenvolvimento).

## Configuração e Instalação

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Configuração de Ambiente**
   Crie um arquivo `.env` na raiz do diretório `backend` (use `.env.example` como base):

   ```env
   PORT=3000
   DATABASE_URL="postgresql://usuario:senha@host:port/database"
   JWT_SECRET="seu_segredo_jwt"
   JWT_REFRESH_SECRET="seu_segredo_refresh"
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Banco de Dados**
   Rodar migrações do Prisma para criar as tabelas:

   ```bash
   npx prisma migrate dev
   ```

   (Opcional) Popular o banco com dados de teste:

   ```bash
   npm run seed
   ```

4. **Rodar servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   A API estará disponível em `http://localhost:3000`.

## Estrutura de Diretórios

- **`src/config`**: Configurações de ambiente, swagger, banco, etc.
- **`src/controllers`**: Lógica de controle das requisições (handlers).
- **`src/middlewares`**: Middlewares de autenticação, erro, validação.
- **`src/routes`**: Definição das rotas e endpoints.
- **`src/services`**: Lógica de negócio e acesso a dados (Repository pattern implícito ou explícito).
- **`src/utils`**: Classes de erro (AppError), formatadores.
- **`prisma`**: Esquema do banco de dados e arquivos de migração.
