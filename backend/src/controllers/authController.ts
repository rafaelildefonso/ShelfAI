import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  authenticateUser,
  updatePassword,
  updateProfile,
  getUserProfile,
  getAllUsers,
  deactivateUser,
  activateUser,
  verifyToken,
  // generateToken,
  generateTokenPair,
  refreshAccessToken,
} from "../services/authService.js";

export const authController = {
  // Registro de usuário
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await registerUser(req.body);
      const { accessToken, refreshToken } = generateTokenPair(user);

      res.status(201).json({
        message: "Usuário registrado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company,
          department: user.department,
          position: user.position,
          location: user.location,
        },
        token: accessToken,
        refreshToken,
      });
    } catch (error: any) {
      next(error);
    }
  },

  // Login de usuário
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = await authenticateUser(req.body);
      const { accessToken, refreshToken } = generateTokenPair(user);

      res.json({
        message: "Login realizado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company,
          department: user.department,
          position: user.position,
          location: user.location,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
        },
        token: accessToken,
        refreshToken,
      });
    } catch (error: any) {
      next(error);
    }
  },

  // Obter perfil do usuário autenticado
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Token não fornecido", status: 401 } });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      const user = await getUserProfile(decoded.userId);

      if (!user) {
        return res
          .status(404)
          .json({ error: { message: "Usuário não encontrado", status: 404 } });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company,
          department: user.department,
          position: user.position,
          location: user.location,
          avatar: user.avatar,
          timezone: user.timezone,
          language: user.language,
          preferences: user.preferences,
          settings: user.settings,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          products: user.products,
          _count: user._count,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },

  // Atualizar senha
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Token não fornecido", status: 401 } });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      await updatePassword(decoded.userId, req.body);

      res.json({ message: "Senha atualizada com sucesso" });
    } catch (error: any) {
      next(error);
    }
  },

  // Atualizar perfil
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Token não fornecido", status: 401 } });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      const updatedUser = await updateProfile(decoded.userId, req.body);

      res.json({
        message: "Perfil atualizado com sucesso",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          company: updatedUser.company,
          department: updatedUser.department,
          position: updatedUser.position,
          location: updatedUser.location,
          avatar: updatedUser.avatar,
          timezone: updatedUser.timezone,
          language: updatedUser.language,
          preferences: updatedUser.preferences,
          settings: updatedUser.settings,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },

  // Listar usuários (apenas admin)
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Token não fornecido", status: 401 } });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      // Verificar se é admin
      if (decoded.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: { message: "Acesso negado", status: 403 } });
      }

      const { page = 1, pageSize = 10, search } = req.query;

      const result = await getAllUsers(
        parseInt(page as string),
        parseInt(pageSize as string),
        search as string
      );

      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },

  // Desativar usuário (apenas admin)
  async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Token não fornecido", status: 401 } });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      // Verificar se é admin
      if (decoded.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: { message: "Acesso negado", status: 403 } });
      }

      const { id } = req.params;
      const user = await deactivateUser(id);

      res.json({
        message: "Usuário desativado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },

  // Ativar usuário (apenas admin)
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: { message: "Token não fornecido", status: 401 } });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      // Verificar se é admin
      if (decoded.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: { message: "Acesso negado", status: 403 } });
      }

      const { id } = req.params;
      const user = await activateUser(id);

      res.json({
        message: "Usuário ativado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error: any) {
      next(error);
    }
  },

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res
          .status(400)
          .json({ error: { message: "Refresh token não fornecido", status: 400 } });
      }

      const tokens = await refreshAccessToken(refreshToken);

      res.json({
        message: "Token atualizado com sucesso",
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      next(error);
    }
  },
};
