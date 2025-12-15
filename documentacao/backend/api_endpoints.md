# Endpoints da API

A API é versionada globalmente (atualmente v1). Todos os endpoints são prefixados com `/api/v1` (exceto `/api/files`).

## Grupos de Rotas

### Autenticação (`/api/v1/auth`)

- POST `/login`: Autenticação de usuário.
- POST `/register`: Cadastro de novos usuários.
- POST `/refresh-token`: Renovação de token de acesso.

### Produtos (`/api/v1/products`)

- GET `/`: Listagem com filtros e paginação.
- GET `/:id`: Detalhes de um produto.
- POST `/`: Criação de produto.
- PUT `/:id`: Atualização de produto.
- DELETE `/:id`: Remoção de produto.

### Usuários (`/api/v1/users`)

- GET `/profile`: Dados do perfil do usuário logado do token.
- PUT `/profile`: Atualização de cadastro.

### Categorias (`/api/v1/categories`)

- CRUD de categorias para organização de produtos.

### Importação e Exportação (`/api/v1/import-export`)

- POST `/import`: Upload de arquivos CSV/Excel para processamento em massa.
- POST `/export`: Geração de arquivos de exportação.

### Administrativo (`/api/v1/admin`)

- Rotas exclusivas para usuários com role ADMIN (gerenciamento de usuários, métricas globais).

---

> **Nota**: Para documentação detalhada (Swagger), execute o projeto em modo de desenvolvimento (`npm run dev`) e acesse `/api-docs`.
