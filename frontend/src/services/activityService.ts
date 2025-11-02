// Serviço para atividades
import { buildApiPath } from "../config/api";
const API_URL = buildApiPath('/api/v1');

export interface Activity {
  id: string;
  userId: string;
  type: 'import' | 'export' | 'product' | 'category' | 'user' | 'system';
  action: 'create' | 'update' | 'delete' | 'import' | 'export';
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  entityType?: string;
  entityId?: string;
  metadata?: any;
  createdAt: string;
}

export interface ActivityFilters {
  type?: string;
  action?: string;
  status?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface ActivityStats {
  total: number;
  byType: Record<string, number>;
  byAction: Record<string, number>;
  byStatus: Record<string, number>;
  recent: Activity[];
}

export const activityService = {
  // Obter atividades do usuário
  async getActivities(filters?: ActivityFilters): Promise<Activity[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar atividades');
    }

    return await response.json();
  },

  // Obter estatísticas de atividades
  async getStats(days: number = 30): Promise<ActivityStats> {
    const response = await fetch(`${API_URL}/activities/stats?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar estatísticas de atividades');
    }

    return await response.json();
  },

  // Obter uma atividade específica
  async getActivity(id: string): Promise<Activity> {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar atividade');
    }

    return await response.json();
  },

  // Deletar uma atividade
  async deleteActivity(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar atividade');
    }
  },

  // Deletar atividades antigas
  async deleteOldActivities(days: number = 90): Promise<void> {
    const response = await fetch(`${API_URL}/activities/old?days=${days}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar atividades antigas');
    }
  },

  // Formatar tempo relativo (ex: "2 min atrás")
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'agora';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }
};
