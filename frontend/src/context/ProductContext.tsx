import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import type { Product } from "../types/productType";

interface ProductContextType {
  products: Product[];
  addProduct: (data: Omit<Product, "id">) => void;
  editProduct: (id: number, updated: Partial<Product>) => void;
  removeProduct: (id: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  // const [loading, setLoading] = useState(true)

  // carregar produtos ao iniciar
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  function addProduct(product: Omit<Product, "id">) {
    const newProduct = createProduct(product);
    setProducts((prev) => [...prev, newProduct]);
  }

  function editProduct(id: number, updated: Partial<Product>) {
    const product = updateProduct(id, updated);
    if (product) {
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
    }
  }

  function removeProduct(id: number) {
    deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <ProductContext.Provider
      value={{ products, addProduct, editProduct, removeProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if(!context) throw new Error("useProducts deve ser usado dentro de ProductProvider");
  return context;
}
