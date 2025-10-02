import type { Product } from "../types/productType";

const STORAGE_KEY = "products";

// Helper de ler products
function getStoredProducts() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// CREATE
export function createProduct(product: Omit<Product, "id"> & { id?: number })  {
  const products = getStoredProducts();
  const newProduct: Product = { ...product, id: products.length > 0 ? products[products.length - 1].id + 1 : 1, createdAt: new Date(), updatedAt: new Date() };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return newProduct;
}

// READ (listar todos)
export function getProducts(): Product[] {
  return getStoredProducts();
}

// READ (listar todas categorias)
export function getCategories(): string[] {
  const products = getStoredProducts();
  var categories = products.map((p:Product) => p.category);
  var uniqueCategories = new Set<string>(categories);
  return Array.from(uniqueCategories);
}

// READ (um produto só)
export function getProductById(id: number) {
    return getStoredProducts().find((p: Product) => p.id === id) || null;
}

// UPDATE
export function updateProduct(
  id: number,
  updated: Partial<Product>
): Product | null {
  let products = getStoredProducts();
  const index = products.findIndex((p: Product) => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...updated };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return products[index];
}

// DELETE
export function deleteProduct(id: number): void {
  let products = getStoredProducts().filter((p: Product) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
