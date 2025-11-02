import { Request, Response } from 'express';
import { activityService } from '../services/activityService';

export const activityController = {
  /**
   * Listar atividades do usuário
   */
  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { type, action, status, entityType, limit, offset, startDate, endDate } = req.query;

      const filters: any = {};
      if (type) filters.type = type as string;
      if (action) filters.action = action as string;
      if (status) filters.status = status as string;
      if (entityType) filters.entityType = entityType as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const activities = await activityService.list(userId, filters);

      res.json(activities);
    } catch (error) {
      console.error('Erro ao listar atividades:', error);
      res.status(500).json({ error: 'Erro ao listar atividades' });
    }
  },

  /**
   * Obter uma atividade específica
   */
  async get(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { id } = req.params;
      const activity = await activityService.get(id, userId);

      if (!activity) {
        return res.status(404).json({ error: 'Atividade não encontrada' });
      }

      res.json(activity);
    } catch (error) {
      console.error('Erro ao obter atividade:', error);
      res.status(500).json({ error: 'Erro ao obter atividade' });
    }
  },

  /**
   * Obter estatísticas de atividades
   */
  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { days } = req.query;
      const daysNumber = days ? parseInt(days as string) : 30;

      const stats = await activityService.getStats(userId, daysNumber);

      res.json(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas de atividades:', error);
      res.status(500).json({ error: 'Erro ao obter estatísticas de atividades' });
    }
  },

  /**
   * Deletar uma atividade
   */
  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { id } = req.params;
      await activityService.delete(id, userId);

      res.json({ message: 'Atividade deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      res.status(500).json({ error: 'Erro ao deletar atividade' });
    }
  },

  /**
   * Deletar atividades antigas
   */
  async deleteOld(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { days } = req.query;
      const daysNumber = days ? parseInt(days as string) : 90;

      await activityService.deleteOld(userId, daysNumber);

      res.json({ message: `Atividades com mais de ${daysNumber} dias foram deletadas` });
    } catch (error) {
      console.error('Erro ao deletar atividades antigas:', error);
      res.status(500).json({ error: 'Erro ao deletar atividades antigas' });
    }
  },
};
