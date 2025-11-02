import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  /**
   * Listar notificações do usuário
   */
  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { read, type, limit, offset } = req.query;

      const filters: any = {};
      if (read !== undefined) {
        filters.read = read === 'true';
      }
      if (type) {
        filters.type = type as string;
      }
      if (limit) {
        filters.limit = parseInt(limit as string);
      }
      if (offset) {
        filters.offset = parseInt(offset as string);
      }

      const notifications = await notificationService.list(userId, filters);
      const unreadCount = await notificationService.countUnread(userId);

      res.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      res.status(500).json({ error: 'Erro ao listar notificações' });
    }
  },

  /**
   * Obter uma notificação específica
   */
  async get(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { id } = req.params;
      const notification = await notificationService.get(id, userId);

      if (!notification) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Erro ao obter notificação:', error);
      res.status(500).json({ error: 'Erro ao obter notificação' });
    }
  },

  /**
   * Marcar notificação como lida
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { id } = req.params;
      await notificationService.markAsRead(id, userId);

      res.json({ message: 'Notificação marcada como lida' });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
    }
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      await notificationService.markAllAsRead(userId);

      res.json({ message: 'Todas as notificações foram marcadas como lidas' });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      res.status(500).json({ error: 'Erro ao marcar todas as notificações como lidas' });
    }
  },

  /**
   * Deletar uma notificação
   */
  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { id } = req.params;
      await notificationService.delete(id, userId);

      res.json({ message: 'Notificação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro ao deletar notificação' });
    }
  },

  /**
   * Deletar todas as notificações lidas
   */
  async deleteAllRead(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      await notificationService.deleteAllRead(userId);

      res.json({ message: 'Todas as notificações lidas foram deletadas' });
    } catch (error) {
      console.error('Erro ao deletar notificações lidas:', error);
      res.status(500).json({ error: 'Erro ao deletar notificações lidas' });
    }
  },

  /**
   * Contar notificações não lidas
   */
  async countUnread(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const count = await notificationService.countUnread(userId);

      res.json({ count });
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      res.status(500).json({ error: 'Erro ao contar notificações não lidas' });
    }
  },
};
