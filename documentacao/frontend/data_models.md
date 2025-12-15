# Modelos de Dados

O frontend compartilha tipos com o backend para garantir consistência. Os principais tipos estão definidos em `src/types`.

## Produto (`Product`)

O modelo principal da aplicação.

```typescript
interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  categoryId: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  images: string[];
  stockQuantity: number;
  // ...outros campos
  status: "active" | "draft" | "archived";
}
```

## Usuário (`User`)

Definido no contexto de autenticação ou tipos compartilhados.

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  // ...
}
```

## Templates de Produto (`ProductTemplate`)

Utilizados no `ProductFormPage` para preenchimento rápido.

```typescript
interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[]; // Campos pré-definidos
}
```
