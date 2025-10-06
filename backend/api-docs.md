# ShelfAI API - Documentação dos Endpoints

## Autenticação

Todas as rotas exigem header:
```
Authorization: Bearer <seu_token>
```

---

## Produtos

### Listar Produtos
- **GET** `/api/v1/products`
  - Lista produtos com paginação e filtros
  - Query params:
    - `page`: Número da página (padrão: 1)
    - `pageSize`: Itens por página (padrão: 10, máximo: 100)
    - `search`: Termo de busca
    - `categoryId`: Filtrar por categoria
    - `status`: Filtrar por status ('complete' ou 'incomplete')
  - Exemplo: `/api/v1/products?page=1&pageSize=10&search=celular`

### Detalhes do Produto
- **GET** `/api/v1/products/:id`
  - Retorna os detalhes de um produto específico

### Criar Produto
- **POST** `/api/v1/products`
  - Cria um novo produto
  - Body (exemplo):
    ```json
    {
      "name": "Notebook Gamer",
      "description": "Notbook gamer com placa de vídeo dedicada",
      "price": 4999.90,
      "originalPrice": 5499.90,
      "categoryId": "categoria_id",
      "subcategory": "Notebooks",
      "brand": "Marca X",
      "sku": "NTB-GMR-001",
      "status": "complete",
      "weight": 2.5,
      "length": 36,
      "width": 25,
      "height": 2.5,
      "tags": ["gamer", "notebook", "performance"],
      "featured": true,
      "active": true
    }
    ```

### Atualizar Produto
- **PUT** `/api/v1/products/:id`
  - Atualiza um produto existente
  - Body: Mesma estrutura do POST, mas campos são opcionais

### Remover Produto
- **DELETE** `/api/v1/products/:id`
  - Remove um produto (soft delete)

---

## Categorias

### Listar Categorias
- **GET** `/api/v1/categories`
  - Lista todas as categorias
  - Query params:
    - `page`: Número da página
    - `pageSize`: Itens por página
    - `search`: Termo de busca

### Detalhes da Categoria
- **GET** `/api/v1/categories/:id`
  - Retorna os detalhes de uma categoria

### Criar Categoria
- **POST** `/api/v1/categories`
  - Cria uma nova categoria
  - Body (exemplo):
    ```json
    {
      "name": "Eletrônicos",
      "description": "Produtos eletrônicos em geral"
    }
    ```

### Atualizar Categoria
- **PUT** `/api/v1/categories/:id`
  - Atualiza uma categoria existente

### Remover Categoria
- **DELETE** `/api/v1/categories/:id`
  - Remove uma categoria (apenas se não estiver em uso)

---

## Importação/Exportação

### Listar Formatos de Exportação
- **GET** `/api/v1/import-export/export/formats`
  - Lista todos os formatos de exportação disponíveis
  - Resposta (exemplo):
    ```json
    {
      "formats": [
        {
          "id": "csv",
          "name": "Csv",
          "mimeType": "text/csv",
          "fileName": "produtos_exportados.csv"
        },
        {
          "id": "excel",
          "name": "Excel",
          "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "fileName": "produtos_exportados.xlsx"
        },
        {
          "id": "shopify",
          "name": "Shopify",
          "mimeType": "text/csv",
          "fileName": "produtos_shopify.csv"
        },
        {
          "id": "mercadolivre",
          "name": "Mercado Livre",
          "mimeType": "text/csv",
          "fileName": "produtos_mercadolivre.csv"
        },
        {
          "id": "shopee",
          "name": "Shopee",
          "mimeType": "text/csv",
          "fileName": "produtos_shopee.csv"
        },
        {
          "id": "amazon",
          "name": "Amazon",
          "mimeType": "text/plain",
          "fileName": "produtos_amazon.txt"
        },
        {
          "id": "aliexpress",
          "name": "AliExpress",
          "mimeType": "text/csv",
          "fileName": "produtos_aliexpress.csv"
        }
      ]
    }
    ```

### Exportar Produtos
- **GET** `/api/v1/import-export/export`
  - Exporta produtos no formato CSV (padrão)
  - Query params:
    - `format`: Formato de exportação (opcional, padrão: 'csv')
  - Exemplos:
    - `/api/v1/import-export/export` - Exporta para CSV
    - `/api/v1/import-export/export?format=shopify` - Exporta para o formato do Shopify

### Importar Produtos
- **POST** `/api/v1/import-export/import`
  - Importa produtos a partir de um arquivo
  - Content-Type: `multipart/form-data`
  - Body:
    - `file`: Arquivo para importação (CSV, Excel, etc.)
  - Exemplo de uso com cURL:
    ```bash
    curl -X POST \
      http://localhost:3000/api/v1/import-export/import \
      -H 'Authorization: Bearer seu_token' \
      -H 'Content-Type: multipart/form-data' \
      -F 'file=@/caminho/para/arquivo.csv'
    ```

---

## Usuários

### Listar Usuários
- **GET** `/api/v1/users`
  - Apenas para administradores
  - Query params:
    - `page`: Número da página
    - `pageSize`: Itens por página
    - `search`: Termo de busca

### Detalhes do Usuário
- **GET** `/api/v1/users/:id`
  - Apenas para o próprio usuário ou administradores

### Criar Usuário
- **POST** `/api/v1/users`
  - Apenas para administradores
  - Body (exemplo):
    ```json
    {
      "name": "Novo Usuário",
      "email": "usuario@exemplo.com",
      "password": "senha123",
      "role": "user"
    }
    ```

### Atualizar Usuário
- **PUT** `/api/v1/users/:id`
  - Apenas para o próprio usuário ou administradores

### Remover Usuário
- **DELETE** `/api/v1/users/:id`
  - Apenas para administradores
  - Não é possível remover o próprio usuário

---

## Autenticação

### Login
- **POST** `/api/v1/auth/login`
  - Body (exemplo):
    ```json
    {
      "email": "admin@exemplo.com",
      "password": "senha123"
    }
    ```
  - Resposta (exemplo):
    ```json
    {
      "user": {
        "id": "user_id",
        "name": "Admin",
        "email": "admin@exemplo.com",
        "role": "admin"
      },
      "token": "jwt_token"
    }
    ```

### Obter Perfil
- **GET** `/api/v1/auth/me`
  - Retorna os dados do usuário autenticado

### Atualizar Senha
- **PUT** `/api/v1/auth/update-password`
  - Body (exemplo):
    ```json
    {
      "currentPassword": "senha_atual",
      "newPassword": "nova_senha"
    }
    ```

---

## Respostas de Erro

Todas as respostas de erro seguem o formato:
```json
{
  "error": {
    "message": "Mensagem descritiva do erro",
    "status": 400,
    "code": "CODIGO_DO_ERRO"
  }
}
```

### Códigos de Erro Comuns
- `AUTH_REQUIRED`: Autenticação necessária
- `INVALID_CREDENTIALS`: Credenciais inválidas
- `FORBIDDEN`: Acesso negado
- `NOT_FOUND`: Recurso não encontrado
- `VALIDATION_ERROR`: Erro de validação
- `DUPLICATE_ENTRY`: Registro duplicado
- `INTERNAL_SERVER_ERROR`: Erro interno do servidor

---

## Exemplos de Uso

### Exemplo com fetch (JavaScript)
```javascript
// Listar produtos
const response = await fetch('http://localhost:3000/api/v1/products', {
  headers: { 
    'Authorization': 'Bearer seu_token',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// Criar produto
const newProduct = {
  name: "Novo Produto",
  price: 99.90,
  status: "complete"
};

const createResponse = await fetch('http://localhost:3000/api/v1/products', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer seu_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newProduct)
});

const result = await createResponse.json();
console.log(result);
```

### Exemplo com cURL
```bash
# Fazer login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"senha123"}'

# Listar produtos (com token JWT)
curl -X GET http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer seu_token"
```

---

## Seed de teste

Para popular dados de teste, rode manualmente o utilitário em `src/utils/seedTestData.ts`.

---

## Observações
- Todos os endpoints aceitam e retornam JSON.
- Para deploy, configure a variável `DATABASE_URL` no .env com a string do Supabase.
