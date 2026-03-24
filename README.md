# ShelfAI

<div align="center">
  <img src=".github/shelfai.png" alt="Preview do Projeto" width="800"/>
  
  [![Versão](https://img.shields.io/badge/versão-1.0.0-blue)](https://github.com/rafaelildefonso/ShelfAI/releases)
  [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-4.3.9-646CFF?logo=vite)](https://vitejs.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-18.0.0-339933?logo=node.js)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)](https://expressjs.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.0.0-0D47A1?logo=prisma)](https://www.prisma.io/)
  [![Supabase](https://img.shields.io/badge/Supabase-3.0.0-3ECF8E?logo=supabase)](https://supabase.com/)
  [![Jest](https://img.shields.io/badge/Jest-29.0.0-C21325?logo=jest)](https://jestjs.io/)
  [![Licença](https://img.shields.io/badge/licença-MIT-green)](LICENSE)
</div>

**ShelfAI** é uma plataforma moderna e clean que ajuda lojas a organizar seus produtos de forma inteligente, agilizando o cadastro em e-commerces. Com funcionalidades de importação, organização e exportação multicanal, ShelfAI combina praticidade com inteligência para lojistas que querem economizar tempo e reduzir erros.

---

## 🎯 Problema que resolve
Cadastrar produtos manualmente em múltiplos marketplaces (Shopify, Mercado Livre, Magalu, etc.) é demorado e sujeito a erros.  
ShelfAI simplifica esse processo, fornecendo ferramentas que:
- Padronizam os dados do produto
- Geram descrições automáticas
- Facilitam a exportação para diferentes plataformas

---

## ⚡ Funcionalidades principais
- **Importação de produtos** via CSV/Excel com mapeamento de colunas
- **Geração automática de descrições** para produtos
- **Exportação multicanal** pronta para Shopify, Mercado Livre, Magalu
- **Dashboard clean** mostrando produtos cadastrados, status e histórico de importações
- **Templates de cadastro** para aplicar a vários produtos rapidamente
- **Design responsivo** e suporte a tema escuro

---

## 🎨 Paleta de cores
ShelfAI usa uma paleta clean, moderna e agradável aos olhos, com suporte a modo claro e escuro:

### Tema claro
- Fundo: `#fbfbfe`  
- Superfície: `#FFFFFF`  
- Bordas: `#E5E7EB`  
- Texto principal: `#1F2937`  
- Texto secundário: `#6B7280`  
- Cor de destaque (accent): `#8B5CF6`  
- Hover do destaque: `#7C3AED`  

### Tema escuro
- Fundo: `#111827`  
- Superfície: `#1F2937`  
- Bordas: `#374151`  
- Texto principal: `#E5E7EB`  
- Texto secundário: `#9CA3AF`  

---

## 🛠 Tecnologias utilizadas
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS  
- **Backend:** Node.js + Express + TypeScript  
- **Banco de dados:** Supabase (PostgreSQL via Prisma)  
- **ORM:** Prisma  
- **Autenticação:** JWT, bcrypt, Supabase Auth  
- **Armazenamento de arquivos:** Supabase Storage  
- **Deploy:** Railway/Docker + Vercel (frontend)  
- **Testes:** Jest  

---

## 🚀 Como rodar localmente
1. Clone o repositório:
```bash
git clone https://github.com/rafaelildefonso/ShelfAI.git
