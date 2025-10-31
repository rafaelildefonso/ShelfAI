import { Link } from "react-router-dom";
import Header from "../components/Header";
import SideBarMenu from "../components/SideBarMenu";

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <Header />
      <SideBarMenu />

      <main className="app-main flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="not-found-container w-full max-w-2xl mx-auto p-6">
          <div className="not-found-content flex flex-col gap-6 items-center text-center p-8">
            <div className="not-found-icon">
              <i className="fa-solid fa-triangle-exclamation text-6xl text-yellow-500"></i>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Página não encontrada</h2>
            
            <p className="text-gray-600 dark:text-gray-300">
              A página que você está procurando não existe ou foi movida.
            </p>

            <div className="not-found-actions flex gap-4 mt-4">
              <Link
                to="/dashboard"
                className="btn btn-primary flex items-center gap-2"
              >
                <i className="fa-solid fa-house"></i>
                Ir para o Dashboard
              </Link>

              <button 
                onClick={() => window.history.back()}
                className="btn btn-outline flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Voltar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
