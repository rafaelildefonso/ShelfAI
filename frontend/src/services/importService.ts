import { buildApiPath } from "../config/api";

const API_URL = buildApiPath('/api/v1/import-export/import');

// Função para obter token do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const AUTH_HEADER = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interfaces para tipos de dados
export interface ImportPreview {
  headers: string[];
  preview: Array<{[key: string]: any}>;
  totalRows: number;
  validationErrors: Array<{row: number, errors: string[]}>;
  suggestedMapping: {[key: string]: string};
}

export interface ImportTemplate {
  id: string;
  name: string;
  description?: string;
  fileType: 'csv' | 'xlsx';
  delimiter?: string;
  mapping: {[key: string]: string};
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportResult {
  imported: number;
  errors: Array<{row: number, error: string}>;
  total: number;
}

export interface ProductField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
}

// Campos disponíveis para mapeamento
export const PRODUCT_FIELDS: ProductField[] = [
  { key: 'name', label: 'Nome do Produto', type: 'string', required: true },
  { key: 'description', label: 'Descrição', type: 'string', required: false },
  { key: 'price', label: 'Preço', type: 'number', required: false },
  { key: 'originalPrice', label: 'Preço Original', type: 'number', required: false },
  { key: 'costPrice', label: 'Custo', type: 'number', required: false },
  { key: 'sku', label: 'SKU/Código', type: 'string', required: true },
  { key: 'category', label: 'Categoria', type: 'string', required: false },
  { key: 'subcategory', label: 'Subcategoria', type: 'string', required: false },
  { key: 'brand', label: 'Marca', type: 'string', required: false },
  { key: 'status', label: 'Status', type: 'string', required: false },
  { key: 'weight', label: 'Peso (kg)', type: 'number', required: false },
  { key: 'length', label: 'Comprimento (cm)', type: 'number', required: false },
  { key: 'width', label: 'Largura (cm)', type: 'number', required: false },
  { key: 'height', label: 'Altura (cm)', type: 'number', required: false },
  { key: 'tags', label: 'Tags', type: 'array', required: false },
  { key: 'featured', label: 'Destaque', type: 'boolean', required: false },
  { key: 'active', label: 'Ativo', type: 'boolean', required: false },
  { key: 'image', label: 'Imagem', type: 'string', required: false },
  { key: 'images', label: 'Imagens', type: 'array', required: false },
  { key: 'model', label: 'Modelo', type: 'string', required: false },
  { key: 'color', label: 'Cor', type: 'string', required: false },
  { key: 'size', label: 'Tamanho', type: 'string', required: false },
  { key: 'material', label: 'Material', type: 'string', required: false },
  { key: 'stockLocation', label: 'Local de Estoque', type: 'string', required: false },
  { key: 'origin', label: 'Origem', type: 'string', required: false },
  { key: 'internalNotes', label: 'Notas Internas', type: 'string', required: false },
];

export const importService = {
  // Preview do arquivo antes da importação
  async preview(file: File, templateId?: string, delimiter: string = ','): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);

  const url = new URL(`${API_URL}/preview`, window.location.origin);
  if (templateId) url.searchParams.append('templateId', templateId);
  if (delimiter && delimiter !== ',') url.searchParams.append('delimiter', delimiter);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { ...AUTH_HEADER() },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao fazer preview do arquivo');
    }

    return await res.json();
  },

  // Preview de teste sem autenticação (para debug)
  async previewTest(file: File, templateId?: string, delimiter: string = ','): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
  const endpoint = buildApiPath('/api/v1/import-export/import/preview-test');
    const url = new URL(endpoint, window.location.origin);
    if (templateId) url.searchParams.append('templateId', templateId);
    if (delimiter && delimiter !== ',') url.searchParams.append('delimiter', delimiter);

    console.log('🔍 [DEBUG] Preview TEST URL:', url.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    console.log('🔍 [DEBUG] Response status:', res.status);

    if (!res.ok) {
      let errorText = 'Erro desconhecido';
      try {
        const error = await res.json();
        errorText = error.message || error;
        console.error('🔍 [DEBUG] Error response:', error);
      } catch (parseError) {
        errorText = await res.text();
        console.error('🔍 [DEBUG] Error text:', errorText);
      }
      throw new Error(errorText);
    }

    const result = await res.json();
    console.log('🔍 [DEBUG] Success response:', result);
    return result.data;
  },

  // Teste ultra-simples sem middlewares
  async testSimple(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
  const endpoint = buildApiPath('/api/v1/import-export/import/preview-test');
    const url = new URL(endpoint, window.location.origin);
    console.log('🔍 [DEBUG] Simple TEST URL:', url.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    console.log('🔍 [DEBUG] Response status:', res.status);

    if (!res.ok) {
      let errorText = 'Erro desconhecido';
      try {
        const error = await res.json();
        errorText = error.message || error;
        console.error('🔍 [DEBUG] Error response:', error);
      } catch (parseError) {
        errorText = await res.text();
        console.error('🔍 [DEBUG] Error text:', errorText);
      }
      throw new Error(errorText);
    }

    const result = await res.json();
    console.log('🔍 [DEBUG] Success response:', result);
    return result.data;
  },

  // Teste básico da API
  async testAPI(): Promise<any> {
  const endpoint = buildApiPath('/api/v1/import-export/import/test');
    console.log('🔍 [DEBUG] API TEST URL:', endpoint);

    const res = await fetch(endpoint, {
      method: 'GET',
    });

    console.log('🔍 [DEBUG] Response status:', res.status);

    if (!res.ok) {
      let errorText = 'Erro desconhecido';
      try {
        const error = await res.json();
        errorText = error.message || error;
        console.error('🔍 [DEBUG] Error response:', error);
      } catch (parseError) {
        errorText = await res.text();
        console.error('🔍 [DEBUG] Error text:', errorText);
      }
      throw new Error(errorText);
    }

    const result = await res.json();
    console.log('🔍 [DEBUG] Success response:', result);
    return result;
  },
  // Teste com upload básico (sem validação)
  async testUpload(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
  const endpoint = buildApiPath('/api/v1/import-export/import/test-upload');
    const url = new URL(endpoint, window.location.origin);
    console.log('🔍 [DEBUG] UPLOAD TEST URL:', url.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    console.log('🔍 [DEBUG] Response status:', res.status);

    if (!res.ok) {
      let errorText = 'Erro desconhecido';
      try {
        const error = await res.json();
        errorText = error.message || error;
        console.error('🔍 [DEBUG] Error response:', error);
      } catch (parseError) {
        errorText = await res.text();
        console.error('🔍 [DEBUG] Error text:', errorText);
      }
      throw new Error(errorText);
    }

    const result = await res.json();
    console.log('🔍 [DEBUG] Success response:', result);
    return result.data;
  },
  // Teste específico para XLSX (sem parsing real)
  async testXlsx(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
  const endpoint = buildApiPath('/api/v1/import-export/import/test-xlsx');
    const url = new URL(endpoint, window.location.origin);
    console.log('🔍 [DEBUG] XLSX TEST URL:', url.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    console.log('🔍 [DEBUG] Response status:', res.status);

    if (!res.ok) {
      let errorText = 'Erro desconhecido';
      try {
        const error = await res.json();
        errorText = error.message || error;
        console.error('🔍 [DEBUG] Error response:', error);
      } catch (parseError) {
        errorText = await res.text();
        console.error('🔍 [DEBUG] Error text:', errorText);
      }
      throw new Error(errorText);
    }

    const result = await res.json();
    console.log('🔍 [DEBUG] Success response:', result);
    return result.data;
  },
  // Teste ultra-simples para XLSX (sem parsing real)
  async testXlsxSimple(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
  const endpoint = buildApiPath('/api/v1/import-export/import/test-xlsx-simple');
    const url = new URL(endpoint, window.location.origin);
    console.log('🔍 [DEBUG] XLSX SIMPLE TEST URL:', url.toString());

    const res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    console.log('🔍 [DEBUG] Response status:', res.status);

    if (!res.ok) {
      let errorText = 'Erro desconhecido';
      try {
        const error = await res.json();
        errorText = error.message || error;
        console.error('🔍 [DEBUG] Error response:', error);
      } catch (parseError) {
        errorText = await res.text();
        console.error('🔍 [DEBUG] Error text:', errorText);
      }
      throw new Error(errorText);
    }

    const result = await res.json();
    console.log('🔍 [DEBUG] Success response:', result);
    return result.data;
  },
  async importProducts(
    file: File,
    mapping: {[key: string]: string},
    options: {
      saveTemplate?: boolean;
      templateName?: string;
      templateDescription?: string;
      delimiter?: string;
    } = {}
  ): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    if (options.saveTemplate) {
      formData.append('saveTemplate', 'true');
    }
    if (options.templateName) {
      formData.append('templateName', options.templateName);
    }
    if (options.templateDescription) {
      formData.append('templateDescription', options.templateDescription);
    }
    if (options.delimiter) {
      formData.append('delimiter', options.delimiter);
    }

    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { ...AUTH_HEADER() },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao importar produtos');
    }

    const result = await res.json();
    return result.data;
  },

  // Gerenciamento de templates
  async getTemplates(): Promise<{data: ImportTemplate[]}> {
    const res = await fetch(`${API_URL}/templates`, {
      method: 'GET',
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao buscar templates');
    }

    return await res.json();
  },

  async createTemplate(template: Omit<ImportTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ImportTemplate> {
    const res = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER()
      },
      body: JSON.stringify(template),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao criar template');
    }

    const result = await res.json();
    return result.data;
  },

  async updateTemplate(id: string, template: Partial<ImportTemplate>): Promise<ImportTemplate> {
    const res = await fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER()
      },
      body: JSON.stringify(template),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao atualizar template');
    }

    const result = await res.json();
    return result.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao excluir template');
    }
  },

  // Campos disponíveis para mapeamento
  async getProductFields(): Promise<{data: ProductField[]}> {
    const res = await fetch(`${API_URL}/fields`, {
      method: 'GET',
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao buscar campos disponíveis');
    }

    return await res.json();
  },
};
