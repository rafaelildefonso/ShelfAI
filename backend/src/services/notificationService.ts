import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  metadata?: any;
}

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export const notificationService = {
  /**
   * Criar uma nova notificação
   */
  async create(data: CreateNotificationData) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        link: data.link,
        metadata: data.metadata,
      },
    });
  },

  /**
   * Criar múltiplas notificações
   */
  async createMany(notifications: CreateNotificationData[]) {
    return await prisma.notification.createMany({
      data: notifications.map(notif => ({
        userId: notif.userId,
        title: notif.title,
        message: notif.message,
        type: notif.type || 'info',
        link: notif.link,
        metadata: notif.metadata,
      })),
    });
  },

  /**
   * Listar notificações de um usuário
   */
  async list(userId: string, filters: NotificationFilters = {}) {
    const where: any = { userId };

    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });
  },

  /**
   * Obter uma notificação específica
   */
  async get(id: string, userId: string) {
    return await prisma.notification.findFirst({
      where: { id, userId },
    });
  },

  /**
   * Marcar notificação como lida
   */
  async markAsRead(id: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  /**
   * Deletar uma notificação
   */
  async delete(id: string, userId: string) {
    return await prisma.notification.deleteMany({
      where: { id, userId },
    });
  },

  /**
   * Deletar todas as notificações lidas de um usuário
   */
  async deleteAllRead(userId: string) {
    return await prisma.notification.deleteMany({
      where: { userId, read: true },
    });
  },

  /**
   * Contar notificações não lidas
   */
  async countUnread(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  },

  /**
   * Deletar notificações antigas (mais de 30 dias)
   */
  async deleteOld(userId: string, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await prisma.notification.deleteMany({
      where: {
        userId,
        read: true,
        createdAt: { lt: cutoffDate },
      },
    });
  },
};
