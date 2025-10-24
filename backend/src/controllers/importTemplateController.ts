import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import prisma from '../prisma/client.js';

// Campos do produto que podem ser mapeados
export const PRODUCT_FIELDS = [
  'name',
  'description',
  'price',
  'originalPrice',
  'costPrice',
  'sku',
  'category',
  'subcategory',
  'brand',
  'status',
  'weight',
  'length',
  'width',
  'height',
  'tags',
  'featured',
  'active',
  'image',
  'images',
  'model',
  'color',
  'size',
  'material',
  'stockLocation',
  'origin',
  'internalNotes'
];

export const importTemplateController = {
  // Listar templates do usuário
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const templates = await prisma.importTemplate.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { name: 'asc' }
        ]
      });

      res.json({ data: templates });
    } catch (err) {
      next(err);
    }
  },

  // Criar novo template
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { name, description, fileType, delimiter, mapping, isDefault } = req.body;

      // Validar campos obrigatórios
      if (!name || !fileType || !mapping) {
        throw new AppError('Nome, tipo de arquivo e mapeamento são obrigatórios', 400);
      }

      // Validar fileType
      if (!['csv', 'xlsx'].includes(fileType)) {
        throw new AppError('Tipo de arquivo deve ser csv ou xlsx', 400);
      }

      // Validar delimiter para CSV
      if (fileType === 'csv' && ![';', ',', '\t'].includes(delimiter)) {
        throw new AppError('Delimitador deve ser ; , , ou \\t para CSV', 400);
      }

      // Validar mapeamento
      const mappingObj = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
      if (typeof mappingObj !== 'object') {
        throw new AppError('Mapeamento deve ser um objeto', 400);
      }

      // Verificar se já existe template com mesmo nome
      const existingTemplate = await prisma.importTemplate.findFirst({
        where: { name, userId }
      });

      if (existingTemplate) {
        throw new AppError('Já existe um template com este nome', 400);
      }

      // Se for template padrão, desmarcar outros como padrão
      if (isDefault) {
        await prisma.importTemplate.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const template = await prisma.importTemplate.create({
        data: {
          name,
          description,
          fileType,
          delimiter,
          mapping: mappingObj,
          userId,
          isDefault: isDefault || false
        }
      });

      res.status(201).json({ data: template });
    } catch (err) {
      next(err);
    }
  },

  // Atualizar template
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;
      const { name, description, fileType, delimiter, mapping, isDefault } = req.body;

      // Verificar se template existe e pertence ao usuário
      const existingTemplate = await prisma.importTemplate.findFirst({
        where: { id, userId }
      });

      if (!existingTemplate) {
        throw new AppError('Template não encontrado', 404);
      }

      // Validar campos se fornecidos
      if (fileType && !['csv', 'xlsx'].includes(fileType)) {
        throw new AppError('Tipo de arquivo deve ser csv ou xlsx', 400);
      }

      if (fileType === 'csv' && delimiter && ![';', ',', '\t'].includes(delimiter)) {
        throw new AppError('Delimitador deve ser ; , , ou \\t para CSV', 400);
      }

      let updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (fileType !== undefined) updateData.fileType = fileType;
      if (delimiter !== undefined) updateData.delimiter = delimiter;
      if (mapping !== undefined) {
        const mappingObj = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
        updateData.mapping = mappingObj;
      }
      if (isDefault !== undefined) {
        updateData.isDefault = isDefault;
        // Se for template padrão, desmarcar outros como padrão
        if (isDefault) {
          await prisma.importTemplate.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
          });
        }
      }

      const template = await prisma.importTemplate.update({
        where: { id },
        data: updateData
      });

      res.json({ data: template });
    } catch (err) {
      next(err);
    }
  },

  // Excluir template
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;

      // Verificar se template existe e pertence ao usuário
      const template = await prisma.importTemplate.findFirst({
        where: { id, userId }
      });

      if (!template) {
        throw new AppError('Template não encontrado', 404);
      }

      await prisma.importTemplate.delete({
        where: { id }
      });

      res.json({ message: 'Template excluído com sucesso' });
    } catch (err) {
      next(err);
    }
  },

  // Obter template por ID
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const { id } = req.params;

      const template = await prisma.importTemplate.findFirst({
        where: { id, userId }
      });

      if (!template) {
        throw new AppError('Template não encontrado', 404);
      }

      res.json({ data: template });
    } catch (err) {
      next(err);
    }
  },

  // Obter campos disponíveis para mapeamento
  async getProductFields(_req: Request, res: Response) {
    res.json({
      data: PRODUCT_FIELDS,
      message: 'Campos disponíveis para mapeamento de produtos'
    });
  }
};
