import { buildApiPath } from '../config/api';

const API_URL = buildApiPath('/api/v1/admin');

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const getAuthHeader = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  // Default Categories
  createDefaultCategory: async (data: { name: string; description?: string }) => {
    const res = await fetch(`${API_URL}/categories/default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao criar categoria padrão');
    }

    return await res.json();
  },

  listDefaultCategories: async () => {
    const res = await fetch(`${API_URL}/categories/default`, {
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao buscar categorias padrão');
    }

    return await res.json();
  },

  updateDefaultCategory: async (id: string, data: { name: string; description?: string }) => {
    const res = await fetch(`${API_URL}/categories/default/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao atualizar categoria padrão');
    }

    return await res.json();
  },

  deleteDefaultCategory: async (id: string) => {
    const res = await fetch(`${API_URL}/categories/default/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao excluir categoria padrão');
    }
  },

  // Bulk create default categories
  bulkCreateDefaultCategories: async (categories: Array<{ name: string; description?: string }>) => {
    const res = await fetch(`${API_URL}/categories/default/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ categories }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao importar categorias');
    }

    return await res.json();
  },
};
