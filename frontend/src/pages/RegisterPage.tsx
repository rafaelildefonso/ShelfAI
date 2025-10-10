import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, validateEmail, validatePassword, type RegisterData } from '../services/authService';
import './../App.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors.join(', ');
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
      };

      const user = await authService.register(registerData);

      // Store user session
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.message || 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Register with ${provider}`);
    // In real app, this would integrate with OAuth providers
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
                <h1 className="auth-title">Crie sua conta</h1>
                <p className="auth-subtitle">
                  Comece gratuitamente e transforme sua gestão de produtos
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
                  <label htmlFor="name" className="form-label">
                    Nome completo
                  </label>
                  <div className="input-container">
                    <i className="fa-solid fa-user input-icon"></i>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Seu nome completo"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <span className="error-text">{errors.name}</span>
                  )}
                </div>

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
                    />
                  </div>
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="company" className="form-label">
                    Nome da empresa
                  </label>
                  <div className="input-container">
                    <i className="fa-solid fa-building input-icon"></i>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`form-input ${errors.company ? 'error' : ''}`}
                      placeholder="Nome da sua loja/empresa"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.company && (
                    <span className="error-text">{errors.company}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Telefone
                  </label>
                  <div className="input-container">
                    <i className="fa-solid fa-phone input-icon"></i>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="(11) 99999-9999"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phone && (
                    <span className="error-text">{errors.phone}</span>
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
                      placeholder="Mínimo 8 caracteres"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar senha
                  </label>
                  <div className="input-container">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirme sua senha"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <span className="checkmark"></span>
                    Eu aceito os{' '}
                    <Link to="/terms" className="terms-link">
                      Termos de Uso
                    </Link>{' '}
                    e a{' '}
                    <Link to="/privacy" className="terms-link">
                      Política de Privacidade
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <span className="error-text">{errors.acceptTerms}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-plus"></i>
                      Criar conta gratuita
                    </>
                  )}
                </button>

                <div className="divider">
                  <span>ou cadastre-se com</span>
                </div>

                <div className="social-login">
                  <button
                    type="button"
                    className="social-btn google"
                    onClick={() => handleSocialRegister('google')}
                    disabled={isLoading}
                  >
                    <i className="fa-brands fa-google"></i>
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook"
                    onClick={() => handleSocialRegister('facebook')}
                    disabled={isLoading}
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                    Facebook
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Já tem uma conta?{' '}
                    <Link to="/login" className="auth-link">
                      Faça login
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
                Transforme sua loja em minutos
              </h2>
              <p className="info-description">
                Junte-se a mais de 1.200 lojas que já usam o ShelfAI para organizar
                seus produtos e aumentar suas vendas online.
              </p>

              <div className="info-features">
                <div className="info-feature">
                  <i className="fa-solid fa-rocket"></i>
                  <div>
                    <h4>Setup em 5 minutos</h4>
                    <p>Configure sua conta e comece a importar produtos imediatamente</p>
                  </div>
                </div>
                <div className="info-feature">
                  <i className="fa-solid fa-lock"></i>
                  <div>
                    <h4>Dados seguros</h4>
                    <p>Seus dados são protegidos com criptografia de nível bancário</p>
                  </div>
                </div>
                <div className="info-feature">
                  <i className="fa-solid fa-headset"></i>
                  <div>
                    <h4>Suporte 24/7</h4>
                    <p>Nossa equipe está sempre disponível para ajudar</p>
                  </div>
                </div>
              </div>

              <div className="info-benefits">
                <h3>O que você ganha:</h3>
                <ul className="benefits-list">
                  <li>
                    <i className="fa-solid fa-check"></i>
                    <span>Teste gratuito por 14 dias</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check"></i>
                    <span>Até 1.000 produtos gratuitos</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check"></i>
                    <span>Integração com 5+ marketplaces</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check"></i>
                    <span>Geração automática com IA</span>
                  </li>
                  <li>
                    <i className="fa-solid fa-check"></i>
                    <span>Dashboard completo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
