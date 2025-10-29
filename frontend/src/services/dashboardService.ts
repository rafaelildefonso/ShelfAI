// Serviço para estatísticas do dashboard
import { buildApiPath } from "../config/api";
const API_URL = buildApiPath('/api/v1');

export interface DashboardStats {
  totalProducts: number;
  completeProducts: number;
  incompleteProducts: number;
  totalCategories: number;
  recentImports: number;
  recentExports: number;
  lowStockProducts: number;
  pendingReviews: number;
  importExportTrend: {
    imports: number[];
    exports: number[];
  };
  categoryDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const dashboardService = {
  // Obter estatísticas gerais do dashboard
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar estatísticas do dashboard');
    }

    return await response.json();
  },

  // Obter atividades recentes
  async getRecentActivities(): Promise<Array<{
    id: string;
    type: 'import' | 'export' | 'product' | 'category';
    title: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
  }>> {
    const response = await fetch(`${API_URL}/dashboard/activities`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar atividades recentes');
    }

    return await response.json();
  }
};
