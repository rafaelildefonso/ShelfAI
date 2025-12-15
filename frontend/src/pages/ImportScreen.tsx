import React, { useState, useRef } from "react";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import ColumnMapper from "../components/ColumnMapper";
import TablePreview from "../components/TablePreview";
import TemplateManager from "../components/TemplateManager";
import {
  importService,
  type ImportPreview,
  type ImportTemplate,
  PRODUCT_FIELDS,
} from "../services/importService";
import { useProducts } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { convertJsonFileToCsv, downloadSampleFile } from "../utils/fileUtils";

interface ImportStep {
  id: "upload" | "preview" | "mapping" | "confirm";
  title: string;
  description: string;
}

const IMPORT_STEPS: ImportStep[] = [
  { id: "upload", title: "Upload", description: "Selecione o arquivo" },
  { id: "preview", title: "Preview", description: "Visualize os dados" },
  { id: "mapping", title: "Mapeamento", description: "Configure as colunas" },
  { id: "confirm", title: "Confirmação", description: "Revise e importe" },
];

const ImportScreen = () => {
  // Estados principais
  const [currentStep, setCurrentStep] = useState<
    "upload" | "preview" | "mapping" | "confirm"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "xlsx" | "json">("csv");
  const [displayFileName, setDisplayFileName] = useState<string>("");
  const [delimiter, setDelimiter] = useState(",");
  const [isDragging, setIsDragging] = useState(false);

  // Estados para preview e mapeamento
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [selectedTemplate, setSelectedTemplate] =
    useState<ImportTemplate | null>(null);

  // Estados para importação
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  // Estados para loading
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { reload } = useProducts();
  const navigate = useNavigate();

  // Funções de drag and drop
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setError("");
    setDisplayFileName(selectedFile.name);

    // Determinar tipo de arquivo
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    let fileToProcess = selectedFile;
    let newFileType: "csv" | "xlsx" | "json" = "csv"; // Default fallback

    if (extension === "json") {
      try {
        fileToProcess = await convertJsonFileToCsv(selectedFile);
        newFileType = "json"; // UI shows JSON, logic treats as converted CSV
      } catch (err: any) {
        setError(err.message || "Erro ao processar arquivo JSON");
        return;
      }
    } else if (extension === "xlsx" || extension === "xls") {
      newFileType = "xlsx";
    } else {
      newFileType = "csv";
    }

    setFile(fileToProcess);
    setFileType(newFileType);

    // Resetar estados
    setPreviewData(null);
    setMapping({});
    setSelectedTemplate(null);
    setCurrentStep("upload");
    setStatus("idle");
    setMessage("");
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFile(null);
    setDisplayFileName("");
    setPreviewData(null);
    setMapping({});
    setSelectedTemplate(null);
    setCurrentStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTestPreview = async () => {
    if (!file) return;

    try {
      setError("");
      setPreviewLoading(true);
      const preview = await importService.previewTest(file);
      setPreviewData(preview);
      setMapping(preview.suggestedMapping || {});
      setCurrentStep("preview");
    } catch (err: any) {
      setError(`Test Preview: ${err.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTestXlsxSimple = async () => {
    if (!file) return;

    try {
      setError("");
      setPreviewLoading(true);
      const preview = await importService.testXlsxSimple(file);
      setPreviewData(preview);
      setMapping(preview.suggestedMapping || {});
      setCurrentStep("preview");
    } catch (err: any) {
      setError(`Test XLSX Simple: ${err.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };
  const handleProceedToMapping = () => {
    setCurrentStep("mapping");
  };

  // Função para voltar ao preview
  const handleBackToPreview = () => {
    setCurrentStep("preview");
  };

  // Função para atualizar mapeamento
  const handleMappingChange = (field: string, column: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: column,
    }));
  };

  // Função para prosseguir para confirmação
  const handleProceedToConfirm = () => {
    setCurrentStep("confirm");
  };

  // Função para voltar ao mapeamento
  const handleBackToMapping = () => {
    setCurrentStep("mapping");
  };

  // Função para importar
  const handleImport = async () => {
    if (!file || !previewData) return;

    try {
      setLoading(true);
      setStatus("uploading");
      setError("");

      const importResult = await importService.importProducts(file, mapping, {
        saveTemplate,
        templateName: saveTemplate ? templateName : undefined,
        templateDescription: saveTemplate ? templateDescription : undefined,

        delimiter:
          fileType === "csv" || fileType === "json" ? delimiter : undefined,
      });

      setResult(importResult);
      setStatus("success");
      setMessage(
        `Importação concluída: ${importResult.imported} produtos importados!`
      );

      // Atualizar contexto de produtos para refletir as mudanças
      await reload();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Erro ao importar produtos");
    } finally {
      setLoading(false);
    }
  };

  // Função para resetar tudo
  const handleReset = () => {
    setFile(null);
    setDisplayFileName("");
    setPreviewData(null);
    setMapping({});
    setSelectedTemplate(null);
    setCurrentStep("upload");
    setStatus("idle");
    setMessage("");
    setResult(null);
    setError("");
    setSaveTemplate(false);
    setTemplateName("");
    setTemplateDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getCurrentStepIndex = () => {
    return IMPORT_STEPS.findIndex((step) => step.id === currentStep);
  };

  const canProceed = () => {
    const requiredFields = PRODUCT_FIELDS.filter((field) => field.required);
    const mappedRequiredFields = requiredFields.filter(
      (field) => mapping[field.key]
    );

    return mappedRequiredFields.length === requiredFields.length;
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
              Importe produtos de arquivos CSV ou Excel com mapeamento
              personalizado de colunas.
            </p>
          </div>

          <div className="relative mb-6 flex justify-end">
            <button
              className="btn btn-outline flex items-center gap-2"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            >
              <i className="fa-solid fa-download"></i>
              Baixar Modelo / Template
              <i className="fa-solid fa-chevron-down text-xs ml-1"></i>
            </button>

            {showDownloadMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    downloadSampleFile("csv");
                    setShowDownloadMenu(false);
                  }}
                >
                  <i className="fa-solid fa-file-csv text-green-600"></i> Modelo
                  CSV
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    downloadSampleFile("xlsx");
                    setShowDownloadMenu(false);
                  }}
                >
                  <i className="fa-solid fa-file-excel text-green-600"></i>{" "}
                  Modelo Excel
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    downloadSampleFile("json");
                    setShowDownloadMenu(false);
                  }}
                >
                  <i className="fa-solid fa-code text-blue-600"></i> Modelo JSON
                </button>
              </div>
            )}
          </div>

          {/* Indicador de progresso */}
          <div className="import-progress">
            {IMPORT_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`progress-step ${
                  index <= getCurrentStepIndex() ? "active" : ""
                } ${currentStep === step.id ? "current" : ""}`}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Área de upload */}
          {currentStep === "upload" && (
            <div className="upload-section">
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
                  accept=".csv,.xlsx,.xls,.json"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <div className="dropzone-content">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <p>
                    {file
                      ? `Arquivo selecionado: ${displayFileName}`
                      : isDragging
                      ? "Solte o arquivo para importar"
                      : "Arraste e solte o arquivo aqui ou clique para selecionar"}
                  </p>
                  {file && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(e);
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> Remover arquivo
                    </button>
                  )}
                </div>
              </div>

              {/* Configurações do arquivo */}
              {file && (
                <div className="file-config">
                  <div className="config-header">
                    <h3>Configurações do Arquivo</h3>
                    <div className="file-info">
                      <span className="file-name">{displayFileName}</span>
                      <span className="file-size">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>

                  <div className="config-grid">
                    <div className="config-group">
                      <label>Tipo de Arquivo</label>
                      <div className="file-type-display">
                        <i
                          className={`fa-solid ${
                            fileType === "csv"
                              ? "fa-file-csv"
                              : fileType === "xlsx"
                              ? "fa-file-excel"
                              : "fa-file-code"
                          }`}
                        ></i>
                        <span>{fileType.toUpperCase()}</span>
                      </div>
                    </div>

                    {(fileType === "csv" || fileType === "json") && (
                      <div className="config-group">
                        <label>Delimitador</label>
                        <select
                          value={delimiter}
                          onChange={(e) => setDelimiter(e.target.value)}
                          className="config-select"
                        >
                          <option value=",">Vírgula (,)</option>
                          <option value=";">Ponto e vírgula (;)</option>
                          <option value="	">Tabulação</option>
                        </select>
                      </div>
                    )}

                    <div className="config-group full-width">
                      <label>Template (opcional)</label>
                      <TemplateManager
                        onTemplateSelect={setSelectedTemplate}
                        selectedTemplateId={selectedTemplate?.id}
                        fileType={fileType}
                      />
                    </div>
                  </div>

                  <div className="config-actions">
                    <button
                      className="btn btn-outline"
                      onClick={handleTestXlsxSimple}
                      disabled={previewLoading}
                    >
                      <i className="fa-solid fa-file-excel"></i> Test XLSX
                      Simple
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleTestPreview}
                      disabled={previewLoading}
                    >
                      {previewLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                          Gerando preview...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-eye"></i> Visualizar Dados
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview dos dados */}
          {currentStep === "preview" && previewData && (
            <div className="preview-section">
              <div className="section-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentStep("upload")}
                >
                  <i className="fa-solid fa-arrow-left"></i> Voltar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleProceedToMapping}
                >
                  <i className="fa-solid fa-arrow-right"></i> Configurar
                  Mapeamento
                </button>
              </div>

              <TablePreview
                headers={previewData.headers}
                data={previewData.preview}
                validationErrors={previewData.validationErrors}
              />
            </div>
          )}

          {/* Mapeamento de colunas */}
          {currentStep === "mapping" && previewData && (
            <div className="mapping-section">
              <div className="section-actions">
                <button
                  className="btn btn-outline"
                  onClick={handleBackToPreview}
                >
                  <i className="fa-solid fa-arrow-left"></i> Voltar ao Preview
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleProceedToConfirm}
                  disabled={!canProceed()}
                >
                  <i className="fa-solid fa-arrow-right"></i> Confirmar
                  Importação
                </button>
              </div>

              <ColumnMapper
                headers={previewData.headers}
                suggestedMapping={previewData.suggestedMapping}
                mapping={mapping}
                onMappingChange={handleMappingChange}
                validationErrors={previewData.validationErrors}
              />
            </div>
          )}

          {/* Confirmação e importação */}
          {currentStep === "confirm" && previewData && (
            <div className="confirm-section">
              <div className="section-actions">
                <button
                  className="btn btn-outline"
                  onClick={handleBackToMapping}
                >
                  <i className="fa-solid fa-arrow-left"></i> Voltar ao
                  Mapeamento
                </button>
              </div>

              <div className="confirm-content">
                <div className="import-summary">
                  <h3>Resumo da Importação</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Arquivo:</span>
                      <span className="summary-value">{displayFileName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total de linhas:</span>
                      <span className="summary-value">
                        {previewData.totalRows}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Campos mapeados:</span>
                      <span className="summary-value">
                        {Object.values(mapping).filter((col) => col).length}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">
                        Campos obrigatórios:
                      </span>
                      <span className="summary-value">
                        {
                          PRODUCT_FIELDS.filter(
                            (field) => field.required && mapping[field.key]
                          ).length
                        }
                        /
                        {
                          PRODUCT_FIELDS.filter((field) => field.required)
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="template-save-section">
                  <div className="template-option">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={saveTemplate}
                        onChange={(e) => setSaveTemplate(e.target.checked)}
                      />
                      Salvar como template para futuras importações
                    </label>
                  </div>

                  {saveTemplate && (
                    <div className="template-form">
                      <div className="form-group">
                        <label>Nome do Template</label>
                        <input
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Ex: Produtos Eletrônicos"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Descrição (opcional)</label>
                        <textarea
                          value={templateDescription}
                          onChange={(e) =>
                            setTemplateDescription(e.target.value)
                          }
                          placeholder="Descrição do template"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="import-action">
                  <button
                    className="btn btn-primary btn-large"
                    onClick={handleImport}
                    disabled={loading || !canProceed()}
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>{" "}
                        Importando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-upload"></i> Importar{" "}
                        {previewData.totalRows} Produtos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mensagens de erro */}
          {error && (
            <div className="error-message">
              <i className="fa-solid fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Resultados da importação */}
          {status === "success" && result && (
            <div className="import-success">
              <i className="fa-solid fa-circle-check"></i>
              <div className="success-content">
                <h3>{message}</h3>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">Produtos importados:</span>
                    <span className="result-value success">
                      {result.imported}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Total processado:</span>
                    <span className="result-value">{result.total}</span>
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <div className="result-item">
                      <span className="result-label">Erros:</span>
                      <span className="result-value error">
                        {result.errors.length}
                      </span>
                    </div>
                  )}
                </div>
                {result.errors && result.errors.length > 0 && (
                  <details className="error-details">
                    <summary>Ver detalhes dos erros</summary>
                    <div className="error-list">
                      {result.errors.map((error: any, index: number) => (
                        <div key={index} className="error-item">
                          <span className="error-row">Linha {error.row}:</span>
                          <span className="error-message">{error.error}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              <div className="success-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/products")}
                >
                  <i className="fa-solid fa-eye"></i> Ver Produtos Importados
                </button>
                <button className="btn btn-outline" onClick={handleReset}>
                  <i className="fa-solid fa-plus"></i> Nova Importação
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="import-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              <div className="error-content">
                <h3>Erro na Importação</h3>
                <p>{message}</p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setStatus("idle")}
              >
                <i className="fa-solid fa-redo"></i> Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImportScreen;
