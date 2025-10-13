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
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Verificando autenticação...</span>
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
