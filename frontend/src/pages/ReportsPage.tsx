import { useState } from "react";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import "./../App.css";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div>
      <Header />
      <SideBarMenu />

      <main className="app-main">
        <div className="products-container" style={{ padding: 0 }}>
          <div className="products-header">
            <div className="page-title">
              <h1>Relatórios</h1>
              <p>Análises detalhadas do desempenho da sua loja</p>
            </div>
            <button
              className="add-product-btn secondary"
              style={{
                backgroundColor: "var(--surface-color)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            >
              <i className="fa-solid fa-download"></i> Exportar Dados
            </button>
          </div>

          <div className="reports-container" style={{ marginTop: "2rem" }}>
            <div
              className="tabs-container"
              style={{
                borderBottom: "1px solid var(--border-color)",
                marginBottom: "2rem",
                display: "flex",
                gap: "2rem",
              }}
            >
              {["sales", "inventory", "activities"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "1rem 0.5rem",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid var(--accent-color)"
                        : "2px solid transparent",
                    color:
                      activeTab === tab
                        ? "var(--accent-color)"
                        : "var(--text-secondary-color)",
                    cursor: "pointer",
                    fontWeight: activeTab === tab ? "600" : "500",
                    fontSize: "1rem",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "sales"
                    ? "Vendas"
                    : tab === "inventory"
                    ? "Estoque"
                    : "Atividades"}
                </button>
              ))}
            </div>

            <div
              className="report-content-placeholder"
              style={{
                padding: "5rem 2rem",
                textAlign: "center",
                background: "var(--surface-color)",
                borderRadius: "16px",
                border: "1px dashed var(--border-color)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "var(--accent-color)",
                }}
              >
                <i
                  className={`fa-solid ${
                    activeTab === "sales"
                      ? "fa-chart-bar"
                      : activeTab === "inventory"
                      ? "fa-boxes-stacked"
                      : "fa-clipboard-list"
                  }`}
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  color: "var(--text-color)",
                }}
              >
                Relatórios de{" "}
                {activeTab === "sales"
                  ? "Vendas"
                  : activeTab === "inventory"
                  ? "Estoque"
                  : "Atividades"}{" "}
                em Desenvolvimento
              </h2>
              <p
                style={{
                  color: "var(--text-secondary-color)",
                  maxWidth: "500px",
                  margin: "0 auto 2rem",
                  lineHeight: "1.6",
                }}
              >
                Estamos trabalhando para trazer análises profundas e insights
                valiosos para o seu negócio. Em breve você terá acesso a
                gráficos completos e métricas detalhadas.
              </p>
              <button
                className="add-product-btn"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Voltar para Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
