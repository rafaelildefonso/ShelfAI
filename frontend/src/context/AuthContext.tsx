import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authService,
  type User,
  type LoginData,
} from "../services/authService";
import { useNavigate } from "react-router-dom";

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
  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;

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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Provider do contexto de autenticação
 * Gerencia estado global do usuário autenticado
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Estados principais
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  /**
   * Carrega o perfil do usuário autenticado com mecanismo de retry
   */
  interface ApiUserResponse {
    user?: User;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    isActive?: boolean;
    loginCount?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    [key: string]: any; // Para quaisquer outros campos adicionais
  }

  const loadUserProfile = async (isRetry = false) => {
    try {
      setError(null);
      const currentUser = user;

      try {
        const response = (await authService.getProfile()) as
          | ApiUserResponse
          | User;

        // Verifica se a resposta tem os dados do usuário
        // A API pode retornar { user: { ... } } ou diretamente o objeto do usuário
        const userData = "user" in response ? response.user : response;

        // Verifica se os dados do usuário são válidos
        if (
          !userData ||
          typeof userData !== "object" ||
          !("id" in userData) ||
          !userData.id
        ) {
          console.warn(
            "Formato de dados de usuário inválido da API:",
            response
          );
          // Se tivermos um usuário atual, mantemos ele
          if (currentUser) {
            console.log(
              "Mantendo usuário atual devido a dados inválidos da API"
            );
            return; // Não atualiza, mas mantém o usuário atual
          }
          // Se não tivermos usuário atual, lança erro para ser tratado abaixo
          throw new Error("Dados de usuário inválidos retornados da API");
        }

        // Se chegou aqui, os dados são válidos
        // Cria um novo objeto com os campos padrão
        const formattedUser: User = {
          // Primeiro, pega todos os campos atuais do usuário (se existirem)
          ...(currentUser || {}),
          // Depois sobrescreve com os novos dados da API
          ...userData,
          // Garante que os campos obrigatórios tenham valores padrão
          id: userData.id,
          name: userData.name || currentUser?.name || "",
          email: userData.email || currentUser?.email || "",
          role: userData.role || currentUser?.role || "USER",
          // Garante que campos booleanos tenham valor padrão
          isActive: userData.isActive ?? currentUser?.isActive ?? true,
          loginCount: userData.loginCount ?? currentUser?.loginCount ?? 0,
          // Converte strings de data para objetos Date, se necessário
          createdAt: userData.createdAt
            ? new Date(userData.createdAt)
            : currentUser?.createdAt || new Date(),
          updatedAt: userData.updatedAt
            ? new Date(userData.updatedAt)
            : currentUser?.updatedAt || new Date(),
        };

        // Atualiza o estado e o localStorage
        setUser(formattedUser);
        localStorage.setItem("user", JSON.stringify(formattedUser));
        setRetryCount(0);
      } catch (apiError) {
        console.error("Erro na API ao carregar perfil:", apiError);
        // Em caso de erro na API, manter os dados locais se disponíveis
        if (currentUser) {
          console.log("Mantendo dados locais do usuário devido a erro na API");
          setUser(currentUser);
          throw apiError; // Ainda lança o erro para tratamento posterior
        }
        throw apiError;
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);

      // Se não for uma tentativa de retry, tentar novamente até 3 vezes
      if (!isRetry && retryCount < 3) {
        console.log(
          `Tentativa ${
            retryCount + 1
          } de carregar perfil falhou, tentando novamente...`
        );
        setRetryCount((prev) => prev + 1);

        // Aguardar um tempo exponencial antes de tentar novamente
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => {
          loadUserProfile(true);
        }, delay);
        return;
      }

      // Se todas as tentativas falharam, definir erro mas não fazer logout automático
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao carregar dados do usuário";
      setError(
        `Erro ao carregar dados do usuário: ${errorMessage}. Algumas funcionalidades podem não estar disponíveis.`
      );
      console.warn(
        "Falha ao carregar perfil do usuário após múltiplas tentativas. Mantendo sessão local."
      );
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

      // Fazer login
      const response = await authService.login(credentials);

      // Salvar tokens no localStorage
      localStorage.setItem("token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      setToken(response.token);

      // Formatar usuário
      const formattedUser: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        phone: response.user.phone,
        company: response.user.company,
        department: response.user.department,
        position: response.user.position,
        location: response.user.location,
        isActive: response.user.isActive ?? true,
        loginCount: response.user.loginCount ?? 1,
        createdAt: response.user.createdAt || new Date(),
        updatedAt: response.user.updatedAt || new Date(),
      };

      // Salvar dados do usuário no localStorage
      localStorage.setItem("user", JSON.stringify(formattedUser));
      setUser(formattedUser);
    } catch (error: any) {
      console.error("Erro no login:", error);
      const errorMessage =
        error.message || "Erro ao fazer login. Verifique suas credenciais.";
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
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("user");

    // Limpar estado
    setToken(null);
    setUser(null);
    setError(null);

    navigate("/login");
  };

  /**
   * Atualiza o perfil do usuário
   */
  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null);

      // Se estiver tentando atualizar dados sensíveis, validar token
      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const updatedUser = await authService.updateProfile(data);

      // Atualizar estado - dados do usuário não são mais armazenados no localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      const errorMessage = error.message || "Erro ao atualizar perfil";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Atualiza a senha do usuário
   */
  const updatePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setError(null);

      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      await authService.updatePassword(data);
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      const errorMessage = error.message || "Erro ao atualizar senha";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Tenta recarregar o perfil do usuário manualmente
   */
  const retryLoadProfile = async () => {
    if (!token) {
      setError("Usuário não autenticado");
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
        const savedToken = localStorage.getItem("token");

        if (savedToken) {
          // Primeiro, reidrata o token
          setToken(savedToken);

          // Tenta reidratar o usuário do localStorage primeiro para mostrar algo imediatamente
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              // Só atualiza se o usuário ainda não estiver definido
              if (!user) {
                setUser(parsedUser);
              }
            }
          } catch (e) {
            console.warn("Erro ao analisar usuário do localStorage:", e);
          }

          // Depois tenta carregar o perfil da API em segundo plano
          try {
            await loadUserProfile();
          } catch (profileError) {
            console.warn(
              "Perfil não pôde ser carregado, mas mantendo sessão com token válido e dados locais:",
              profileError
            );
            // Não faz nada, mantém o usuário com os dados locais
          }
        } else {
          // Nenhum token encontrado, garante que o usuário está deslogado
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        // Em caso de erro crítico, limpa tudo para garantir consistência
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Efeito para monitorar mudanças de autenticação e eventos globais
  useEffect(() => {
    const currentIsAuthenticated = !!user && !!token;
    const isPublicRoute = [
      "/login",
      "/register",
      "/",
      "/forgot-password",
      "/reset-password",
    ].includes(window.location.pathname);

    // Listeners para eventos globais de autenticação
    const handleLogout = () => {
      logout();
    };

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setToken(customEvent.detail);
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);

    // Se o usuário está carregando, não faz nada
    if (loading)
      return () => {
        window.removeEventListener("auth:logout", handleLogout);
        window.removeEventListener(
          "auth:token-refreshed",
          handleTokenRefreshed
        );
      };

    // Se não está autenticado e não está em uma rota pública, redireciona para login
    if (!currentIsAuthenticated && !isPublicRoute) {
      console.log("Usuário não autenticado, redirecionando para login...");
      navigate("/login");
    }
    // Se está autenticado e está em uma rota de login/registro, redireciona para dashboard
    else if (
      currentIsAuthenticated &&
      isPublicRoute &&
      window.location.pathname !== "/"
    ) {
      console.log(
        "Usuário autenticado em rota pública, redirecionando para dashboard..."
      );
      navigate("/dashboard");
    }

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
    };
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
