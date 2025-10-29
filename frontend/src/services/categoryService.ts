import { buildApiPath } from "../config/api";

const API_URL = buildApiPath('/api/v1/categories');

// Função para obter userId do usuário logado
const getCurrentUser = (): any => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log(user)
  return user.user || {};
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const AUTH_HEADER = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interface para categoria
export interface Category {
  id: string;
  name: string;
  description?: string;
  products?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para criação de categoria
export interface CategoryInput {
  name: string;
  description?: string;
}

// Serviço de categorias
export const categoryService = {
  // Listar todas as categorias
  async list(): Promise<Category[]> {
    const res = await fetch(API_URL, {
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao buscar categorias');
    }

    return await res.json();
  },

  // Obter categoria por ID
  async get(id: string): Promise<Category> {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao buscar categoria');
    }

    return await res.json();
  },

  // Criar categoria
  async create(categoryData: CategoryInput): Promise<Category> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER(),
      },
      body: JSON.stringify(categoryData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao criar categoria');
    }

    return await res.json();
  },

  // Atualizar categoria
  async update(id: string, categoryData: Partial<CategoryInput>): Promise<Category> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER(),
      },
      body: JSON.stringify(categoryData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao atualizar categoria');
    }

    return await res.json();
  },

  // Excluir categoria
  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao excluir categoria');
    }
  },

  // Obter apenas os nomes das categorias (para selects)
  async getCategoryNames(): Promise<string[]> {
    try {
      const categories = await this.list();
      return categories.map(cat => cat.name);
    } catch (error) {
      console.error('Erro ao buscar nomes das categorias:', error);
      return [];
    }
  },
};
