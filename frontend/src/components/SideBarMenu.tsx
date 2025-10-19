import { Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';

interface SideBarMenuProps {
  pageName?: string;
}

export default function SideBarMenu({ pageName }: SideBarMenuProps) {
  const { menuAberto, toggleMenu } = useMenu();
  const menuItems = [
    {
      path: '/dashboard',
      name: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-solid fa-chart-line',
      description: 'Visão geral da loja'
    },
    {
      path: '/products',
      name: 'products',
      label: 'Produtos',
      icon: 'fa-solid fa-boxes-stacked',
      description: 'Gerenciar catálogo'
    },
    {
      path: '/import',
      name: 'import',
      label: 'Importar',
      icon: 'fa-solid fa-file-import',
      description: 'Importar planilhas'
    },
    {
      path: '/export',
      name: 'export',
      label: 'Exportar',
      icon: 'fa-solid fa-file-export',
      description: 'Exportar para marketplaces'
    }
  ];

  return (
    <div className={`sidebar ${menuAberto ? 'open-menu' : 'closed-menu'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-menu-btn" onClick={toggleMenu}>
           <div className="logo-icon">
            <i className="fa-solid fa-warehouse"></i>
          </div>
        </div>
        <div className="sidebar-logo" onClick={()=> window.location.href = '/dashboard'}>
          <div className="logo-icon">
            <i className="fa-solid fa-warehouse"></i>
          </div>
          <div className="logo-text">
            <h1>ShelfAI</h1>
            <span className="logo-subtitle">Gestão Inteligente</span>
          </div>
        </div>
        {menuAberto && (
          <div className="close-menu-btn" onClick={toggleMenu}>
            <i className="fa-solid fa-angle-left"></i>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">Navegação</h3>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${pageName === item.name ? 'active' : ''}`}
                  title={item.description}
                >
                  <div className="nav-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-section">
          <Link to="/settings" className={`footer-btn ${pageName === 'settings' ? 'active' : ''}`} title="Configurações">
            <i className="fa-solid fa-gear"></i>
            <span>Configurações</span>
          </Link>
          <Link to="/help" className="footer-btn" title="Ajuda e Suporte">
            <i className="fa-solid fa-question-circle"></i>
            <span>Ajuda</span>
          </Link>
        </div>
        
        <div className="footer-info">
          <div className="user-status">
            <div className="status-indicator online"></div>
            <span>Online</span>
          </div>
          <div className="version-info">
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
