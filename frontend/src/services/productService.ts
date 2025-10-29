import type { Product } from "../types/productType";
import { categoryService } from "./categoryService";
import { buildApiPath } from "../config/api";
// Função para obter userId do usuário logado
const getCurrentUser = (): any => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(user)
  return user.user || {};
};

const API_URL = buildApiPath('/api/v1/products');

// Função para obter token do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const AUTH_HEADER = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function getProducts(params?: { page?: number; pageSize?: number; search?: string; categoryId?: string; status?: string }): Promise<{ data: Product[]; total: number }> {
  const url = new URL(API_URL, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v && url.searchParams.append(k, String(v)));
  const res = await fetch(url.toString(), { headers: { ...AUTH_HEADER() } });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao buscar produtos');
  }

  const result = await res.json();

  // Adaptar os dados do backend para o formato do frontend
  const adaptedProducts: Product[] = result.data.map((backendProduct: any) => ({
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description,
    price: backendProduct.price,
    originalPrice: backendProduct.originalPrice,
    costPrice: backendProduct.costPrice,
    categoryId: backendProduct.categoryId,
    category: backendProduct.category,
    subcategory: backendProduct.subcategory,
    brand: backendProduct.brand,
    sku: backendProduct.sku,
    status: backendProduct.status,
    stock: backendProduct.stock,
    weight: backendProduct.weight,
    length: backendProduct.length,
    width: backendProduct.width,
    height: backendProduct.height,
    tags: backendProduct.tags || [],
    featured: backendProduct.featured,
    active: backendProduct.active,
    image: backendProduct.image,
    images: backendProduct.images || [],
    model: backendProduct.model,
    color: backendProduct.color,
    size: backendProduct.size,
    material: backendProduct.material,
    stockLocation: backendProduct.stockLocation,
    origin: backendProduct.origin,
    createdBy: backendProduct.createdBy,
    lastEditedBy: backendProduct.lastEditedBy,
    marketplaceIntegrations: backendProduct.marketplaceIntegrations,
    internalNotes: backendProduct.internalNotes,
    rating: backendProduct.rating,
    reviewCount: backendProduct.reviewCount || 0,
    views: backendProduct.views || 0,
    sales: backendProduct.sales || 0,
    userId: backendProduct.userId,
    user: backendProduct.user,
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: new Date(backendProduct.updatedAt),
    templateData: backendProduct.templateData || {},
  }));

  return { data: adaptedProducts, total: result.total };
}

export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/${id}`, { headers: { ...AUTH_HEADER() } });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao buscar produto');
  }

  const backendProduct = await res.json();

  // Adaptar os dados do backend para o formato do frontend
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description,
    price: backendProduct.price,
    originalPrice: backendProduct.originalPrice,
    costPrice: backendProduct.costPrice,
    categoryId: backendProduct.categoryId,
    category: backendProduct.category,
    subcategory: backendProduct.subcategory,
    brand: backendProduct.brand,
    sku: backendProduct.sku,
    status: backendProduct.status,
    weight: backendProduct.weight,
    length: backendProduct.length,
    width: backendProduct.width,
    height: backendProduct.height,
    tags: backendProduct.tags || [],
    featured: backendProduct.featured,
    active: backendProduct.active,
    image: backendProduct.image,
    images: backendProduct.images || [],
    model: backendProduct.model,
    color: backendProduct.color,
    size: backendProduct.size,
    material: backendProduct.material,
    stockLocation: backendProduct.stockLocation,
    origin: backendProduct.origin,
    createdBy: backendProduct.createdBy,
    lastEditedBy: backendProduct.lastEditedBy,
    marketplaceIntegrations: backendProduct.marketplaceIntegrations,
    internalNotes: backendProduct.internalNotes,
    rating: backendProduct.rating,
    reviewCount: backendProduct.reviewCount || 0,
    views: backendProduct.views || 0,
    sales: backendProduct.sales || 0,
    userId: backendProduct.userId,
    user: backendProduct.user,
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: new Date(backendProduct.updatedAt),
    templateData: backendProduct.templateData || {},
  };
}

export async function getCategories(): Promise<{ data: string[] }> {
  try {
    const categories = await categoryService.list();
    return { data: categories.map(cat => cat.name) };
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return { data: [] };
  }
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  let user = getCurrentUser();
  // Adaptar os dados do frontend para o formato do backend
  const adaptedData: any = {
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    costPrice: product.costPrice,
    categoryId: product.categoryId,
    subcategory: product.subcategory,
    brand: product.brand,
    sku: product.sku,
    status: product.status,
    weight: product.weight,
    length: product.length,
    width: product.width,
    height: product.height,
    tags: product.tags,
    featured: product.featured,
    active: product.active,
    image: product.image,
    images: product.images,
    model: product.model,
    color: product.color,
    size: product.size,
    material: product.material,
    stockLocation: product.stockLocation,
    origin: product.origin,
    marketplaceIntegrations: product.marketplaceIntegrations,
    internalNotes: product.internalNotes,
    user: product.user || user,
    userId: product.userId || user.id,
    createdById: product.createdById || user.id,
    lastEditedById: product.lastEditedById || user.id,
    templateData: product.templateData || {},
    // Campos de estatísticas - manter mesmo com valor 0 para inicialização
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    views: product.views ?? 0,
    sales: product.sales ?? 0,
  };

  // Remover apenas campos que são realmente opcionais e estão completamente vazios
  const optionalFields = ['description', 'originalPrice', 'costPrice', 'subcategory', 'brand', 'weight', 'length', 'width', 'height', 'image', 'model', 'color', 'size', 'material', 'stockLocation', 'origin', 'marketplaceIntegrations', 'internalNotes'];
  optionalFields.forEach(field => {
    const value = adaptedData[field];
    if (value === undefined || value === null || value === '') {
      delete adaptedData[field];
    }
  });

  // Manter arrays vazios se foram explicitamente definidos
  if (product.tags !== undefined && Array.isArray(product.tags)) {
    adaptedData.tags = product.tags;
  }
  if (product.images !== undefined && Array.isArray(product.images)) {
    adaptedData.images = product.images;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER() },
    body: JSON.stringify(adaptedData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao criar produto');
  }
  return await res.json();
}

export async function updateProduct(id: string, updated: Partial<Product>): Promise<Product> {
  let user = getCurrentUser();
  // Adaptar os dados do frontend para o formato do backend
  const adaptedData: any = {
    name: updated.name,
    description: updated.description,
    price: updated.price,
    originalPrice: updated.originalPrice,
    costPrice: updated.costPrice,
    categoryId: updated.categoryId,
    subcategory: updated.subcategory,
    brand: updated.brand,
    sku: updated.sku,
    status: updated.status,
    weight: updated.weight,
    length: updated.length,
    width: updated.width,
    height: updated.height,
    tags: updated.tags,
    featured: updated.featured,
    active: updated.active,
    image: updated.image,
    images: updated.images,
    model: updated.model,
    color: updated.color,
    size: updated.size,
    material: updated.material,
    stockLocation: updated.stockLocation,
    origin: updated.origin,
    marketplaceIntegrations: updated.marketplaceIntegrations,
    internalNotes: updated.internalNotes,
    userId: updated.userId || user.id,
    user: updated.user || user,
    lastEditedById: updated.lastEditedById || user.id,
    templateData: updated.templateData || {},
    // Campos de estatísticas - manter mesmo com valor 0 para inicialização
    rating: updated.rating ?? 0,
    reviewCount: updated.reviewCount ?? 0,
    views: updated.views ?? 0,
    sales: updated.sales ?? 0,
  };

  // Remover apenas campos que são realmente opcionais e estão completamente vazios
  const optionalFields = ['description', 'originalPrice', 'costPrice', 'subcategory', 'brand', 'weight', 'length', 'width', 'height', 'image', 'model', 'color', 'size', 'material', 'stockLocation', 'origin', 'marketplaceIntegrations', 'internalNotes'];
  optionalFields.forEach(field => {
    const value = adaptedData[field];
    if (value === undefined || value === null || value === '') {
      delete adaptedData[field];
    }
  });

  // Manter arrays vazios se foram explicitamente definidos
  if (updated.tags !== undefined && Array.isArray(updated.tags)) {
    adaptedData.tags = updated.tags;
  }
  if (updated.images !== undefined && Array.isArray(updated.images)) {
    adaptedData.images = updated.images;
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...AUTH_HEADER() },
    body: JSON.stringify(adaptedData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao atualizar produto');
  }
  return await res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { ...AUTH_HEADER() },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao excluir produto');
  }
}
