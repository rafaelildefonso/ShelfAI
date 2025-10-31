import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/env.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tipo User baseado no modelo Prisma
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string | null;
  company?: string | null;
  department?: string | null;
  position?: string | null;
  location?: string | null;
  timezone?: string | null;
  language?: string | null;
  isActive: boolean;
  loginCount: number;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  preferences?: any;
  settings?: any;
  avatar?: string | null;
  products?: any[];
  _count?: any;
}

// Validação de dados
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateRegisterData = (userData: RegisterData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!validateEmail(userData.email)) {
    errors.push('Email inválido');
  }

  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  if (userData.phone && userData.phone.length < 10) {
    errors.push('Telefone deve ter pelo menos 10 dígitos');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  department?: string;
  position?: string;
  location?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  company?: string;
  department?: string;
  position?: string;
  location?: string;
  timezone?: string;
  language?: string;
  preferences?: any;
  settings?: any;
}

export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  } as const;

  const expiresIn = config.JWT_EXPIRES_IN || '1d';

  return jwt.sign(
    payload as object,
    config.JWT_SECRET,
    { expiresIn } as SignOptions
  );
};

export const generateRefreshToken = (user: User): string => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  } as const;

  const expiresIn = config.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(
    payload as object,
    config.JWT_SECRET,
    { expiresIn } as SignOptions
  );
};

export const generateTokenPair = (user: User): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const registerUser = async (userData: RegisterData): Promise<User> => {
  // Validar dados de entrada
  const validation = validateRegisterData(userData);
  if (!validation.isValid) {
    throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
  }

  // Verificar se o email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Hash da senha
  const hashedPassword = await hashPassword(userData.password);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone,
      company: userData.company,
      department: userData.department,
      position: userData.position,
      location: userData.location,
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR'
    }
  });

  // Incrementar contador de login inicial
  await prisma.user.update({
    where: { id: user.id },
    data: { loginCount: 1, lastLogin: new Date() }
  });

  return user;
};

export const authenticateUser = async (loginData: LoginData): Promise<{ user: User }> => {
  // Validar dados de entrada
  if (!loginData.email || !loginData.password) {
    throw new Error('Email e senha são obrigatórios');
  }

  if (!validateEmail(loginData.email)) {
    throw new Error('Email inválido');
  }

  // Buscar usuário por email
  const user = await prisma.user.findUnique({
    where: { email: loginData.email }
  });

  if (!user || !user.isActive) {
    throw new Error('Credenciais inválidas');
  }

  // Verificar senha
  const isPasswordValid = await comparePassword(loginData.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas');
  }

  // Atualizar contador de login e última data de login
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      loginCount: { increment: 1 },
      lastLogin: new Date()
    }
  });

  return { user: updatedUser };
};

export const updatePassword = async (userId: string, passwordData: UpdatePasswordData): Promise<void> => {
  // Validar dados de entrada
  if (!passwordData.currentPassword || !passwordData.newPassword) {
    throw new Error('Senha atual e nova senha são obrigatórias');
  }

  // Validar nova senha
  const passwordValidation = validatePassword(passwordData.newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(`Nova senha inválida: ${passwordValidation.errors.join(', ')}`);
  }

  // Verificar se a nova senha é diferente da atual
  if (passwordData.currentPassword === passwordData.newPassword) {
    throw new Error('A nova senha deve ser diferente da senha atual');
  }

  // Buscar usuário atual
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Verificar senha atual
  const isCurrentPasswordValid = await comparePassword(passwordData.currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new Error('Senha atual incorreta');
  }

  // Hash da nova senha
  const hashedNewPassword = await hashPassword(passwordData.newPassword);

  // Atualizar senha
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
      updatedAt: new Date()
    }
  });
};

export const updateProfile = async (userId: string, profileData: UpdateProfileData): Promise<User> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...profileData,
      updatedAt: new Date()
    }
  });

  return user;
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });
};

export const getUserById = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId }
  });
};

export const getAllUsers = async (page: number = 1, pageSize: number = 10, search?: string) => {
  const skip = (page - 1) * pageSize;

  const where: any = {
    isActive: true
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        company: true,
        department: true,
        position: true,
        location: true,
        isActive: true,
        lastLogin: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  };
};

export const deactivateUser = async (userId: string): Promise<User> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      updatedAt: new Date()
    }
  });

  return user;
};

export const activateUser = async (userId: string): Promise<User> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
      updatedAt: new Date()
    }
  });

  return user;
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Verifica o refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as any;
    
    // Verifica se é um refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Token inválido');
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      throw new Error('Usuário não encontrado ou inativo');
    }

    // Gera novos tokens
    return generateTokenPair(user);
  } catch (error) {
    throw new Error('Refresh token inválido ou expirado');
  }
};