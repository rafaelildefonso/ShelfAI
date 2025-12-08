import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { activityService } from "../services/activityService.js";
import { notificationService } from "../services/notificationService.js";

const prisma = new PrismaClient();

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 20, search, categoryId, status } = req.query;
      const where: any = {};

      // 🔒 FILTRO DE SEGURANÇA: Usuários só podem ver seus próprios produtos
      if (req.user?.userId) {
        where.userId = req.user.userId;
      } else {
        // Se não há usuário autenticado, retorna lista vazia
        return res.json({ data: [], total: 0 });
      }

      if (search) {
        const searchStr = String(search);
        where.OR = [
          { name: { contains: searchStr, mode: "insensitive" } },
          { description: { contains: searchStr, mode: "insensitive" } },
        ];
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }
      if (status) {
        where.status = status;
      }

      const products = await prisma.product.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: "desc" },
        include: {
          user: true, // Inclui dados do usuário
          category: true, // Inclui dados da categoria
        },
      });
      const total = await prisma.product.count({ where });
      res.json({ data: products, total });
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Obter o ID do produto dos parâmetros da URL
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          user: true, // Inclui dados do usuário
          category: true, // Inclui dados da categoria
          createdBy: {
            // Inclui informações do usuário que criou o produto
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lastEditedBy: {
            // Inclui informações do último usuário que editou o produto
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!product)
        return res
          .status(404)
          .json({ error: { message: "Produto não encontrado" } });

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode ver produtos que ele mesmo criou
      if (req.user?.userId && product.userId !== req.user.userId) {
        return res
          .status(403)
          .json({
            error: {
              message:
                "Acesso negado. Você só pode ver seus próprios produtos.",
            },
          });
      }

      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Usar userId do token JWT se disponível, caso contrário deixar sem userId
      if (req.user?.userId) {
        data.userId = req.user.userId;
        data.createdById = req.user.userId;
        data.lastEditedById = req.user.userId;
      } else {
        console.warn("Nenhum usuário autenticado encontrado no token!");
      }
      // Não definir userId se não há usuário autenticado
      delete (data as any).user;
      delete (data as any).createdBy;
      delete (data as any).lastEditedBy;

      // Se foi enviado categoryName ao invés de categoryId, criar ou encontrar a categoria
      if (data.categoryName && !data.categoryId) {
        let category = await (prisma as any).category.findUnique({
          where: { name: data.categoryName },
        });

        if (!category) {
          category = await (prisma as any).category.create({
            data: {
              name: data.categoryName,
              description: `Categoria ${data.categoryName}`,
            },
          });
        }

        data.categoryId = category.id;
        delete data.categoryName;
      }

      // 🧠 Função auxiliar para validar usuários
      const validateUserId = async (key: string) => {
        if (data[key]) {
          const userExists = await prisma.user.findUnique({
            where: { id: data[key] },
          });
          if (!userExists) {
            throw new Error(`Usuário com ID ${data[key]} não existe`);
          }
        }
      };

      // 🔍 Validar IDs relacionados a usuários
      await validateUserId("userId");

      // Verificar se a categoria existe, se não existir, criar
      if (data.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!categoryExists) {
          // Se for uma categoria padrão (não UUID), criar uma nova categoria
          if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              data.categoryId
            )
          ) {
            // Verificar se já existe uma categoria com o mesmo nome
            const existingCategory = await prisma.category.findFirst({
              where: {
                name: data.categoryId,
                userId: data.userId || null,
              },
            });

            if (existingCategory) {
              // Usar a categoria existente
              data.categoryId = existingCategory.id;
            } else {
              // Criar nova categoria
              const newCategory = await prisma.category.create({
                data: {
                  name: data.categoryId,
                  userId: data.userId || "", // Ensure userId is not null
                  isDefault: true,
                },
              });
              data.categoryId = newCategory.id;
            }
          } else {
            throw new Error(
              `Categoria com ID ${data.categoryId} não encontrada`
            );
          }
        }
      }

      const product = await prisma.product.create({ data });

      // Registrar atividade e notificação
      if (req.user?.userId) {
        await Promise.all([
          activityService.logProductActivity(
            req.user.userId,
            "create",
            product.id,
            product.name
          ),
          notificationService.create({
            userId: req.user.userId,
            title: "Produto Criado",
            message: `Produto "${product.name}" foi criado com sucesso`,
            type: "success",
            link: `/products/${product.id}`,
            metadata: { productId: product.id },
          }),
        ]);
      }

      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      // 🔒 Primeiro, verificar se o produto existe e pertence ao usuário
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return res
          .status(404)
          .json({ error: { message: "Produto não encontrado" } });
      }

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode editar produtos que ele mesmo criou
      if (req.user?.userId && existingProduct.userId !== req.user.userId) {
        return res
          .status(403)
          .json({
            error: {
              message:
                "Acesso negado. Você só pode editar seus próprios produtos.",
            },
          });
      }

      // Extrair categoryId e limpar campos que não devem ser atualizados diretamente
      const { categoryId, userId, ...updateData } = data;

      // Preparar os dados de atualização
      const updatePayload: any = { ...updateData };

      // Se houver um usuário autenticado, definir o lastEditedBy
      if (req.user?.userId) {
        updatePayload.lastEditedBy = {
          connect: { id: req.user.userId },
        };
      }

      // Se categoryId foi fornecido, atualizar a relação de categoria
      if (categoryId) {
        updatePayload.category = {
          connect: { id: categoryId },
        };
      } else if (categoryId === null) {
        // Se categoryId for explicitamente null, remover a categoria
        updatePayload.category = {
          disconnect: true,
        };
      }

      // Remover o campo categoryName se existir (usado apenas para exibição no frontend)
      if ("categoryName" in updatePayload) {
        delete updatePayload.categoryName;
      }

      // Atualizar o produto
      const product = await prisma.product.update({
        where: { id },
        data: updatePayload,
        include: {
          category: true,
        },
      });

      // Registrar atividade
      if (req.user?.userId) {
        await activityService.logProductActivity(
          req.user.userId,
          "update",
          product.id,
          product.name,
          "Produto atualizado com sucesso"
        );
      }

      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 🔒 Primeiro, verificar se o produto existe e pertence ao usuário
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return res
          .status(404)
          .json({ error: { message: "Produto não encontrado" } });
      }

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode excluir produtos que ele mesmo criou
      if (req.user?.userId && existingProduct.userId !== req.user.userId) {
        return res
          .status(403)
          .json({
            error: {
              message:
                "Acesso negado. Você só pode excluir seus próprios produtos.",
            },
          });
      }

      const productName = existingProduct.name;
      await prisma.product.delete({ where: { id } });

      // Registrar atividade
      if (req.user?.userId) {
        await activityService.logProductActivity(
          req.user.userId,
          "delete",
          id,
          productName
        );
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
