import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideBarMenu from '../components/SideBarMenu';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <Header />
      <SideBarMenu />

      <main className="main-content">
        <div className="unauthorized-container">
          <div className="unauthorized-content">
            <div className="unauthorized-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>

            <h1 className="unauthorized-title">Acesso Negado</h1>

            <p className="unauthorized-message">
              Você não tem permissão para acessar esta página.
              Entre em contato com o administrador se acredita que isso seja um erro.
            </p>

            <div className="unauthorized-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                <i className="fa-solid fa-arrow-left"></i>
                Voltar ao Dashboard
              </button>

              <Link to="/settings" className="btn btn-secondary">
                <i className="fa-solid fa-gear"></i>
                Ver Configurações
              </Link>
            </div>

            <div className="unauthorized-help">
              <p>
                <strong>Precisa de ajuda?</strong>
                <br />
                Entre em contato com nossa equipe de suporte.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnauthorizedPage;
