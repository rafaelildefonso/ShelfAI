import React, { createContext, useContext, useState, useEffect } from "react";
import { categoryService } from "../services/categoryService";
import type { Category, CategoryInput } from "../services/categoryService";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (data: CategoryInput) => Promise<Category>;
  editCategory: (id: string, data: Partial<CategoryInput>) => Promise<Category>;
  removeCategory: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function addCategory(categoryData: CategoryInput) {
    setError(null);
    try {
      const newCategory = await categoryService.create(categoryData);
      await reload();
      return newCategory;
    } catch (err: any) {
      setError(err?.message || "Erro ao adicionar categoria");
      throw err;
    }
  }

  async function editCategory(id: string, categoryData: Partial<CategoryInput>) {
    setError(null);
    try {
      const updated = await categoryService.update(id, categoryData);
      await reload();
      return updated;
    } catch (err: any) {
      setError(err?.message || "Erro ao editar categoria");
      throw err;
    }
  }

  async function removeCategory(id: string) {
    setError(null);
    try {
      await categoryService.remove(id);
      await reload();
    } catch (err: any) {
      setError(err?.message || "Erro ao remover categoria");
      throw err;
    }
  }

  return (
    <CategoryContext.Provider
      value={{ categories, loading, error, addCategory, editCategory, removeCategory, reload }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) throw new Error("useCategories deve ser usado dentro de CategoryProvider");
  return context;
}