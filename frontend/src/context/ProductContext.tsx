import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { useAuth } from "./AuthContext";
import { supabase } from "../services/supabaseClient";
import type { Product } from "../types/productType";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (data: Partial<Product>) => Promise<void>;
  editProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err?.error?.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let subscription: any;

    if (isAuthenticated) {
      reload();

      // console.log(
      //   "Setting up Supabase subscription for ALL tables (debugging)..."
      // );
      subscription = supabase
        .channel("product-context-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Product" },
          async (payload) => {
            // console.log("Realtime update received!", payload);

            if (payload.eventType === "INSERT") {
              // Fetch complete product data including relations
              try {
                const newProduct = await getProductById(payload.new.id);
                setProducts((prev) => [newProduct, ...prev]);
              } catch (err) {
                console.error("Error fetching new product:", err);
                // Fallback to reload if fetch fails
                reload();
              }
            } else if (payload.eventType === "UPDATE") {
              try {
                const updatedProduct = await getProductById(payload.new.id);
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === updatedProduct.id ? updatedProduct : p
                  )
                );
              } catch (err) {
                console.error("Error fetching updated product:", err);
                reload();
              }
            } else if (payload.eventType === "DELETE") {
              setProducts((prev) =>
                prev.filter((p) => p.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe((status) => {
          status;
        });
    } else {
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  async function addProduct(product: Partial<Product>) {
    setError(null);
    setLoading(true);
    try {
      await createProduct(product);
      await reload();
    } catch (err: any) {
      setError(err?.error?.message || "Erro ao adicionar produto");
    } finally {
      setLoading(false);
    }
  }

  async function editProduct(id: string, updated: Partial<Product>) {
    setError(null);
    setLoading(true);
    try {
      await updateProduct(id, updated);
      await reload();
    } catch (err: any) {
      setError(err?.error?.message || "Erro ao editar produto");
    } finally {
      setLoading(false);
    }
  }

  async function removeProduct(id: string) {
    setError(null);
    setLoading(true);
    try {
      await deleteProduct(id);
      await reload();
    } catch (err: any) {
      setError(err?.error?.message || "Erro ao remover produto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        editProduct,
        removeProduct,
        reload,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProducts deve ser usado dentro de ProductProvider");
  return context;
}
