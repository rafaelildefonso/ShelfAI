import { Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';

interface SideBarMenuProps {
  pageName?: string;
}

export default function SideBarMenu({ pageName }: SideBarMenuProps) {
  const { menuAberto, toggleMenu, closeMenu, openMenu } = useMenu();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMinimized = window.innerWidth < 1024;

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMinimized && menuAberto && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        toggleMenu();
      }
    };

    // Add event listener when component mounts and menu is open on mobile
    if (isMinimized && menuAberto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAberto, isMinimized, toggleMenu]);

  // Close menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && menuAberto) {
        toggleMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuAberto, toggleMenu]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

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
    },
    ...(isAdmin ? [{
      path: '/admin',
      name: 'admin',
      label: 'Administração',
      icon: 'fa-solid fa-shield-halved',
      description: 'Painel de administração',
      className: 'admin-menu-item'
    }] : [])
  ];

  // Handle click on the collapsed sidebar
  const handleSidebarClick = () => {
    // Only toggle if:
    // 1. We're on mobile/tablet (screen width < 1024px)
    // 2. The menu is currently closed
    // 3. The click is directly on the sidebar container
    if (!menuAberto) {
      openMenu();
    }
  };

  return (
    <div 
      ref={sidebarRef} 
      className={`sidebar ${menuAberto ? 'open-menu' : 'closed-menu'}`}
      onClick={handleSidebarClick}
      style={{ cursor: isMinimized && !menuAberto ? 'pointer' : 'default' }}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo-menu-min">
          <div className="logo-icon">
            <img src="/icon-image.png" alt="" />
          </div>
        </div>
        <div className="sidebar-logo" onClick={(e) => {
          e.stopPropagation();
          window.location.href = '/dashboard';
        }}>
          <img src="/icon-image.png" alt="" />
          <img src="/app-icon.png" alt="" />
        </div>
        {menuAberto && (
          <div className="close-menu-btn" onClick={closeMenu}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMinimized) {
                      closeMenu();
                    }
                  }}
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

      <div className="sidebar-footer" onClick={(e) => e.stopPropagation()}>
        <div className="footer-section">
          <Link 
            to="/settings" 
            onClick={(e) => {
              e.stopPropagation();
              if (isMinimized) closeMenu();
            }} 
            className={`footer-btn ${pageName === 'settings' ? 'active' : ''}`} 
            title="Configurações"
          >
            <i className="fa-solid fa-gear"></i>
            <span>Configurações</span>
          </Link>
          <Link 
            to="/help" 
            onClick={(e) => {
              e.stopPropagation();
              if (isMinimized) closeMenu();
            }} 
            className="footer-btn" 
            title="Ajuda e Suporte"
          >
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

// Add click-outside handler for mobile menu overlay
const MobileMenuOverlay = () => {
  const { menuAberto, toggleMenu } = useMenu();
  const isMobile = window.innerWidth < 1024;

  if (!isMobile || !menuAberto) return null;

  return (
    <div 
      className="fixed inset-0 bg-black opacity-0 z-50 md:hidden"
      onClick={toggleMenu}
    />
  );
};

export { MobileMenuOverlay };
