import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";

const MainContent = () => {
  return (
    <main className="app-main">
      <div className="import-container">
        <div className="import-header">
          <div className="page-title">
            <h1>Importar Produtos</h1>
            <p>Importe produtos de planilhas e outros sistemas</p>
          </div>
        </div>

        <div className="import-options">
          <div className="import-card">
            <div className="import-icon">
              <i className="fa-solid fa-file-csv"></i>
            </div>
            <div className="import-content">
              <h3>Arquivo CSV</h3>
              <p>Importe produtos de um arquivo CSV</p>
              <button className="import-btn">Selecionar Arquivo</button>
            </div>
          </div>

          <div className="import-card">
            <div className="import-icon">
              <i className="fa-solid fa-file-excel"></i>
            </div>
            <div className="import-content">
              <h3>Arquivo Excel</h3>
              <p>Importe produtos de um arquivo Excel</p>
              <button className="import-btn">Selecionar Arquivo</button>
            </div>
          </div>

          <div className="import-card">
            <div className="import-icon">
              <i className="fa-solid fa-file-code"></i>
            </div>
            <div className="import-content">
              <h3>JSON/XML</h3>
              <p>Importe de outros sistemas via JSON ou XML</p>
              <button className="import-btn">Configurar</button>
            </div>
          </div>

          <div className="import-card">
            <div className="import-icon">
              <i className="fa-solid fa-download"></i>
            </div>
            <div className="import-content">
              <h3>Template</h3>
              <p>Baixe um template para importação</p>
              <button className="import-btn secondary">Baixar Template</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const ImportScreen = () => {
  return (
    <div>
      <Header />
      <SideBarMenu pageName="import" />
      <MainContent />
    </div>
  );
};

export default ImportScreen;
