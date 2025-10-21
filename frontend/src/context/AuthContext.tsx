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

  // Função para tentar recarregar perfil manualmente
  retryLoadProfile: () => Promise<void>;

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
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  /**
   * Carrega o perfil do usuário autenticado com mecanismo de retry
   */
  const loadUserProfile = async (isRetry = false) => {
    try {
      setError(null);
      const userData = await authService.getProfile();

      // Converter datas para objetos Date
      const formattedUser: User = userData;

      setUser(formattedUser);
      // Atualizar localStorage com dados mais recentes - REMOVIDO: armazenar apenas token JWT
      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);

      // Se não for uma tentativa de retry, tentar novamente até 3 vezes
      if (!isRetry && retryCount < 3) {
        console.log(`Tentativa ${retryCount + 1} de carregar perfil falhou, tentando novamente...`);
        setRetryCount(prev => prev + 1);

        // Aguardar um tempo exponencial antes de tentar novamente
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => {
          loadUserProfile(true);
        }, delay);
        return;
      }

      // Se todas as tentativas falharam, definir erro mas não fazer logout automático
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados do usuário';
      setError(`Erro ao carregar dados do usuário: ${errorMessage}. Algumas funcionalidades podem não estar disponíveis.`);
      console.warn('Falha ao carregar perfil do usuário após múltiplas tentativas. Mantendo sessão local.');
      // Não chamar logout() automaticamente - deixar o usuário decidir se quer tentar novamente
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
      const formattedUser: User = response.user;

      // Salvar dados do usuário - dados não são mais armazenados no localStorage
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
      // Limpar dados do localStorage - removido armazenamento de usuário
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      // Não remover dados do usuário pois não são mais armazenados
    

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

      // Atualizar estado - dados do usuário não são mais armazenados no localStorage
      setUser(updatedUser);

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
   * Tenta recarregar o perfil do usuário manualmente
   */
  const retryLoadProfile = async () => {
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    setRetryCount(0); // Reset retry count for manual retry
    await loadUserProfile();
  };

  /**
   * Recarrega os dados do usuário
   */
  const refreshUser = async () => {
    await retryLoadProfile();
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

        if (savedToken) {
          setToken(savedToken);

          // Tentar carregar perfil da API
          try {
            await loadUserProfile();
          } catch (profileError) {
            console.warn('Perfil não pôde ser carregado, mas mantendo sessão com token válido:', profileError);
            // Não fazer logout - deixar o usuário usar a aplicação sem dados locais
            setLoading(false);
          }
        } else {
          // Nenhum dado salvo encontrado
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Em caso de erro crítico, ainda fazer logout para segurança
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
    if (!loading && !currentIsAuthenticated && !['/login','/register','/'].includes(window.location.pathname)) {
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

    // Função para tentar recarregar perfil
    retryLoadProfile,

    // Utilitários
    clearError,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
