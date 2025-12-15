import { useState, useEffect } from "react";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import {
  notificationService,
  type Notification,
} from "../services/notificationService";
import "./../App.css";

interface NotificationDisplay extends Notification {
  time: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({
        limit: 50, // Load more for the full page
        read: filter === "unread" ? false : undefined,
      });

      const mappedNotifications = response.notifications.map((notif) => ({
        ...notif,
        time: notificationService.formatRelativeTime(notif.createdAt),
      }));
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

  return (
    <div>
      <Header />
      <SideBarMenu pageName="notifications" />

      <main className="app-main">
        <div className="products-container" style={{ padding: "0" }}>
          {" "}
          {/* Reusing container style but resetting padding if needed via inline or class */}
          <div className="products-header">
            <div className="page-title">
              <h1>Notificações</h1>
              <p>Acompanhe todas as atividades da sua conta</p>
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="add-product-btn secondary"
                style={{
                  backgroundColor: "var(--surface-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <i className="fa-solid fa-check-double"></i>
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="products-controls">
            <div className="filter-controls">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Todas
              </button>
              <button
                className={`filter-btn ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Não lidas
              </button>
            </div>
          </div>
          <div
            className="notifications-page-list"
            style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {loading ? (
              <div
                className="loading-state"
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary-color)",
                }}
              >
                <i
                  className="fa-solid fa-spinner fa-spin"
                  style={{ fontSize: "2rem", marginBottom: "1rem" }}
                ></i>
                <p>Carregando notificações...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  backgroundColor: "var(--surface-color)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <i
                  className="fa-solid fa-bell-slash"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-secondary-color)",
                    marginBottom: "1rem",
                    opacity: "0.5",
                  }}
                ></i>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Nenhuma notificação encontrada
                </h3>
                <p style={{ color: "var(--text-secondary-color)" }}>
                  Você está em dia com suas atividades
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${
                    !notification.read ? "unread" : ""
                  }`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.5rem",
                    backgroundColor: "var(--surface-color)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left Border for Unread */}
                  {!notification.read && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        backgroundColor: "var(--accent-color)",
                      }}
                    ></div>
                  )}

                  <div
                    className={`notification-icon ${notification.type}`}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                      backgroundColor:
                        notification.type === "success"
                          ? "rgba(16, 185, 129, 0.1)"
                          : notification.type === "warning"
                          ? "rgba(245, 158, 11, 0.1)"
                          : notification.type === "error"
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(59, 130, 246, 0.1)",
                      color:
                        notification.type === "success"
                          ? "var(--success-color)"
                          : notification.type === "warning"
                          ? "var(--warning-color)"
                          : notification.type === "error"
                          ? "var(--error-color)"
                          : "#3b82f6",
                    }}
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
                    ></i>
                  </div>

                  <div className="notification-content" style={{ flex: 1 }}>
                    <div
                      className="notification-header"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          margin: 0,
                          color: "var(--text-color)",
                        }}
                      >
                        {notification.title}
                      </h3>
                      <span
                        className="notification-time"
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary-color)",
                        }}
                      >
                        {notification.time}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary-color)",
                        fontSize: "0.9rem",
                        lineHeight: "1.5",
                      }}
                    >
                      {notification.message}
                    </p>
                  </div>

                  <div
                    className="notification-actions"
                    style={{ display: "flex", gap: "0.5rem" }}
                  >
                    {!notification.read && (
                      <button
                        title="Marcar como lida"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="icon-btn"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-color)",
                          background: "transparent",
                          color: "var(--text-secondary-color)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    <button
                      title="Excluir"
                      onClick={() => handleDelete(notification.id)}
                      className="icon-btn delete"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        background: "transparent",
                        color: "var(--text-secondary-color)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
