import React, { useState, useRef } from "react";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
const IMPORT_TYPES = [
  {
    id: "csv",
    label: "CSV Padrão",
    description: "Importe produtos usando um arquivo CSV genérico.",
    icon: "fa-solid fa-file-csv",
    templateUrl: "/api/v1/template/csv",
  },
  {
    id: "excel",
    label: "Excel (.xlsx)",
    description: "Importe produtos usando uma planilha Excel.",
    icon: "fa-solid fa-file-excel",
    templateUrl: "/api/v1/template/excel",
  },
  {
    id: "mercadolivre",
    label: "Mercado Livre",
    description: "Importe usando o template oficial do Mercado Livre.",
    icon: "fa-solid fa-handshake",
  },
];

const ImportScreen = () => {
  const [importType, setImportType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus("idle");
      setMessage("");
      setResult(null);
    }
  };

  const openFileDialog = (e?: React.MouseEvent) => {
    e?.preventDefault();
    fileInputRef.current?.click();
  };

  const removeFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTypeSelect = (type: string) => {
    setImportType(type);
    setFile(null);
    setStatus("idle");
    setMessage("");
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const typeObj = IMPORT_TYPES.find((t) => t.id === importType);
    if (typeObj) {
      window.open(typeObj.templateUrl, "_blank");
    }
  };

  const handleUpload = async () => {
    if (!file || !importType) return;
    setStatus("uploading");
    setMessage("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/v1/import/${importType}`, {
        method: "POST",
        headers: { Authorization: "Bearer demo-token" },
        body: formData,
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setStatus("success");
      setMessage(data.message || "Importação concluída!");
      setResult(data);
    } catch (err: any) {
      setMessage(err?.error?.message || "Erro ao importar arquivo.");
    }
  };

  return (
    <div className="app-container">
      <Header />
      <SideBarMenu pageName="import" />
      <main className="app-main">
        <div className="import-container">
          <div className="import-header">
            <h1>Importar Produtos</h1>
            <p>
              Arraste e solte seu arquivo ou clique para selecionar. Depois
              escolha o tipo de importação.
            </p>
          </div>

          {/* Área de Drag-and-Drop */}
          <div
            className={`import-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={importType === "excel" ? ".xlsx,.xls" : ".csv,.xlsx,.xls"}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <p>
              {file
                ? file.name
                : isDragging
                ? "Solte o arquivo para importar"
                : "Arraste e solte o arquivo aqui ou clique para selecionar"}
            </p>
            {file && (
              <button
                type="button"
                className="import-btn secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(e);
                }}
              >
                <i className="fa-solid fa-trash"></i> Remover arquivo
              </button>
            )}
          </div>

          {/* Opções de tipo de importação */}
          <h2>Selecione o tipo de importação</h2>
          <div className="import-options">
            <div className="import-type-selector">
              {IMPORT_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`import-card ${
                    importType === type.id ? "selected" : ""
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <div className="import-type-card">
                    <div className="import-icon">
                      <i className={type.icon}></i>
                    </div>
                    <div className="import-content">
                      <h3>{type.label}</h3>
                      <p>{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção de ações */}
          <div className="import-step-section">
            <button
              className="import-btn primary"
              onClick={handleUpload}
              disabled={!file || !importType || status === "uploading"}
            >
              {status === "uploading" ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Importando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-upload"></i> Importar Produtos
                </>
              )}
            </button>

            <button
              className="import-btn secondary"
              onClick={handleDownloadTemplate}
              disabled={!importType}
            >
              <i className="fa-solid fa-download"></i> Baixar Template
            </button>

            {file && (
              <span className="import-filename">
                <i className="fa-solid fa-file"></i> {file.name}
              </span>
            )}
          </div>

          {/* Mensagens de status */}
          {status === "success" && (
            <div className="import-success">
              <i className="fa-solid fa-circle-check"></i> {message}
              {result && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p>Produtos importados: {result.imported || 0}</p>
                  {result.errors && result.errors.length > 0 && (
                    <p>Erros: {result.errors.length}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="import-error">
              <i className="fa-solid fa-circle-exclamation"></i> {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImportScreen;
