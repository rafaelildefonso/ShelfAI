import { useState } from 'react';
import { Link } from 'react-router-dom';
import './../App.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: 'fa-solid fa-upload',
      title: 'Importação Inteligente',
      description: 'Importe planilhas CSV/Excel e outros sistemas (JSON/XML) com validação automática de dados.'
    },
    {
      icon: 'fa-solid fa-magic-wand-sparkles',
      title: 'Geração Automática',
      description: 'Gere informações dos produtos automaticamente com base em imagens usando IA.'
    },
    {
      icon: 'fa-solid fa-share-nodes',
      title: 'Exportação Multi-Marketplace',
      description: 'Exporte seus produtos para múltiplos marketplaces com um clique.'
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Dashboard Inteligente',
      description: 'Acompanhe métricas, produtos prontos/incompletos e últimas importações.'
    },
    {
      icon: 'fa-solid fa-images',
      title: 'Gestão de Imagens',
      description: 'Upload e compressão automática de imagens para otimizar performance.'
    },
    {
      icon: 'fa-solid fa-check',
      title: 'Validação de Campos',
      description: 'Validação automática de campos obrigatórios para garantir qualidade.'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Importe seus dados',
      description: 'Faça upload da sua planilha ou conecte com outros sistemas para importar seus produtos.'
    },
    {
      step: '02',
      title: 'Padronize automaticamente',
      description: 'Nossa IA organiza e padroniza as informações dos seus produtos automaticamente.'
    },
    {
      step: '03',
      title: 'Revise e ajuste',
      description: 'Revise as informações geradas e faça ajustes necessários no dashboard intuitivo.'
    },
    {
      step: '04',
      title: 'Exporte para marketplaces',
      description: 'Exporte seus produtos padronizados para múltiplos marketplaces com um clique.'
    }
  ];

  const benefits = [
    {
      icon: 'fa-solid fa-clock',
      title: 'Economize Tempo',
      description: 'Reduza em até 80% o tempo de cadastro de produtos'
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Aumente Vendas',
      description: 'Produtos bem cadastrados vendem mais em marketplaces'
    },
    {
      icon: 'fa-solid fa-bug',
      title: 'Menos Erros',
      description: 'Validação automática reduz erros de cadastro'
    },
    {
      icon: 'fa-solid fa-mobile-screen',
      title: 'Multi-Marketplace',
      description: 'Cadastre uma vez, venda em vários lugares'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      company: 'Moda & Estilo',
      text: 'O ShelfAI revolucionou nossa gestão de produtos. Economizamos horas de trabalho e aumentamos nossas vendas em 40%.',
      avatar: 'https://blog.unyleya.edu.br/wp-content/uploads/2017/12/saiba-como-a-educacao-ajuda-voce-a-ser-uma-pessoa-melhor.jpeg'
    },
    {
      name: 'João Santos',
      company: 'TechStore',
      text: 'A integração com múltiplos marketplaces é fantástica. Agora conseguimos vender em 5 plataformas diferentes.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Ana Costa',
      company: 'Casa & Decoração',
      text: 'A geração automática de informações economiza muito tempo. Produtos que levavam 30 minutos agora levam 5.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <div className='landing-container'>
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <i className="fa-solid fa-boxes-stacked"></i>
              </div>
              <span className="logo-text">ShelfAI</span>
            </div>
            
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <a href="#features" className="nav-link">Funcionalidades</a>
              <a href="#how-it-works" className="nav-link">Como Funciona</a>
              <a href="#benefits" className="nav-link">Benefícios</a>
              <a href="#testimonials" className="nav-link">Depoimentos</a>
            </nav>
            
            <div className="header-actions">
              <Link to="/login" className="btn btn-outline">Entrar</Link>
              <Link to="/register" className="btn btn-primary">Começar Grátis</Link>
            </div>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Organize seus produtos para 
                <span className="highlight"> e-commerce</span> 
                com inteligência artificial
              </h1>
              <p className="hero-description">
                ShelfAI é a plataforma que ajuda pequenas e médias lojas a organizar produtos 
                para cadastro em e-commerces. Importe planilhas, padronize produtos, gere 
                informações automáticas e exporte para múltiplos marketplaces.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  <i className="fa-solid fa-rocket"></i>
                  Começar Grátis
                </Link>
                <button className="btn btn-outline btn-large">
                  <i className="fa-solid fa-play"></i>
                  Ver Demonstração
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">1.2k+</span>
                  <span className="stat-label">Lojas Ativas</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50k+</span>
                  <span className="stat-label">Produtos Processados</span>
                </div>
                <div className="stat">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Satisfação</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="preview-title">ShelfAI Dashboard</span>
                </div>
                <div className="preview-content">
                  <div className="preview-sidebar">
                    <div className="preview-nav-item active">
                      <i className="fa-solid fa-chart-line"></i>
                      <span>Dashboard</span>
                    </div>
                    <div className="preview-nav-item">
                      <i className="fa-solid fa-boxes-stacked"></i>
                      <span>Produtos</span>
                    </div>
                    <div className="preview-nav-item">
                      <i className="fa-solid fa-file-import"></i>
                      <span>Importar</span>
                    </div>
                    <div className="preview-nav-item">
                      <i className="fa-solid fa-file-export"></i>
                      <span>Exportar</span>
                    </div>
                  </div>
                  <div className="preview-main">
                    <div className="preview-stats">
                      <div className="preview-stat">
                        <span className="preview-stat-number">1,247</span>
                        <span className="preview-stat-label">Produtos</span>
                      </div>
                      <div className="preview-stat">
                        <span className="preview-stat-number">892</span>
                        <span className="preview-stat-label">Completos</span>
                      </div>
                      <div className="preview-stat">
                        <span className="preview-stat-number">355</span>
                        <span className="preview-stat-label">Pendentes</span>
                      </div>
                    </div>
                    <div className="preview-chart">
                      <div className="chart-bars">
                        {[60, 80, 45, 90, 70, 85, 95].map((height, index) => (
                          <div 
                            key={index} 
                            className="chart-bar" 
                            style={{ height: `${height}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Funcionalidades Poderosas</h2>
            <p className="section-description">
              Tudo que você precisa para gerenciar seus produtos de forma inteligente
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Como Funciona</h2>
            <p className="section-description">
              Em 4 passos simples, seus produtos estarão prontos para vender
            </p>
          </div>
          <div className="steps-container">
            {howItWorks.map((step, index) => (
              <div key={index} className="step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="step-arrow">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Por que escolher o ShelfAI?</h2>
              <p className="section-description">
                Nossa plataforma foi desenvolvida especificamente para pequenas e médias lojas 
                que precisam agilizar o cadastro de produtos online.
              </p>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <div className="benefit-icon">
                      <i className={benefit.icon}></i>
                    </div>
                    <div className="benefit-content">
                      <h4 className="benefit-title">{benefit.title}</h4>
                      <p className="benefit-description">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="benefits-image">
              <div className="benefits-visual">
                <div className="visual-card">
                  <div className="visual-header">
                    <div className="visual-avatar">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="visual-info">
                      <span className="visual-name">Loja Exemplo</span>
                      <span className="visual-status">Online</span>
                    </div>
                  </div>
                  <div className="visual-stats">
                    <div className="visual-stat">
                      <span className="visual-stat-number">+80%</span>
                      <span className="visual-stat-label">Economia de Tempo</span>
                    </div>
                    <div className="visual-stat">
                      <span className="visual-stat-number">+40%</span>
                      <span className="visual-stat-label">Aumento de Vendas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">O que nossos clientes dizem</h2>
            <p className="section-description">
              Histórias reais de lojas que transformaram seu negócio
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-info">
                    <span className="testimonial-name">{testimonial.name}</span>
                    <span className="testimonial-company">{testimonial.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Pronto para transformar sua loja?</h2>
            <p className="cta-description">
              Comece gratuitamente hoje e veja como é fácil organizar seus produtos
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <i className="fa-solid fa-rocket"></i>
                Começar Grátis
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Já tenho conta
              </Link>
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <i className="fa-solid fa-check"></i>
                <span>Teste gratuito por 14 dias</span>
              </div>
              <div className="cta-feature">
                <i className="fa-solid fa-check"></i>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="cta-feature">
                <i className="fa-solid fa-check"></i>
                <span>Suporte completo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon">
                  <i className="fa-solid fa-boxes-stacked"></i>
                </div>
                <span className="logo-text">ShelfAI</span>
              </div>
              <p className="footer-description">
                A plataforma inteligente para gestão de produtos e e-commerce.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Produto</h4>
              <ul className="footer-links">
                <li><a href="#features">Funcionalidades</a></li>
                <li><a href="#how-it-works">Como Funciona</a></li>
                <li><a href="#benefits">Benefícios</a></li>
                <li><a href="#">Preços</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Suporte</h4>
              <ul className="footer-links">
                <li><a href="#">Central de Ajuda</a></li>
                <li><a href="#">Documentação</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Empresa</h4>
              <ul className="footer-links">
                <li><a href="#">Sobre</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Carreiras</a></li>
                <li><a href="#">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ShelfAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
