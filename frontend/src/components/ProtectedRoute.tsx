import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Interface para definir propriedades do componente ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

/**
 * Componente que protege rotas requerindo autenticação
 * Redireciona automaticamente para login se usuário não estiver autenticado
 *
 * @param children - Componentes filhos a serem renderizados se autenticado
 * @param requiredRoles - Array de roles necessárias para acessar a rota
 * @param fallbackPath - Caminho alternativo para redirecionamento (padrão: /login)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, loading, user, hasAnyRole } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <i className="fa-solid fa-shield-halved text-2xl text-purple-600 dark:text-purple-400"></i>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Verificando acesso</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Estamos verificando suas credenciais de acesso...</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
            <div className="bg-purple-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  // com o caminho atual para redirecionar de volta após login
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Se roles específicas são necessárias, verificar se usuário tem alguma delas
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ requiredRoles, userRole: user?.role }}
        replace
      />
    );
  }

  // Usuário autenticado e autorizado, renderizar conteúdo
  return <>{children}</>;
};
