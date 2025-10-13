import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type User, type LoginData, type LoginResponse } from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * Interface que define a estrutura do contexto de autenticação
 */
interface AuthContextType {
  // Dados do usuário
  user: User | null;
  token: string | null;

  // Estados de controle
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Funções de autenticação
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;

  // Funções de gerenciamento do usuário
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;

  // Funções utilitárias
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

/**
 * Contexto de autenticação para gerenciar estado do usuário
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personalizado para usar o contexto de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provider do contexto de autenticação
 * Gerencia estado global do usuário autenticado
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados principais
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Carrega o perfil do usuário autenticado
   */
  const loadUserProfile = async () => {
    try {
      setError(null);
      const userData = await authService.getProfile();

      // Converter datas para objetos Date
      const formattedUser: User = {
        ...userData,
        lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      };

      setUser(formattedUser);
      // Atualizar localStorage com dados mais recentes
      localStorage.setItem('user', JSON.stringify(formattedUser));
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      setError('Erro ao carregar dados do usuário');
      // Se não conseguir carregar o perfil, fazer logout
      logout();
    }
  };

  /**
   * Função de login
   */
  const login = async (credentials: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const response: LoginResponse = await authService.login(credentials);

      // Validar resposta
      if (!response.token || !response.user) {
        throw new Error('Resposta de login inválida');
      }

      // Salvar token no localStorage
      localStorage.setItem('token', response.token);
      setToken(response.token);

      // Preparar dados do usuário
      const formattedUser: User = {
        ...response.user,
        lastLogin: response.user.lastLogin ? new Date(response.user.lastLogin) : null,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt),
      };

      // Salvar dados do usuário
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setUser(formattedUser);

    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função de logout
   */
  const logout = () => {
    // Limpar dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    

    // Limpar estado
    setToken(null);
    setUser(null);
    setError(null);
    navigate('/login');
  };

  /**
   * Atualiza o perfil do usuário
   */
  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null);

      // Se estiver tentando atualizar dados sensíveis, validar token
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const updatedUser = await authService.updateProfile(data);

      // Atualizar estado e localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Atualiza a senha do usuário
   */
  const updatePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      setError(null);

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      await authService.updatePassword(data);

    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      const errorMessage = error.message || 'Erro ao atualizar senha';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Recarrega os dados do usuário
   */
  const refreshUser = async () => {
    try {
      setError(null);

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      await loadUserProfile();

    } catch (error: any) {
      console.error('Erro ao recarregar dados do usuário:', error);
      const errorMessage = error.message || 'Erro ao recarregar dados';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Limpa mensagens de erro
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Verifica se o usuário tem uma role específica
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Verifica se o usuário tem alguma das roles especificadas
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  // Inicialização - verificar se há sessão salva
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);

          // Verificar se o usuário salvo é válido
          const userData = JSON.parse(savedUser);
          if (userData && userData.id) {
            setUser({
              ...userData,
              lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
              createdAt: new Date(userData.createdAt),
              updatedAt: new Date(userData.updatedAt),
            });

            // Verificar se o token ainda é válido fazendo uma chamada à API
            await loadUserProfile();
          } else {
            // Dados inválidos, fazer logout
            logout();
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Efeito para monitorar mudanças de autenticação
  useEffect(() => {
    const currentIsAuthenticated = !!user && !!token;

    // Se o usuário ficou deslogado e não estamos carregando, redirecionar para login
    if (!loading && !currentIsAuthenticated && window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
      console.log('Usuário deslogado detectado, redirecionando para login...');
      navigate('/login');
    }
  }, [user, token, loading, navigate]);

  const value: AuthContextType = {
    // Dados
    user,
    token,

    // Estados
    loading,
    error,
    isAuthenticated: !!user && !!token,

    // Funções de autenticação
    login,
    logout,
    refreshUser,

    // Funções de gerenciamento
    updateProfile,
    updatePassword,

    // Utilitários
    clearError,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
