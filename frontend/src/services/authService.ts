const API_URL = "/api/v1/auth";

// Função para obter token do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const AUTH_HEADER = (): { Authorization?: string } => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Interface para dados de registro
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

// Interface para dados de login
export interface LoginData {
  email: string;
  password: string;
}

// Interface para resposta de login
export interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    company?: string;
    department?: string;
    position?: string;
    location?: string;
    avatar?: string;
    isActive: boolean;
    loginCount: number;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// Interface para usuário
export interface User {
  id: string;
  name: string;
  email: string;
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

// Validações
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
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

// Serviço de autenticação
export const authService = {
  // Registrar usuário
  async register(userData: RegisterData): Promise<User> {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao criar conta');
    }

    return await res.json();
  },

  // Login
  async login(loginData: LoginData): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }

    return await res.json();
  },

  // Atualizar senha
  async updatePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    const res = await fetch(`${API_URL}/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER(),
      },
      body: JSON.stringify(passwordData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao atualizar senha');
    }
  },

  // Atualizar perfil
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER(),
      },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }

    return await res.json();
  },

  // Obter perfil do usuário
  async getProfile(): Promise<User> {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { ...AUTH_HEADER() },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao obter perfil');
    }

    return await res.json();
  },

  // Logout (opcional - geralmente feito no frontend)
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
  },
};
