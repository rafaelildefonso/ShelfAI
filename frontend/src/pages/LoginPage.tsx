import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService, validateEmail } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './../App.css';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Pegar o caminho de destino do estado de navegação (quando redirecionado do ProtectedRoute)
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Se o usuário já estiver autenticado, redirecionar para onde ele estava tentando ir
    if (localStorage.getItem('token')) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirecionar para onde o usuário estava tentando ir
      navigate(from, { replace: true });
    } catch (error: any) {
      setErrors({ general: error.message || 'Erro ao fazer login. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // TODO: Implement OAuth integration
    setErrors({ general: 'Login social ainda não implementado' });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          {/* Left Side - Form */}
          <div className="auth-form-container">
            <div className="auth-form">
              <div className="auth-header">
                <Link to="/" className="auth-logo">
                  <div className="logo-icon">
                    <i className="fa-solid fa-boxes-stacked"></i>
                  </div>
                  <span className="logo-text">ShelfAI</span>
                </Link>
                <h1 className="auth-title">Bem-vindo de volta!</h1>
                <p className="auth-subtitle">
                  Entre na sua conta para continuar gerenciando seus produtos
                </p>
              </div>

              {errors.general && (
                <div className="error-message">
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="input-container">
                    <i className="fa-solid fa-envelope input-icon"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="seu@email.com"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Senha
                  </label>
                  <div className="input-container">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Sua senha"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="checkmark"></span>
                    Lembrar de mim
                  </label>
                  <Link to="/forgot-password" className="forgot-link">
                    Esqueceu a senha?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sign-in-alt"></i>
                      Entrar
                    </>
                  )}
                </button>

                <div className="divider">
                  <span>ou continue com</span>
                </div>

                <div className="social-login">
                  <button
                    type="button"
                    className="social-btn google"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                  >
                    <i className="fa-brands fa-google"></i>
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={isLoading}
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                    Facebook
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Não tem uma conta?{' '}
                    <Link to="/register" className="auth-link">
                      Cadastre-se
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Info */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h2 className="info-title">
                Gerencie seus produtos com inteligência artificial
              </h2>
              <p className="info-description">
                Acesse sua dashboard personalizada e continue organizando seus produtos
                para múltiplos marketplaces de forma eficiente.
              </p>

              <div className="info-features">
                <div className="info-feature">
                  <i className="fa-solid fa-chart-line"></i>
                  <div>
                    <h4>Dashboard Inteligente</h4>
                    <p>Acompanhe métricas e performance dos seus produtos</p>
                  </div>
                </div>
                <div className="info-feature">
                  <i className="fa-solid fa-robot"></i>
                  <div>
                    <h4>IA Integrada</h4>
                    <p>Geração automática de informações dos produtos</p>
                  </div>
                </div>
                <div className="info-feature">
                  <i className="fa-solid fa-share-nodes"></i>
                  <div>
                    <h4>Multi-Marketplace</h4>
                    <p>Exporte para diversos canais de venda</p>
                  </div>
                </div>
              </div>

              <div className="info-stats">
                <div className="info-stat">
                  <span className="stat-number">1.2k+</span>
                  <span className="stat-label">Lojas Ativas</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">50k+</span>
                  <span className="stat-label">Produtos</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Satisfação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
