import type { Product } from "../types/productType";

const API_URL = "/api/v1/products";
const AUTH_HEADER = { Authorization: "Bearer demo-token" };

export async function getProducts(params?: { page?: number; pageSize?: number; search?: string; categoryId?: string; status?: string }): Promise<{ data: Product[]; total: number }> {
  const url = new URL(API_URL, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v && url.searchParams.append(k, String(v)));
  const res = await fetch(url.toString(), { headers: { ...AUTH_HEADER } });
  if (!res.ok) throw await res.json();

  const result = await res.json();

  // Adaptar os dados do backend para o formato do frontend
  const adaptedProducts: Product[] = result.data.map((backendProduct: any) => ({
    id: backendProduct.id, // Backend retorna string, frontend espera number
    name: backendProduct.name,
    description: backendProduct.description || "",
    price: backendProduct.price || 0,
    originalPrice: backendProduct.originalPrice,
    category: backendProduct.category?.name || backendProduct.categoryId || "", // ✅ Backend retorna objeto category com name
    subcategory: backendProduct.subcategory,
    brand: backendProduct.brand,
    sku: backendProduct.sku || "",
    status: backendProduct.status,
    stock: 0, // Backend não tem stock, frontend usa 0 como padrão
    minStock: 0, // Backend não tem minStock, frontend usa 0 como padrão
    weight: backendProduct.weight,
    dimensions: {
      length: backendProduct.length,
      width: backendProduct.width,
      height: backendProduct.height,
    },
    tags: backendProduct.tags || [],
    views: 0, // Backend não tem views, frontend usa 0 como padrão
    sales: 0, // Backend não tem sales, frontend usa 0 como padrão
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: new Date(backendProduct.updatedAt),
    featured: backendProduct.featured || false,
    active: backendProduct.active !== false, // Backend pode ter null, frontend usa true como padrão
    templateData: {}, // Backend não tem templateData, frontend usa objeto vazio
  }));

  return { data: adaptedProducts, total: result.total };
}

export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/${id}`, { headers: { ...AUTH_HEADER } });
  if (!res.ok) throw await res.json();

  const backendProduct = await res.json();

  // Adaptar os dados do backend para o formato do frontend
  return {
    id: backendProduct.id, // Backend retorna string, frontend espera number
    name: backendProduct.name,
    description: backendProduct.description || "",
    price: backendProduct.price || 0,
    originalPrice: backendProduct.originalPrice,
    category: backendProduct.category?.name || backendProduct.categoryId || "", // Backend retorna objeto category ou categoryId
    subcategory: backendProduct.subcategory,
    brand: backendProduct.brand,
    sku: backendProduct.sku || "",
    status: backendProduct.status,
    stock: 0, // Backend não tem stock, frontend usa 0 como padrão
    minStock: 0, // Backend não tem minStock, frontend usa 0 como padrão
    weight: backendProduct.weight,
    dimensions: {
      length: backendProduct.length,
      width: backendProduct.width,
      height: backendProduct.height,
    },
    tags: backendProduct.tags || [],
    views: 0, // Backend não tem views, frontend usa 0 como padrão
    sales: 0, // Backend não tem sales, frontend usa 0 como padrão
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: new Date(backendProduct.updatedAt),
    featured: backendProduct.featured || false,
    active: backendProduct.active !== false, // Backend pode ter null, frontend usa true como padrão
    templateData: {}, // Backend não tem templateData, frontend usa objeto vazio
  };
}

export async function getCategories(): Promise<{ data: string[] }> {
  const res = await fetch('/api/v1/categories', { headers: { ...AUTH_HEADER } });
  if (!res.ok) throw await res.json();
  const categories = await res.json();
  // Extrai apenas o nome das categorias
  return { data: Array.isArray(categories) ? categories.map((c: any) => c.name) : [] };
}


export async function createProduct(product: Partial<Product>): Promise<Product> {
  // Adaptar os dados do frontend para o formato do backend
  const adaptedData = {
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    categoryName: product.category, // ✅ Backend agora aceita categoryName
    subcategory: product.subcategory,
    brand: product.brand,
    sku: product.sku,
    status: product.status,
    weight: product.weight,
    length: product.dimensions?.length,
    width: product.dimensions?.width,
    height: product.dimensions?.height,
    tags: product.tags,
    featured: product.featured,
    active: product.active,
    // Campos que não existem no backend são ignorados
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(adaptedData),
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function updateProduct(id: string, updated: Partial<Product>): Promise<Product> {
  // Adaptar os dados do frontend para o formato do backend
  const adaptedData = {
    name: updated.name,
    description: updated.description,
    price: updated.price,
    originalPrice: updated.originalPrice,
    categoryName: updated.category, // ✅ Backend agora aceita categoryName
    subcategory: updated.subcategory,
    brand: updated.brand,
    sku: updated.sku,
    status: updated.status,
    weight: updated.weight,
    length: updated.dimensions?.length,
    width: updated.dimensions?.width,
    height: updated.dimensions?.height,
    tags: updated.tags,
    featured: updated.featured,
    active: updated.active,
  };

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER },
    body: JSON.stringify(adaptedData),
  });
  if (!res.ok) throw await res.json();
  return await res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { ...AUTH_HEADER },
  });
  if (!res.ok) throw await res.json();
}
