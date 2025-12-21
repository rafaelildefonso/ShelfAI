import React, { useState, useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { FaFileCode, FaUpload, FaTimes, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  productTemplateService,
  type ProductTemplate,
  type TemplateField,
} from "../services/productTemplateService";

interface TemplateImportProps {
  onImportComplete: (templates: ProductTemplate[]) => void;
  onClose: () => void;
}

interface ParsedTemplate {
  name: string;
  category: string;
  description: string;
  icon: string;
  fields: TemplateField[];
  isValid: boolean;
  error?: string;
}

const TemplateImport: React.FC<TemplateImportProps> = ({
  onImportComplete,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateTemplate = (template: any): ParsedTemplate => {
    const errors: string[] = [];

    if (
      !template.name ||
      typeof template.name !== "string" ||
      template.name.trim() === ""
    ) {
      errors.push("Nome obrigatório");
    }
    if (
      !template.category ||
      typeof template.category !== "string" ||
      template.category.trim() === ""
    ) {
      errors.push("Categoria obrigatória");
    }
    if (!template.fields || !Array.isArray(template.fields)) {
      errors.push("Campos obrigatórios");
    }

    return {
      name: template.name || "",
      category: template.category || "",
      description: template.description || "",
      icon: template.icon || "fa-solid fa-box",
      fields: template.fields || [],
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(", ") : undefined,
    };
  };

  const parseJSON = (text: string): ParsedTemplate[] => {
    const data = JSON.parse(text);
    const templates = Array.isArray(data) ? data : [data];
    return templates.map(validateTemplate);
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Por favor, selecione um arquivo JSON");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const templates = parseJSON(text);
        setParsedTemplates(templates);
      } catch (error) {
        toast.error("Erro ao processar o arquivo JSON. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleImport = async () => {
    const validTemplates = parsedTemplates.filter((t) => t.isValid);
    if (validTemplates.length === 0) {
      toast.error("Nenhum template válido para importar");
      return;
    }

    try {
      setIsLoading(true);

      const importedTemplates: ProductTemplate[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const template of validTemplates) {
        try {
          const response = await productTemplateService.createTemplate({
            name: template.name.trim(),
            category: template.category.trim(),
            description: template.description?.trim() || "",
            icon: template.icon || "fa-solid fa-box",
            fields: template.fields,
          });
          importedTemplates.push(response.data);
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} template(s) importado(s) com sucesso!`);
        onImportComplete(importedTemplates);
        onClose();
      }
      if (errorCount > 0) {
        toast.warning(`${errorCount} template(s) falharam ao importar`);
      }
    } catch (error) {
      console.error("Error importing templates:", error);
      toast.error("Erro ao importar templates");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validCount = parsedTemplates.filter((t) => t.isValid).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-[var(--text-color)] mb-2">
          Importar Templates de Produto
        </h3>
        <p className="text-sm text-[var(--text-secondary-color)]">
          Faça upload de um arquivo JSON com os templates. O arquivo deve conter
          um array de templates com "name", "category" e "fields".
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-[var(--accent-color)] bg-[var(--accent-color-hover)]/10"
            : "border-[var(--border-color)]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".json,application/json"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
            <FaFileCode className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-color)]">
              Arraste e solte o arquivo JSON aqui
            </p>
            <p className="text-xs text-[var(--text-secondary-color)] mt-1">
              ou clique para selecionar um arquivo
            </p>
          </div>
          <p className="text-xs text-[var(--text-secondary-color)]">
            Apenas arquivos JSON são aceitos
          </p>
        </div>
      </div>

      {parsedTemplates.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[var(--text-color)] mb-3">
            Pré-visualização ({parsedTemplates.length} templates)
          </h4>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-[var(--border-color)]">
              <thead className="bg-[var(--surface-color)] sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Campos
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-color)] divide-y divide-[var(--border-color)]">
                {parsedTemplates.map((template, index) => (
                  <tr
                    key={index}
                    className={
                      !template.isValid ? "bg-red-50 dark:bg-red-900/10" : ""
                    }
                  >
                    <td className="px-4 py-2 text-sm text-[var(--text-color)]">
                      <div className="flex items-center gap-2">
                        <i
                          className={`${template.icon} text-[var(--accent-color)]`}
                        ></i>
                        {template.name || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-[var(--text-secondary-color)]">
                      {template.category || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-[var(--text-secondary-color)]">
                      {template.fields?.length || 0} campos
                    </td>
                    <td className="px-4 py-2">
                      {template.isValid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck className="mr-1" /> Válido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimes className="mr-1" /> {template.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border-color)]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[var(--text-color)] bg-[var(--surface-color)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={validCount === 0 || isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center ${
            validCount === 0 || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] cursor-pointer"
          } transition-colors`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Importando...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" />
              Importar ({validCount}/{parsedTemplates.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateImport;
