import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { notificationService } from "../services/notificationService";
import { useMenu } from "../context/MenuContext";
import type { Product } from "../types/productType";
import type { Category } from "../services/categoryService";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  read: boolean;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleMenu } = useMenu();
  const isDarkMode = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    categories: Category[];
  }>({
    products: [],
    categories: [],
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Carregar notificações reais do backend
  useEffect(() => {
    const loadNotifications = async () => {
      // Se a aba estiver oculta, não fazer a requisição para economizar recursos
      if (document.hidden) return;

      try {
        const response = await notificationService.getNotifications({
          limit: 10,
        });
        // Mapear notificações para incluir tempo formatado
        const mappedNotifications = response.notifications.map((notif) => ({
          ...notif,
          time: notificationService.formatRelativeTime(notif.createdAt),
        }));
        setNotifications(mappedNotifications);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
        // Em caso de erro, manter array vazio
        setNotifications([]);
      }
    };

    // Carregar inicialmente
    loadNotifications();

    // Configurar intervalo de 30 segundos
    const interval = setInterval(loadNotifications, 30000);

    // Listener para quando a aba voltar a ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNotifications(); // Carregar imediatamente ao voltar
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleDarkMode = toggleTheme;

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  // Debounce search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length === 0) {
        setSearchResults({ products: [], categories: [] });
        setShowSearchResults(false);
        return;
      }

      const lowerQuery = searchQuery.toLocaleLowerCase();
      try {
        // Parallel fetch for better performance
        const [productsResponse, categoriesData] = await Promise.all([
          getProducts(),
          categoryService.list(),
        ]);

        const productsResults = productsResponse.data
          .filter((p) => p.name.toLocaleLowerCase().includes(lowerQuery))
          .slice(0, 3); // Top 3 products

        const categoriesResults = categoriesData
          .filter((c) => c.name.toLocaleLowerCase().includes(lowerQuery))
          .slice(0, 3); // Top 3 categories

        setSearchResults({
          products: productsResults,
          categories: categoriesResults,
        });
        setShowSearchResults(true);
      } catch (err) {
        setSearchResults({ products: [], categories: [] });
        setShowSearchResults(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${searchQuery}`);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({ products: [], categories: [] });
    setShowSearchResults(false);
  };

  const handleProductClick = (id: string) => {
    navigate(`/products/${id}`);
    setShowSearchResults(false);
  };

  const handleCategoryClick = (id: string) => {
    navigate(`/search?categoryId=${id}`);
    setShowSearchResults(false);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    switch (path) {
      case "/dashboard":
        return { current: "Dashboard", parent: null };
      case "/products":
        return { current: "Produtos", parent: "Dashboard" };
      case "/import":
        return { current: "Importar", parent: "Dashboard" };
      case "/export":
        return { current: "Exportar", parent: "Dashboard" };
      case "/settings":
        return { current: "Configurações", parent: "Dashboard" };
      case "/search":
        return { current: "Busca", parent: "Dashboard" };
      default:
        return { current: "Dashboard", parent: null };
    }
  };

  const breadcrumb = getBreadcrumb();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="toggle-menu">
          <button
            className="menu-btn"
            onClick={toggleMenu}
            aria-label={isDarkMode ? "Abrir menu" : "Fechar menu"}
            aria-expanded={false} // This assumes menu state isn't tracked here for expansion, but strictly it refers to sidebar.
          >
            <i className="fa-solid fa-bars" aria-hidden="true"></i>
          </button>
        </div>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.parent && (
            <>
              <span className="breadcrumb-item">{breadcrumb.parent}</span>
              <i
                className="fa-solid fa-chevron-right breadcrumb-separator"
                aria-hidden="true"
              ></i>
            </>
          )}
          <span className="breadcrumb-item current" aria-current="page">
            {breadcrumb.current}
          </span>
        </nav>
      </div>

      <div className="header-center">
        <div className="search-container" ref={searchRef}>
          <i className="fa-solid fa-search search-icon" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Buscar produtos, categorias..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setShowSearchResults(searchQuery.length > 0)}
            aria-label="Buscar produtos e categorias"
            aria-expanded={showSearchResults}
            aria-controls="search-results-list"
            aria-autocomplete="list"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={clearSearch}
              title="Limpar busca"
              aria-label="Limpar busca"
            >
              <i className="fa-solid fa-times" aria-hidden="true"></i>
            </button>
          )}

          {showSearchResults && (
            <div
              className="search-results"
              id="search-results-list"
              role="listbox"
            >
              <div className="search-results-header">
                <span>Resultados para "{searchQuery}"</span>
                <button onClick={clearSearch} aria-label="Fechar resultados">
                  <i className="fa-solid fa-times" aria-hidden="true"></i>
                </button>
              </div>
              <div className="search-results-content">
                {searchResults.products.length === 0 &&
                searchResults.categories.length === 0 ? (
                  <div className="search-no-results">
                    <i className="fa-solid fa-search" aria-hidden="true"></i>
                    <p>Nenhum resultado encontrado</p>
                    <span>Tente usar termos diferentes</span>
                  </div>
                ) : (
                  <>
                    {searchResults.products.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-title">
                          <i className="fa-solid fa-box" aria-hidden="true"></i>{" "}
                          Produtos
                        </div>
                        {searchResults.products.map((product) => (
                          <div
                            key={product.id}
                            className="search-result-item clickable"
                            onClick={() => handleProductClick(product.id)}
                            role="option"
                            tabIndex={0}
                            aria-selected={false}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleProductClick(product.id);
                              }
                            }}
                          >
                            <div className="result-image-container">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt="" // Decorative in this context as name is next to it
                                  className="result-image"
                                />
                              ) : (
                                <div className="result-image-placeholder">
                                  <i
                                    className="fa-solid fa-image"
                                    aria-hidden="true"
                                  ></i>
                                </div>
                              )}
                            </div>
                            <div className="result-info">
                              <span className="result-name">
                                {product.name}
                              </span>
                              <span className="result-price">
                                R$ {product.price?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.categories.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-title">
                          <i
                            className="fa-solid fa-tags"
                            aria-hidden="true"
                          ></i>{" "}
                          Categorias
                        </div>
                        {searchResults.categories.map((category) => (
                          <div
                            key={category.id}
                            className="search-result-item clickable"
                            onClick={() => handleCategoryClick(category.id)}
                            role="option"
                            tabIndex={0}
                            aria-selected={false}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleCategoryClick(category.id);
                              }
                            }}
                          >
                            <div className="result-info">
                              <span className="result-name">
                                {category.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      className="search-view-all"
                      onClick={() => {
                        navigate(`/search?q=${searchQuery}`);
                        setShowSearchResults(false);
                      }}
                      role="button"
                    >
                      Ver todos os resultados
                      <i
                        className="fa-solid fa-arrow-right"
                        aria-hidden="true"
                      ></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="notifications-container" ref={notificationsRef}>
            <button
              className="action-btn notifications-btn"
              title="Notificações"
              aria-label={`Notificações ${
                unreadNotifications > 0
                  ? `, ${unreadNotifications} não lidas`
                  : ""
              }`}
              onClick={toggleNotifications}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <i className="fa-solid fa-bell" aria-hidden="true"></i>
              {unreadNotifications > 0 && (
                <div className="notification-badge" aria-hidden="true"></div>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown" aria-live="polite">
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
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          !notification.read ? "unread" : ""
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${notification.title}: ${notification.message}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            markNotificationAsRead(notification.id);
                          }
                        }}
                      >
                        <div
                          className={`notification-icon ${notification.type}`}
                        >
                          <i
                            className={`fa-solid ${
                              notification.type === "success"
                                ? "fa-check"
                                : notification.type === "warning"
                                ? "fa-exclamation"
                                : notification.type === "error"
                                ? "fa-times"
                                : "fa-info"
                            }`}
                            aria-hidden="true"
                          ></i>
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activities flex justify-center items-center flex-col gap-5 my-5">
                      <i
                        className="fa-solid fa-inbox text-(--text-secondary-color)"
                        style={{ fontSize: 50 }}
                        aria-hidden="true"
                      ></i>
                      <p className="text-(--text-secondary-color)">
                        Nenhuma atividade recente
                      </p>
                    </div>
                  )}
                </div>
                <div className="notifications-footer">
                  <Link
                    to="/notifications"
                    className="view-all-btn"
                    onClick={toggleNotifications}
                  >
                    Ver todas as notificações
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="user-profile" ref={userMenuRef}>
          <div
            className="user-profile-trigger"
            onClick={toggleUserMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault(); // Prevent page scroll
                toggleUserMenu();
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
            }}
            role="button"
            tabIndex={0}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-label="Menu de usuário"
          >
            <div className="user-initial" aria-hidden="true">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Usuário"}</span>
            </div>
            <button className="user-menu-btn" tabIndex={-1} aria-hidden="true">
              <i
                className={`fa-solid fa-chevron-down ${
                  showUserMenu ? "rotated" : ""
                }`}
              ></i>
            </button>
          </div>

          {showUserMenu && (
            <div
              className="user-menu-dropdown"
              onClick={(e) => e.stopPropagation()}
              role="menu"
            >
              <div className="user-menu-header">
                <div className="user-menu-initial" aria-hidden="true">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="user-menu-info">
                  <div className="user-menu-name">
                    {user?.name || "Usuário"}
                  </div>
                  <div className="user-menu-email">
                    {user?.email || "usuario@exemplo.com"}
                  </div>
                </div>
              </div>
              <div className="user-menu-divider" role="separator"></div>
              <div className="user-menu-items">
                <Link
                  to="/reports"
                  className="user-menu-item"
                  role="menuitem"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-solid fa-chart-line" aria-hidden="true"></i>
                  <span>Relatórios</span>
                </Link>
                <Link to="/settings">
                  <button className="user-menu-item" role="menuitem">
                    <i className="fa-solid fa-gear" aria-hidden="true"></i>
                    <span>Configurações</span>
                  </button>
                </Link>
              </div>
              <div className="user-menu-divider" role="separator"></div>
              <div className="user-menu-items">
                <Link
                  to="/help"
                  className="user-menu-item"
                  role="menuitem"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i
                    className="fa-solid fa-question-circle"
                    aria-hidden="true"
                  ></i>
                  <span>Ajuda</span>
                </Link>
                <button
                  className="user-menu-item"
                  onClick={toggleDarkMode}
                  role="menuitem"
                >
                  <i
                    className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"}`}
                    aria-hidden="true"
                  ></i>
                  <span>{isDarkMode ? "Modo claro" : "Modo escuro"}</span>
                </button>
                <Link
                  to="/support"
                  className="user-menu-item"
                  role="menuitem"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-solid fa-comments" aria-hidden="true"></i>
                  <span>Suporte</span>
                </Link>
                <button
                  className="user-menu-item logout"
                  onClick={logout}
                  role="menuitem"
                >
                  <i
                    className="fa-solid fa-sign-out-alt"
                    aria-hidden="true"
                  ></i>
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
