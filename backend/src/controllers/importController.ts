import { Request, Response, NextFunction } from 'express';
import csv from 'csv-parser';
import fs from 'fs';
import prisma from '../prisma/client';

export const importController = {
  async importProducts(req: Request, res: Response, next: NextFunction) {
    try {
      // Verificar se o arquivo foi enviado via multer
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({ error: { message: 'Arquivo não enviado.' } });
      }

      const filePath = file.path;
      const results: any[] = [];

      // Processar CSV de forma mais segura
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      let importedCount = 0;

      // Processar cada linha do CSV
      for (const row of results) {
        try {
          // Garantir que campos obrigatórios existam e sejam válidos
          if (!row.name || !row.sku) {
            console.warn(`Pulando linha inválida - nome ou SKU ausente: ${JSON.stringify(row)}`);
            continue;
          }

          // Validar e limpar dados
          const name = String(row.name).trim();
          const sku = String(row.sku).trim();

          if (!name || !sku) {
            console.warn(`Pulando linha inválida - nome ou SKU vazio: ${JSON.stringify(row)}`);
            continue;
          }

          // Get the authenticated user ID from the request
          const userId = (req as any).user?.userId;

          if (!userId) {
            throw new Error('User not authenticated');
          }

          // Preparar dados para criação do produto
          const productData: any = {
            name,
            sku,
            status: row.status || 'complete',
            userId,
            featured: row.featured ? Boolean(row.featured) : false,
            active: row.active !== 'false' && row.active !== '0',
          };

          // Adicionar campos opcionais se existirem
          if (row.description) {
            productData.description = String(row.description).trim();
          }

          if (row.price !== undefined && row.price !== '') {
            const price = parseFloat(String(row.price));
            if (!isNaN(price)) {
              productData.price = price;
            }
          }

          if (row.category) {
            const categoryName = String(row.category).trim();
            if (categoryName) {
              // Tentar encontrar categoria existente ou criar nova
              let category = await (prisma as any).category.findUnique({
                where: { name: categoryName }
              });

              if (!category) {
                category = await (prisma as any).category.create({
                  data: {
                    name: categoryName,
                    description: `Categoria ${categoryName}`
                  }
                });
              }

              productData.categoryId = category.id;
            }
          }

          await prisma.product.create({
            data: productData
          });

          importedCount++;
        } catch (error) {
          console.error(`Erro ao importar produto ${row.name}:`, error);
          // Continua com o próximo produto mesmo se um falhar
        }
      }

      // Limpar arquivo após processamento
      fs.unlinkSync(filePath);

      res.json({
        imported: importedCount,
        total: results.length,
        message: `Importação concluída: ${importedCount} produtos importados de ${results.length} linhas processadas.`
      });

    } catch (err) {
      // Garantir limpeza do arquivo mesmo em caso de erro
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
};
