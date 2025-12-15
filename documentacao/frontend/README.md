# ShelfAI - Frontend Documentation

## Visão Geral

O frontend da plataforma ShelfAI é construído utilizando **React** com **TypeScript** e **Vite**, focando em performance, modernidade e uma experiência de usuário fluida.

## Stack Tecnológico

### Core

- **React 19**: Biblioteca principal para construção da interface.
- **TypeScript**: Superset do JavaScript para tipagem estática e segurança.
- **Vite**: Build tool e servidor de desenvolvimento rápido.

### Estilização e UI

- **Tailwind CSS 4**: Framework utility-first para estilização rápida.
- **Framer Motion**: Biblioteca para animações fluidas.
- **React Icons / FontAwesome / MUI Icons**: Bibliotecas de ícones.
- **React Toastify**: Notificações toast para feedback ao usuário.

### Gerenciamento de Estado e Dados

- **Context API**: Utilizado para estados globais (Auth, Theme, Products, Categories, Menu).
- **React Router DOM**: Para roteamento no lado do cliente.

### Comunicação com Backend

- **Axios**: Cliente HTTP (implícito ou explícito via interceptors).
- **Socket.IO Client**: Para comunicação em tempo real.
- **Fetch Interceptor**: Camada personalizada para tratamento de requisições e refresh de token.

### Funcionalidades Específicas

- **Chart.js / React Chartjs 2**: Para visualização de dados no dashboard.
- **Supabase Client**: Integração direta para funcionalidades específicas (Auth/Storage).
- **Browser Image Compression**: Otimização de imagens no lado do cliente.

## Configuração e Instalação

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Rodar servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

   O servidor iniciará geralmente em `http://localhost:5173`.

3. **Build para produção**

   ```bash
   npm run build
   ```

4. **Configuração de Ambiente**
   Crie um arquivo `.env` na raiz do diretório `frontend` baseado no exemplo abaixo:

   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   VITE_API_BASE_URL=http://localhost:3000 # URL do backend
   ```

5. **Linting**
   ```bash
   npm run lint
   ```

## Estrutura de Diretórios

- **`src/assets`**: Imagens, fontes e recursos estáticos.
- **`src/components`**: Componentes reutilizáveis (Botões, Inputs, Header, Sidebar).
- **`src/config`**: Configurações globais (Interceptor, API config).
- **`src/context`**: Provedores de estado global (Auth, Theme, Data).
- **`src/data`**: Dados estáticos ou mocks utilizados na aplicação.
- **`src/hooks`**: Custom hooks para lógica encapsulada.
- **`src/lib`**: Utilitários de bibliotecas de terceiros.
- **`src/pages`**: Componentes de página (Views) associados às rotas.
- **`src/services`**: Camada de serviço para comunicação com API e lógica de negócios.
- **`src/styles`**: Arquivos de estilo globais ou específicos.
- **`src/types`**: Definições de tipos TypeScript globais.
- **`src/utils`**: Funções auxiliares e formatadores.
