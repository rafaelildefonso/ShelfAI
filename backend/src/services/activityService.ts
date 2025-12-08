import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateActivityData {
  userId: string;
  type: "import" | "export" | "product" | "category" | "user" | "system";
  action:
    | "create"
    | "update"
    | "delete"
    | "import"
    | "export"
    | "login"
    | "register"
    | "logout"
    | "password_update"
    | "profile_update";
  title: string;
  description: string;
  status?: "success" | "warning" | "error" | "info";
  entityType?: string;
  entityId?: string;
  metadata?: any;
}

export interface ActivityFilters {
  type?: string;
  action?: string;
  status?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export const activityService = {
  /**
   * Criar uma nova atividade
   */
  async create(data: CreateActivityData) {
    return await prisma.activity.create({
      data: {
        userId: data.userId,
        type: data.type,
        action: data.action,
        title: data.title,
        description: data.description,
        status: data.status || "info",
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  },

  /**
   * Criar múltiplas atividades
   */
  async createMany(activities: CreateActivityData[]) {
    return await prisma.activity.createMany({
      data: activities.map((activity) => ({
        userId: activity.userId,
        type: activity.type,
        action: activity.action,
        title: activity.title,
        description: activity.description,
        status: activity.status || "info",
        entityType: activity.entityType,
        entityId: activity.entityId,
        metadata: activity.metadata,
      })),
    });
  },

  /**
   * Listar atividades de um usuário
   */
  async list(userId: string, filters: ActivityFilters = {}) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return await prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });
  },

  /**
   * Obter uma atividade específica
   */
  async get(id: string, userId: string) {
    return await prisma.activity.findFirst({
      where: { id, userId },
    });
  },

  /**
   * Deletar uma atividade
   */
  async delete(id: string, userId: string) {
    return await prisma.activity.deleteMany({
      where: { id, userId },
    });
  },

  /**
   * Deletar atividades antigas (mais de 90 dias)
   */
  async deleteOld(userId: string, daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await prisma.activity.deleteMany({
      where: {
        userId,
        createdAt: { lt: cutoffDate },
      },
    });
  },

  /**
   * Obter estatísticas de atividades
   */
  async getStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const stats = {
      total: activities.length,
      byType: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      recent: activities.slice(0, 10),
    };

    activities.forEach((activity) => {
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;

      // Count by action
      stats.byAction[activity.action] =
        (stats.byAction[activity.action] || 0) + 1;

      // Count by status
      stats.byStatus[activity.status] =
        (stats.byStatus[activity.status] || 0) + 1;
    });

    return stats;
  },

  /**
   * Registrar atividade de produto
   */
  async logProductActivity(
    userId: string,
    action: "create" | "update" | "delete",
    productId: string,
    productName: string,
    details?: string
  ) {
    const titles = {
      create: "Produto Criado",
      update: "Produto Atualizado",
      delete: "Produto Deletado",
    };

    const descriptions = {
      create: `Produto "${productName}" foi criado com sucesso`,
      update: details || `Produto "${productName}" foi atualizado`,
      delete: `Produto "${productName}" foi deletado`,
    };

    return await this.create({
      userId,
      type: "product",
      action,
      title: titles[action],
      description: descriptions[action],
      status: "success",
      entityType: "Product",
      entityId: productId,
    });
  },

  /**
   * Registrar atividade de categoria
   */
  async logCategoryActivity(
    userId: string,
    action: "create" | "update" | "delete",
    categoryId: string,
    categoryName: string,
    details?: string
  ) {
    const titles = {
      create: "Categoria Criada",
      update: "Categoria Atualizada",
      delete: "Categoria Deletada",
    };

    const descriptions = {
      create: `Categoria "${categoryName}" foi criada com sucesso`,
      update: details || `Categoria "${categoryName}" foi atualizada`,
      delete: `Categoria "${categoryName}" foi deletada`,
    };

    return await this.create({
      userId,
      type: "category",
      action,
      title: titles[action],
      description: descriptions[action],
      status: "success",
      entityType: "Category",
      entityId: categoryId,
    });
  },

  /**
   * Registrar atividade de importação
   */
  async logImportActivity(
    userId: string,
    fileName: string,
    productsCount: number,
    status: "success" | "warning" | "error" = "success"
  ) {
    return await this.create({
      userId,
      type: "import",
      action: "import",
      title: "Importação Concluída",
      description: `${productsCount} produtos importados do arquivo ${fileName}`,
      status,
      metadata: { fileName, productsCount },
    });
  },

  /**
   * Registrar atividade de exportação
   */
  async logExportActivity(
    userId: string,
    marketplace: string,
    productsCount: number,
    status: "success" | "warning" | "error" = "success"
  ) {
    return await this.create({
      userId,
      type: "export",
      action: "export",
      title: `Exportação para ${marketplace}`,
      description: `${productsCount} produtos exportados com sucesso`,
      status,
      metadata: { marketplace, productsCount },
    });
  },
  /**
   * Registrar atividade de autenticação
   */
  async logAuthActivity(
    userId: string,
    action:
      | "login"
      | "register"
      | "logout"
      | "password_update"
      | "profile_update",
    status: "success" | "warning" | "error" = "success",
    details?: string
  ) {
    const titles = {
      login: "Login Realizado",
      register: "Novo Usuário Registrado",
      logout: "Logout Realizado",
      password_update: "Senha Atualizada",
      profile_update: "Perfil Atualizado",
    };

    const descriptions = {
      login: details || "Usuário realizou login com sucesso",
      register: "Novo usuário registrado no sistema",
      logout: "Usuário realizou logout",
      password_update: "Usuário atualizou sua senha",
      profile_update: "Usuário atualizou seu perfil",
    };

    return await this.create({
      userId,
      type: "user",
      action,
      title: titles[action],
      description: descriptions[action],
      status,
      entityType: "User",
      entityId: userId,
    });
  },
};
