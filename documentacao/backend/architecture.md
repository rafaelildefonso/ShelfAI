# Arquitetura do Backend

## Padrão de Projeto

O backend segue uma arquitetura em camadas inspirada no padrão MVC (Model-View-Controller), adaptada para API REST:

1.  **Routes**: Definem os endpoints e aplicam middlewares (auth, upload, validation).
2.  **Controllers**: Recebem a requisição, validam dados (com Zod) e chamam os serviços.
3.  **Services**: Contêm a regra de negócios. Interagem com o banco via Prisma Client.
4.  **Database (Prisma)**: Camada de acesso aos dados.

## Autenticação e Segurança

### Fluxo JWT

A autenticação utiliza o padrão Bearer Token com JWT.

- **Middlewares (`src/middlewares/authMiddleware.ts`)**:
  - `authenticate`: Verifica a validade do token no header `Authorization`. Decodifica o payload e anexa o usuário em `req.user`.
  - `authorize(roles)`: Verifica se o usuário possui a role necessária ('ADMIN' ou 'USER').

### Segurança Adicional

- **Rate Limiter**: Limita o número de requisições por IP na rota `/api` para prevenir ataques de força bruta ou DDoS.
- **Helmet**: Configura headers HTTP de segurança.
- **CORS Strict**: Permite requisições apenas da `FRONTEND_URL` definida no `.env`.

## Tratamento de Erros

Utiliza um middleware global de erro (`src/middlewares/errorHandler.ts`).

- Erros operacionais são lançados usando a classe `AppError` (com status code e mensagem amigável).
- Erros não tratados (bugs) retornam 500 "Internal Server Error" para não vazar detalhes de implementação em produção.

## Validação de Dados

A validação é feita na entrada dos controllers utilizando **Zod**.

- Schemas são definidos nos arquivos de rota ou validação.
- Middleware `validate` rejeita requisições inválidas antes de chegarem ao controller.
