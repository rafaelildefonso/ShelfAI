import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { AppError } from '../utils/appError.js';
import { FileParser } from '../services/fileParser.js';
import { PRODUCT_FIELDS } from './importTemplateController.js';
import prisma from '../prisma/client.js';

interface ImportPreview {
  headers: string[];
  preview: Array<{[key: string]: any}>;
  totalRows: number;
  validationErrors: Array<{row: number, errors: string[]}>;
  suggestedMapping: {[key: string]: string};
}

interface ImportResult {
  imported: number;
  errors: Array<{row: number, error: string}>;
  total: number;
}

export const importController = {
  // Preview do arquivo antes da importação
  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      const { templateId, delimiter = ',' } = req.query;

      if (!file) {
        throw new AppError('Arquivo não enviado', 400);
      }

      const filePath = file.path;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      const fileType = fileExtension === 'csv' ? 'csv' : 'xlsx';

      // Parse do arquivo
      const parseResult = await FileParser.parseFile(filePath, fileType, delimiter as string);

      // Limitar preview para primeiras 10 linhas (exceto headers)
      const previewData = parseResult.data.slice(0, 10);

      // Validar dados obrigatórios
      const validation = FileParser.validateData(parseResult.data, ['name', 'sku']);

      // Gerar mapeamento sugerido
      const suggestedMapping: {[key: string]: string} = {};
      const productFields = PRODUCT_FIELDS;

      // Mapeamento automático baseado em nomes similares
      parseResult.headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        const fieldMatch = productFields.find(field => {
          const lowerField = field.toLowerCase();
          return lowerHeader.includes(lowerField) || lowerField.includes(lowerHeader);
        });

        if (fieldMatch) {
          suggestedMapping[fieldMatch] = header;
        }
      });

      // Se template foi fornecido, usar seu mapeamento
      let mapping = suggestedMapping;
      if (templateId) {
        const template = await prisma.importTemplate.findUnique({
          where: { id: templateId as string }
        });

        if (template) {
          mapping = template.mapping as {[key: string]: string};
        }
      }

      const preview: ImportPreview = {
        headers: parseResult.headers,
        preview: previewData,
        totalRows: parseResult.totalRows,
        validationErrors: validation.errors,
        suggestedMapping: mapping
      };

      // Limpar arquivo após processamento
      fs.unlinkSync(filePath);

      res.json({
        data: preview,
        message: 'Preview gerado com sucesso'
      });

    } catch (err) {
      // Limpar arquivo em caso de erro
      const file = (req as any).file;
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Erro ao limpar arquivo:', cleanupError);
        }
      }
      next(err);
    }
  },

  // Importar produtos usando mapeamento
  async importProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      const { mapping, saveTemplate, templateName, templateDescription, delimiter = ',' } = req.body;
      const userId = req.user?.userId;

      if (!file) {
        throw new AppError('Arquivo não enviado', 400);
      }

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (!mapping) {
        throw new AppError('Mapeamento de colunas é obrigatório', 400);
      }

      const filePath = file.path;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      const fileType = fileExtension === 'csv' ? 'csv' : 'xlsx';

      // Parse do arquivo
      const parseResult = await FileParser.parseFile(filePath, fileType, delimiter as string);

      if (parseResult.totalRows === 0) {
        throw new AppError('Arquivo vazio ou sem dados válidos', 400);
      }

      // Validar mapeamento
      const mappingObj = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
      const validation = FileParser.validateData(parseResult.data, ['name', 'sku']);

      // Transformar dados usando mapeamento
      const transformedData = FileParser.transformData(validation.validRows, mappingObj);

      // Importar produtos
      const importResult: ImportResult = {
        imported: 0,
        errors: [],
        total: parseResult.totalRows
      };

      for (let i = 0; i < transformedData.length; i++) {
        try {
          const rowData = transformedData[i];

          // Garantir que campos obrigatórios existam
          if (!rowData.name || !rowData.sku) {
            importResult.errors.push({
              row: i + 1,
              error: 'Nome ou SKU ausente após mapeamento'
            });
            continue;
          }

          // Preparar dados para criação do produto
          const productData: any = {
            name: String(rowData.name).trim(),
            sku: String(rowData.sku).trim(),
            status: rowData.status || 'incomplete',
            userId,
            featured: Boolean(rowData.featured),
            active: rowData.active !== false && rowData.active !== 'false',
            createdById: userId,
            lastEditedById: userId,
          };

          // Adicionar campos opcionais
          if (rowData.description) {
            productData.description = String(rowData.description).trim();
          }

          if (rowData.price !== undefined && rowData.price !== null) {
            productData.price = parseFloat(String(rowData.price));
          }

          if (rowData.originalPrice !== undefined && rowData.originalPrice !== null) {
            productData.originalPrice = parseFloat(String(rowData.originalPrice));
          }

          if (rowData.costPrice !== undefined && rowData.costPrice !== null) {
            productData.costPrice = parseFloat(String(rowData.costPrice));
          }

          if (rowData.category) {
            const categoryName = String(rowData.category).trim();
            if (categoryName) {
              let category = await prisma.category.findFirst({
                where: { name: categoryName, userId }
              });

              if (!category) {
                category = await prisma.category.create({
                  data: {
                    name: categoryName,
                    description: `Categoria ${categoryName}`,
                    userId
                  }
                });
              }

              productData.categoryId = category.id;
            }
          }

          // Campos adicionais
          if (rowData.brand) productData.brand = String(rowData.brand).trim();
          if (rowData.subcategory) productData.subcategory = String(rowData.subcategory).trim();
          if (rowData.weight) productData.weight = parseFloat(String(rowData.weight));
          if (rowData.length) productData.length = parseFloat(String(rowData.length));
          if (rowData.width) productData.width = parseFloat(String(rowData.width));
          if (rowData.height) productData.height = parseFloat(String(rowData.height));
          if (rowData.tags && Array.isArray(rowData.tags)) productData.tags = rowData.tags;
          if (rowData.image) productData.image = String(rowData.image).trim();
          if (rowData.images && Array.isArray(rowData.images)) productData.images = rowData.images;
          if (rowData.model) productData.model = String(rowData.model).trim();
          if (rowData.color) productData.color = String(rowData.color).trim();
          if (rowData.size) productData.size = String(rowData.size).trim();
          if (rowData.material) productData.material = String(rowData.material).trim();
          if (rowData.stockLocation) productData.stockLocation = String(rowData.stockLocation).trim();
          if (rowData.origin) productData.origin = String(rowData.origin).trim();
          if (rowData.internalNotes) productData.internalNotes = String(rowData.internalNotes).trim();

          await prisma.product.create({
            data: productData
          });

          importResult.imported++;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          importResult.errors.push({
            row: i + 1,
            error: errorMessage
          });
        }
      }

      // Salvar template se solicitado
      if (saveTemplate && templateName) {
        try {
          await prisma.importTemplate.create({
            data: {
              name: templateName,
              description: templateDescription,
              fileType,
              delimiter: fileType === 'csv' ? delimiter : undefined,
              mapping: mappingObj,
              userId
            }
          });
        } catch (templateError) {
          console.error('Erro ao salvar template:', templateError);
          // Não falha a importação por causa do template
        }
      }

      // Limpar arquivo após processamento
      fs.unlinkSync(filePath);

      res.json({
        data: importResult,
        message: `Importação concluída: ${importResult.imported} produtos importados de ${importResult.total} linhas processadas.`
      });

    } catch (err) {
      // Limpar arquivo em caso de erro
      const file = (req as any).file;
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Erro ao limpar arquivo:', cleanupError);
        }
      }
      next(err);
    }
  },

  // Listar templates do usuário
  async getTemplates(req: Request, res: Response, next: NextFunction) {
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

  // Obter campos disponíveis para mapeamento
  async getProductFields(_req: Request, res: Response) {
    res.json({
      data: PRODUCT_FIELDS,
      message: 'Campos disponíveis para mapeamento de produtos'
    });
  }
};
