import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCategories, getProducts } from '../services/productService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

export default function Header() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: 0, categories: 0, users: 0 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Importação Concluída',
      message: '50 produtos foram importados com sucesso',
      type: 'success',
      time: '2 min atrás',
      read: false
    },
    {
      id: '2',
      title: 'Produto Incompleto',
      message: 'Produto "Camiseta Azul" está sem descrição',
      type: 'warning',
      time: '1 hora atrás',
      read: false
    },
    {
      id: '3',
      title: 'Exportação para Shopify',
      message: 'Exportação para Shopify foi concluída',
      type: 'info',
      time: '3 horas atrás',
      read: true
    }
  ]);
  

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    let productsResults = getProducts().filter((p) => p.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())).length;
    let categoriesResults = getCategories().filter((c) => c.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())).length;
    setSearchResults({
      products: productsResults,
      categories: categoriesResults,
      users: 0
    });
    setShowSearchResults(e.target.value.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return { current: 'Dashboard', parent: null };
      case '/products':
        return { current: 'Produtos', parent: 'Dashboard' };
      case '/import':
        return { current: 'Importar', parent: 'Dashboard' };
      case '/export':
        return { current: 'Exportar', parent: 'Dashboard' };
      case '/settings':
        return { current: 'Configurações', parent: 'Dashboard' };
      default:
        return { current: 'Dashboard', parent: null };
    }
  };

  const breadcrumb = getBreadcrumb();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header fixed top-0 left-[280px] right-0 h-[70px] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 z-[999] shadow">
      <div className="header-left">
        <div className="breadcrumb">
          {breadcrumb.parent && (
            <>
              <span className="breadcrumb-item">{breadcrumb.parent}</span>
              <i className="fa-solid fa-chevron-right breadcrumb-separator"></i>
            </>
          )}
          <span className="breadcrumb-item current">{breadcrumb.current}</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="search-container" ref={searchRef}>
          <i className="fa-solid fa-search search-icon"></i>
          <input 
            type="text" 
            placeholder="Buscar produtos, categorias..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSearchResults(searchQuery.length > 0)}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={clearSearch}
              title="Limpar busca"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
          
          {showSearchResults && (
            <div className="search-results">
              <div className="search-results-header">
                <span>Resultados para "{searchQuery}"</span>
                <button onClick={clearSearch}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <div className="search-results-content">
                <div className="search-result-item">
                  <i className="fa-solid fa-box"></i>
                  <div>
                    <span className="result-title">Produtos</span>
                    <span className="result-count">{searchResults.products} encontrados</span>
                  </div>
                </div>
                <div className="search-result-item">
                  <i className="fa-solid fa-tags"></i>
                  <div>
                    <span className="result-title">Categorias</span>
                    <span className="result-count">{searchResults.categories} encontradas</span>
                  </div>
                </div>
                <div className="search-result-item">
                  <i className="fa-solid fa-user"></i>
                  <div>
                    <span className="result-title">Usuários</span>
                    <span className="result-count">1 encontrado</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-actions">
          <button 
            className="action-btn theme-toggle"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          
          <div className="notifications-container" ref={notificationsRef}>
            <button 
              className="action-btn notifications-btn" 
              title="Notificações"
              onClick={toggleNotifications}
            >
              <i className="fa-solid fa-bell"></i>
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notificações</h3>
                  {unreadNotifications > 0 && (
                    <button 
                      className="mark-all-read"
                      onClick={markAllNotificationsAsRead}
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        <i className={`fa-solid ${
                          notification.type === 'success' ? 'fa-check' :
                          notification.type === 'warning' ? 'fa-exclamation' :
                          notification.type === 'error' ? 'fa-times' :
                          'fa-info'
                        }`}></i>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notifications-footer">
                  <button className="view-all-btn">Ver todas as notificações</button>
                </div>
              </div>
            )}
          </div>
          
          <button className="action-btn help-btn" title="Ajuda">
            <i className="fa-solid fa-question-circle"></i>
          </button>
        </div>
        
        <div className="user-profile" ref={userMenuRef}>
          <div className="user-avatar-container">
            <img
              src="https://static.vecteezy.com/ti/fotos-gratis/p1/26409361-jaqueta-homem-bege-a-moda-estilo-retrato-pessoa-africano-modelo-americano-preto-moda-foto.jpg"
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-status-indicator"></div>
          </div>
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">Administrador</span>
          </div>
          <button className="user-menu-btn" onClick={toggleUserMenu}>
            <i className={`fa-solid fa-chevron-down ${showUserMenu ? 'rotated' : ''}`}></i>
          </button>
          
          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="user-menu-avatar">
                  <img
                    src="https://static.vecteezy.com/ti/fotos-gratis/p1/26409361-jaqueta-homem-bege-a-moda-estilo-retrato-pessoa-africano-modelo-americano-preto-moda-foto.jpg"
                    alt="User Avatar"
                  />
                </div>
                <div className="user-menu-info">
                  <div className="user-menu-name">John Doe</div>
                  <div className="user-menu-email">john.doe@empresa.com</div>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-items">
                <button className="user-menu-item">
                  <i className="fa-solid fa-user"></i>
                  <span>Meu Perfil</span>
                </button>
                <button className="user-menu-item">
                  <i className="fa-solid fa-gear"></i>
                  <span>Configurações</span>
                </button>
                <button className="user-menu-item">
                  <i className="fa-solid fa-bell"></i>
                  <span>Notificações</span>
                </button>
                <button className="user-menu-item">
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Relatórios</span>
                </button>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-items">
                <button className="user-menu-item">
                  <i className="fa-solid fa-question-circle"></i>
                  <span>Ajuda</span>
                </button>
                <button className="user-menu-item">
                  <i className="fa-solid fa-comments"></i>
                  <span>Suporte</span>
                </button>
                <button className="user-menu-item logout">
                  <i className="fa-solid fa-sign-out-alt"></i>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
