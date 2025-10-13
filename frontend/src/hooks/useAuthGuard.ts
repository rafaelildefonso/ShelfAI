import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para proteger componentes individuais
 * Redireciona automaticamente para login se usuário não estiver autenticado
 *
 * @param redirectTo - Caminho para redirecionar (padrão: /login)
 * @param requiredRoles - Array de roles necessárias (opcional)
 */
export const useAuthGuard = (redirectTo: string = '/login', requiredRoles?: string[]) => {
  const { isAuthenticated, loading, user, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Não fazer nada enquanto está carregando
    if (loading) return;

    // Se não estiver autenticado, redirecionar
    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // Se roles específicas são necessárias, verificar
    if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      navigate('/unauthorized', {
        replace: true,
        state: { requiredRoles, userRole: user?.role }
      });
      return;
    }
  }, [isAuthenticated, loading, navigate, redirectTo, requiredRoles, hasAnyRole, user]);

  return {
    isAuthenticated,
    loading,
    user,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole,
  };
};
