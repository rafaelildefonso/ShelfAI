# Serviços e Integração de API

A camada de serviços (`src/services`) centraliza a comunicação com o backend e outras APIs externas (como Supabase).

## Configuração HTTP (`src/config`)

### Fetch Interceptor (`fetchInterceptor.ts`)

Substitui o `window.fetch` global para adicionar comportamentos padrão:

- **Tratamento de Erros**: Captura erros 429 (Rate Limit) e exibe toasts.
- **Refresh Token Automático**: Intercepta erros 401/JWT Expired, renova o token transparentemente e repete a requisição.
- **API Path**: Utiliza `buildApiPath` para prefixar URLs corretamente.

## Módulos de Serviço

### 1. authService (`authService.ts`)

Gerencia todas as operações de autenticação.

- `login(credentials)`: Autentica usuário.
- `getProfile()`: Busca dados do usuário logado.
- `updateProfile(data)`: Atualiza dados cadastrais.
- `updatePassword(data)`: Troca de senha.
- `refreshToken()`: Renova tokens de acesso.

### 2. productService (`productService.ts`)

CRUD de produtos e operações relacionadas.

- Listagem, Detalhes, Criação, Atualização, Deleção.
- Integração com endpoints de busca.

### 3. importService (`importService.ts`)

Gerencia o fluxo de importação em massa.

- Upload de arquivos CSV/Excel.
- Validação de dados.
- Processamento assíncrono.

### 4. notificationService (`notificationService.ts`)

Gerencia notificações do sistema para o usuário, provavelmente integrado via WebSocket ou polling.

### 5. supabaseClient (`supabaseClient.ts`)

Cliente direto do Supabase.

- Inicializado com variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Usado para funcionalidades que requerem acesso direto (ex: Storage, Realtime, ou Auth secundário se aplicável).

## Tratamento de Dados

- **Interfaces TypeScript**: Definidas nos arquivos de serviço ou em `src/types` para garantir tipagem forte das respostas da API.
- **DTOs**: Objetos de transferência de dados são tipados para evitar erros de runtime.
