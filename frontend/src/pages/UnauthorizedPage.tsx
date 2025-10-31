import { Link } from "react-router-dom";
import Header from "../components/Header";
import SideBarMenu from "../components/SideBarMenu";

const UnauthorizedPage = () => {

  return (
    <div className="unauthorized-page">
      <Header />
      <SideBarMenu />

      <main className="app-main flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="unauthorized-container w-full max-w-2xl mx-auto p-6">
          <div className="unauthorized-content flex flex-col gap-6 items-center text-center p-8">
            <div className="unauthorized-icon">
              <i className="fa-solid fa-shield-halved text-(--error-color)" style={{fontSize:50}}></i>
            </div>

            <h1 className="unauthorized-title text-(--error-color) text-[25px] font-medium">Acesso Negado</h1>

            <p className="unauthorized-message">
              Você não tem permissão para acessar esta página. <br /> Entre em contato
              com o administrador se acredita que isso seja um erro.
            </p>

            <div className="unauthorized-actions flex gap-[15px]">
              <Link
                to="/dashboard"
                className="btn btn-primary"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Voltar ao Dashboard
              </Link>

              <Link to="/settings" className="btn btn-outline">
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
