import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";

const MainContent = () => {
  const exportOptions = [
    {
      name: 'Shopify',
      icon: 'fa-brands fa-shopify',
      description: 'Exporte para sua loja Shopify'
    },
    {
      name: 'Amazon',
      icon: 'fa-brands fa-amazon',
      description: 'Exporte para Amazon Marketplace'
    },
    {
      name: 'CSV',
      icon: 'fa-solid fa-file-csv',
      description: 'Exporte em formato CSV'
    },
    {
      name: 'Excel',
      icon: 'fa-solid fa-file-excel',
      description: 'Exporte em formato Excel'
    },
    {
      name: 'Shopee',
      icon: 'fa-solid fa-bag-shopping',
      description: 'Exporte em formato Excel'
    },
    {
      name: 'Mercado Livre',
      icon: 'fa-solid fa-handshake',
      description: 'Exporte em formato Excel'
    },
    {
      name: 'Aliexpress',
      icon: 'fa-solid fa-store',
      description: 'Exporte em formato Excel'
    },

  ]
  return (
    <main className="app-main">
      <div className="export-container">
        <div className="export-header">
          <div className="page-title">
            <h1>Exportar Produtos</h1>
            <p>Exporte seus produtos para marketplaces e plataformas</p>
          </div>
        </div>

        <div className="export-options">
          {exportOptions.map((option)=> (
            <div className="export-card">
            <div className="export-icon">
              <i className={option.icon}></i>
            </div>
            <div className="export-content">
              <h3>{option.name}</h3>
              <p>{option.description}</p>
              <button className="export-btn">Exportar</button>
            </div>
          </div>
          ))}
          
        </div>
      </div>
    </main>
  );
};

const ExportScreen = () => {
  return (
    <div>
      <Header />
      <SideBarMenu pageName="export"/>
      <MainContent />
    </div>
  );
};

export default ExportScreen;
