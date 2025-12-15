# Arquitetura do Frontend

## Roteamento (`App.tsx`)

O roteamento é gerenciado pelo `react-router-dom`. A aplicação possui rotas públicas e protegidas.

### Tipos de Rotas

1.  **Rotas Públicas**: Acessíveis sem autenticação.

    - `/` (Landing Page)
    - `/login` (Página de Login)
    - `/register` (Registro)
    - `/unauthorized` (Acesso negado)

2.  **Rotas Protegidas (`ProtectedRoute`)**: Exigem autenticação válida.

    - `/dashboard`
    - `/products` (Listagem, Criação, Edição, Detalhes)
    - `/import` e `/export`
    - `/search`

3.  **Rotas Administrativas**: Exigem role 'ADMIN'.
    - `/admin` (Admin Dashboard)
    - `/settings` (Configurações - também acessível por USER em alguns contextos)

### Lógica de Proteção (`ProtectedRoute.tsx`)

O componente `ProtectedRoute` verifica:

1.  Se o usuário está autenticado (`isAuthenticated`).
2.  Se o `token` é válido.
3.  Se o usuário possui as `requiredRoles` (se especificadas).

Se falhar na autenticação, redireciona para `/login`. Se falhar na autorização (role), redireciona para `/unauthorized`.

## Gerenciamento de Estado (Context API)

A aplicação utiliza múltiplos Context Providers aninhados no `App.tsx`:

1.  **AuthProvider (`AuthContext`)**:

    - Gerencia `user`, `token`, login, logout e refresh token.
    - Persiste sessão via `localStorage`.
    - Interage com `authService`.

2.  **CategoryProvider (`CategoryContext`)**:

    - Gerencia lista de categorias de produtos.

3.  **ProductProvider (`ProductContext`)**:

    - Gerencia estado global de produtos (embora muitas operações sejam diretas via service nas páginas).

4.  **MenuProvider (`MenuContext`)**:

    - Controla estado do menu lateral/mobile.

5.  **ThemeProvider (`ThemeContext`)**:
    - Gerencia tema claro/escuro.

## Fluxo de Autenticação

1.  **Login**: Usuário envia credenciais -> `authService.login` -> Recebe Token + Refresh Token -> Salva no Context e LocalStorage.
2.  **Sessão**: `AuthContext` inicializa verificando `localStorage`. Tenta carregar perfil atualizado da API.
3.  **Token Expirado**:
    - O `fetchInterceptor` detecta erro 401 ou mensagem "jwt expired".
    - Pausa requisições.
    - Tenta usar o `refreshToken` para obter novo token.
    - Se sucesso: atualiza storage, notifica app, re-executa requisição original.
    - Se falha: realiza logout forçado.

## Componentes Principais

- **DashboardScreen**: Visão geral com métricas e gráficos.
- **ProductFormPage**: O componente mais complexo da aplicação (`src/pages/ProductFormPage.tsx`).
  - Gerencia criação e edição.
  - Suporta **Templates de Produtos** para preenchimento rápido.
  - Integra **Compressão de Imagem** no client-side antes do upload.
  - Validação de formulário multi-etapa.
- **ImportScreen**: Interface para upload e processamento de planilhas.
- **ExportScreen**: Opções de exportação multicanal.
