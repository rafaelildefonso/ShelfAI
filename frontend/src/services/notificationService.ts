// Serviço para notificações
import { buildApiPath } from "../config/api";
const API_URL = buildApiPath('/api/v1');

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  // Obter notificações do usuário
  async getNotifications(filters?: NotificationFilters): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar notificações');
    }

    return await response.json();
  },

  // Obter uma notificação específica
  async getNotification(id: string): Promise<Notification> {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar notificação');
    }

    return await response.json();
  },

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar notificação como lida');
    }
  },

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao marcar todas as notificações como lidas');
    }
  },

  // Deletar uma notificação
  async deleteNotification(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar notificação');
    }
  },

  // Deletar todas as notificações lidas
  async deleteAllRead(): Promise<void> {
    const response = await fetch(`${API_URL}/notifications/read`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar notificações lidas');
    }
  },

  // Contar notificações não lidas
  async countUnread(): Promise<number> {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao contar notificações não lidas');
    }

    const data = await response.json();
    return data.count;
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
