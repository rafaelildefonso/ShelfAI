import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { buildApiPath } from "../config/api";

const MainContent = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [currentExport, setCurrentExport] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    if (!token) {
      setStatus("error");
      setMessage("Usuário não autenticado");
      return;
    }

    setStatus("downloading");
    setCurrentExport(format);
    setMessage("");
    try {
      // Para CSV e Excel, endpoint é igual, só muda o nome do arquivo
      const endpoint = buildApiPath('/api/v1/import-export/export');
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw await res.json();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `produtos_exportados.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setStatus("success");
      setMessage("Exportação concluída!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.error?.message || "Erro ao exportar produtos.");
    } finally {
      setCurrentExport(null);
    }
  };

  const exportOptions = [
    {
      name: "Shopify",
      icon: "fa-brands fa-shopify",
      description: "Exporte para sua loja Shopify",
    },
    {
      name: "Amazon",
      icon: "fa-brands fa-amazon",
      description: "Exporte para Amazon Marketplace",
    },
    {
      name: "CSV",
      icon: "fa-solid fa-file-csv",
      description: "Exporte em formato CSV",
    },
    {
      name: "Excel",
      icon: "fa-solid fa-file-excel",
      description: "Exporte em formato Excel",
    },
    {
      name: "Shopee",
      icon: "fa-solid fa-bag-shopping",
      description: "Exporte em formato Excel",
    },
    {
      name: "Mercado Livre",
      icon: "fa-solid fa-handshake",
      description: "Exporte em formato Excel",
    },
    {
      name: "Aliexpress",
      icon: "fa-solid fa-store",
      description: "Exporte em formato Excel",
    },
  ];
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
          {exportOptions.map((option) => (
            <div className="export-card" key={option.name}>
              <div className="export-icon">
                <i className={option.icon}></i>
              </div>
              <div className="export-content">
                <h3>{option.name}</h3>
                <p>{option.description}</p>
                <button
                  className="export-btn"
                  onClick={() => handleExport(option.name)}
                  disabled={
                    status === "downloading" && currentExport !== option.name
                  }
                >
                  {status === "downloading" && currentExport === option.name
                    ? "Exportando..."
                    : "Exportar"}
                </button>
              </div>
            </div>
          ))}
          {status === "error" && <div className="export-error">{message}</div>}
        </div>
      </div>
    </main>
  );
};

const ExportScreen = () => {
  return (
    <div>
      <Header />
      <SideBarMenu pageName="export" />
      <MainContent />
    </div>
  );
};

export default ExportScreen;
