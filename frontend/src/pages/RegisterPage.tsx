import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  authService,
  validateEmail,
  type RegisterData,
} from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCircle } from "@fortawesome/free-regular-svg-icons";
import "./../App.css";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showLoginLink, setShowLoginLink] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  // Função auxiliar para categorizar erros
  const getErrorMessage = (error: any) => {
    if (!error) return "Erro desconhecido";

    // Erro de rede/conexão
    if (!navigator.onLine) {
      return "Sem conexão com a internet. Verifique sua conexão e tente novamente.";
    }

    // Erro de timeout
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "Tempo limite excedido. Tente novamente.";
    }

    // Erros específicos do servidor
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return (
            data.message ||
            "Dados de cadastro inválidos. Verifique as informações fornecidas."
          );
        case 401:
          return "Não autorizado. Tente novamente.";
        case 403:
          return "Acesso negado. Entre em contato com o suporte.";
        case 404:
          return "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
        case 409:
          return "Este email já está cadastrado. Tente fazer login ou use outro email.";
        case 429:
          return "Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente.";
        case 500:
        case 502:
        case 503:
        case 504:
          return "Servidor temporariamente indisponível. Tente novamente em alguns minutos.";
        default:
          return data.message || "Erro interno do servidor. Tente novamente.";
      }
    }

    // Erro genérico
    return error.message || "Erro ao criar conta. Tente novamente.";
  };

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    // Se o usuário já estiver autenticado, redirecionar para onde ele estava tentando ir
    if (localStorage.getItem("token")) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, password: value }));

    // Update password validation checks
    setPasswordChecks({
      length: value.length >= 8,
      lowercase: /[a-z]/.test(value),
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(value), 
    });

    // Clear error when user types
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, confirmPassword: value }));

    // Clear error when passwords match
    if (formData.password === value && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'password') {
      handlePasswordChange(e);
      return;
    }
    
    if (name === 'confirmPassword') {
      handleConfirmPasswordChange(e);
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!Object.values(passwordChecks).every(Boolean)) {
      newErrors.password = "A senha não atende a todos os requisitos";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = "Telefone deve ter pelo menos 10 dígitos";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Você deve aceitar os termos de uso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderPasswordValidation = () => {
    if (!formData.password) return null;
    
    return (
      <div className="password-validation mt-2 p-3 bg-opacity-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm font-medium mb-2">Sua senha deve conter:</p>
        <ul className="space-y-1">
          <li className={`flex items-center text-sm ${passwordChecks.length ? 'text-green-500' : 'text-gray-500'}`}>
            <FontAwesomeIcon 
              icon={passwordChecks.length ? faCheckCircle : faCircle} 
              className="mr-2 text-xs" 
            />
            Pelo menos 8 caracteres
          </li>
          <li className={`flex items-center text-sm ${passwordChecks.lowercase ? 'text-green-500' : 'text-gray-500'}`}>
            <FontAwesomeIcon 
              icon={passwordChecks.lowercase ? faCheckCircle : faCircle} 
              className="mr-2 text-xs" 
            />
            Pelo menos uma letra minúscula
          </li>
          <li className={`flex items-center text-sm ${passwordChecks.uppercase ? 'text-green-500' : 'text-gray-500'}`}>
            <FontAwesomeIcon 
              icon={passwordChecks.uppercase ? faCheckCircle : faCircle} 
              className="mr-2 text-xs" 
            />
            Pelo menos uma letra maiúscula
          </li>
          <li className={`flex items-center text-sm ${passwordChecks.number ? 'text-green-500' : 'text-gray-500'}`}>
            <FontAwesomeIcon 
              icon={passwordChecks.number ? faCheckCircle : faCircle} 
              className="mr-2 text-xs" 
            />
            Pelo menos um número
          </li>
          <li className={`flex items-center text-sm ${passwordChecks.specialChar ? 'text-green-500' : 'text-gray-500'}`}>
            <FontAwesomeIcon 
              icon={passwordChecks.specialChar ? faCheckCircle : faCircle} 
              className="mr-2 text-xs" 
            />
            Pelo menos um caractere especial (@$!%*?&)
          </li>
        </ul>
      </div>
    );
  };

  const renderPasswordMatchFeedback = () => {
    if (!formData.confirmPassword) return null;
    
    const passwordsMatch = formData.password === formData.confirmPassword;
    return (
      <div className={`mt-1 text-sm flex items-center ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
        <FontAwesomeIcon 
          icon={passwordsMatch ? faCheckCircle : faCircle} 
          className="mr-1 text-xs" 
        />
        {passwordsMatch ? 'As senhas coincidem' : 'As senhas não coincidem'}
      </div>
    );
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      phone: formatted,
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

      const response = await authService.register(registerData);

      // Se o backend retornar { user, token }, fazer login automaticamente
      if (response.token && response.user) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);

      // Se for erro 409 (email já cadastrado), mostrar link para login
      if (error.response?.status === 409) {
        setShowLoginLink(true);
      }

      setErrors({
        general: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Register with ${provider}`);
    // In real app, this would integrate with OAuth providers
    setErrors({
      general: `Cadastro com ${provider} ainda não implementado. Use o formulário de cadastro.`,
    });
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
                  {showLoginLink && (
                    <div style={{ marginTop: "10px" }}>
                      <Link
                        to="/login"
                        className="auth-link"
                        style={{
                          color: "#007bff",
                          textDecoration: "underline",
                        }}
                      >
                        Já tem uma conta? Faça login aqui
                      </Link>
                    </div>
                  )}
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
                      className={`form-input ${errors.name ? "error" : ""}`}
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
                      className={`form-input ${errors.email ? "error" : ""}`}
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
                      className={`form-input ${errors.company ? "error" : ""}`}
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
                      className={`form-input ${errors.phone ? "error" : ""}`}
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
                  <div className="input-container relative">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      placeholder="Mínimo 8 caracteres"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <i
                        className={`fa-solid ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                  {formData.password && renderPasswordValidation()}
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar senha
                  </label>
                  <div className="input-container relative">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      placeholder="Confirme sua senha"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <i
                        className={`fa-solid ${
                          showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                  {renderPasswordMatchFeedback()}
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
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
                    Eu aceito os{" "}
                    <Link to="/terms" className="terms-link">
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
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
                  className={`btn btn-primary btn-full ${
                    isLoading ? "loading" : ""
                  }`}
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
                    onClick={() => handleSocialRegister("google")}
                    disabled={isLoading}
                  >
                    <i className="fa-brands fa-google"></i>
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn facebook"
                    onClick={() => handleSocialRegister("facebook")}
                    disabled={isLoading}
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                    Facebook
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Já tem uma conta?{" "}
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
              <h2 className="info-title">Transforme sua loja em minutos</h2>
              <p className="info-description">
                Junte-se a mais de 1.200 lojas que já usam o ShelfAI para
                organizar seus produtos e aumentar suas vendas online.
              </p>

              <div className="info-features">
                <div className="info-feature">
                  <i className="fa-solid fa-rocket"></i>
                  <div>
                    <h4>Setup em 5 minutos</h4>
                    <p>
                      Configure sua conta e comece a importar produtos
                      imediatamente
                    </p>
                  </div>
                </div>
                <div className="info-feature">
                  <i className="fa-solid fa-lock"></i>
                  <div>
                    <h4>Dados seguros</h4>
                    <p>
                      Seus dados são protegidos com criptografia de nível
                      bancário
                    </p>
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
