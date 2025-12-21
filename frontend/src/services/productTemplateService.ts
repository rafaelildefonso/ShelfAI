import { buildApiPath } from "../config/api";

const API_URL = buildApiPath("/api/v1/product-templates");

const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

const AUTH_HEADER = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "file";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    step?: number | string;
  };
}

export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  fields: TemplateField[];
  createdAt?: string;
  updatedAt?: string;
}

export const productTemplateService = {
  // Listar todos os templates
  getTemplates: async (): Promise<{ data: ProductTemplate[] }> => {
    const res = await fetch(API_URL, {
      headers: { ...AUTH_HEADER() },
    });
    if (!res.ok) {
      throw new Error("Erro ao buscar templates");
    }
    return await res.json();
  },

  // Obter um template por ID
  getTemplateById: async (id: string): Promise<{ data: ProductTemplate }> => {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { ...AUTH_HEADER() },
    });
    if (!res.ok) {
      throw new Error("Erro ao buscar template");
    }
    return await res.json();
  },

  // Criar novo template
  createTemplate: async (
    template: Omit<ProductTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<{ data: ProductTemplate }> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...AUTH_HEADER() },
      body: JSON.stringify(template),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Erro ao criar template");
    }
    return await res.json();
  },

  // Atualizar template
  updateTemplate: async (
    id: string,
    template: Partial<ProductTemplate>
  ): Promise<{ data: ProductTemplate }> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...AUTH_HEADER() },
      body: JSON.stringify(template),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Erro ao atualizar template");
    }
    return await res.json();
  },

  // Excluir template
  deleteTemplate: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { ...AUTH_HEADER() },
    });
    if (!res.ok) {
      throw new Error("Erro ao excluir template");
    }
  },
};
