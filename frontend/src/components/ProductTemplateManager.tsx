import React, { useState, useEffect } from "react";
import {
  productTemplateService,
  type ProductTemplate,
  type TemplateField,
} from "../services/productTemplateService";
import Modal from "./common/Modal";
import type { ModalType } from "./common/Modal";
import TemplateImport from "./TemplateImport";
import { FaPlus, FaTrash, FaEdit, FaSave, FaFileImport } from "react-icons/fa";

const ProductTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [showImportModal, setShowImportModal] = useState(false);

  // Pagination & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const emptyTemplate = {
    name: "",
    category: "",
    description: "",
    icon: "fa-solid fa-box",
    fields: [] as TemplateField[],
  };

  const [currentTemplate, setCurrentTemplate] = useState(emptyTemplate);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showModal = (
    type: ModalType,
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  // Filter templates by search
  const filteredTemplates = React.useMemo(() => {
    if (!searchTerm.trim()) return templates;
    const term = searchTerm.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
    );
  }, [templates, searchTerm]);

  // Paginate filtered templates
  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTemplates, currentPage]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await productTemplateService.getTemplates();
      setTemplates(result.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar templates de produto");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: ProductTemplate) => {
    setCurrentTemplate({
      name: template.name,
      category: template.category,
      description: template.description,
      icon: template.icon,
      fields: template.fields,
    });
    setEditingTemplateId(template.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    showModal(
      "confirm",
      "Excluir Template",
      "Tem certeza que deseja excluir este template? Produtos que usam este template manterão seus dados, mas perderão a associação.",
      async () => {
        closeModal();
        try {
          setLoading(true);
          await productTemplateService.deleteTemplate(id);
          setTemplates((prev) => prev.filter((t) => t.id !== id));
        } catch (err: any) {
          setError(err.message || "Erro ao excluir template");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingTemplateId) {
        const updated = await productTemplateService.updateTemplate(
          editingTemplateId,
          currentTemplate
        );
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplateId ? updated.data : t))
        );
      } else {
        const created = await productTemplateService.createTemplate(
          currentTemplate
        );
        setTemplates((prev) => [...prev, created.data]);
      }

      setShowCreateForm(false);
      setEditingTemplateId(null);
      setCurrentTemplate(emptyTemplate);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar template");
    } finally {
      setLoading(false);
    }
  };

  // Handle import complete
  const handleImportComplete = (importedTemplates: ProductTemplate[]) => {
    setTemplates((prev) => [...prev, ...importedTemplates]);
  };

  // Field Management
  const addField = () => {
    const newField: TemplateField = {
      id: `field_${Date.now()}`,
      name: "",
      label: "",
      type: "text",
      required: false,
    };
    setCurrentTemplate((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const newFields = [...currentTemplate.fields];
    newFields[index] = { ...newFields[index], ...updates };
    // Auto-update id based on label if it's empty or default
    if (
      updates.label &&
      (newFields[index].id.startsWith("field_") || !newFields[index].name)
    ) {
      const generatedId = updates.label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      newFields[index].id = generatedId;
      newFields[index].name = generatedId;
    }
    setCurrentTemplate((prev) => ({ ...prev, fields: newFields }));
  };

  const removeField = (index: number) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="product-template-manager">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-color)]">
            Templates de Produto
          </h2>
          <p className="text-sm text-[var(--text-secondary-color)]">
            Defina blueprints para padronizar produtos (roupas, eletrônicos,
            etc.)
          </p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-text-color)] rounded-lg hover:bg-[var(--accent-color-hover)] transition-colors cursor-pointer"
          onClick={() => {
            setEditingTemplateId(null);
            setCurrentTemplate(emptyTemplate);
            setShowCreateForm(true);
          }}
        >
          <FaPlus className="mr-2" /> Novo Template
        </button>
        <button
          className="flex items-center px-4 py-2 bg-[var(--surface-color)] text-[var(--text-color)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
          onClick={() => setShowImportModal(true)}
        >
          <FaFileImport className="mr-2" /> Importar JSON
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary-color)]"></i>
          <input
            type="text"
            placeholder="Pesquisar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--surface-color)] text-[var(--text-color)]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary-color)] hover:text-[var(--text-color)] cursor-pointer"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-[var(--text-secondary-color)] mt-1">
            {filteredTemplates.length} template(s) encontrado(s)
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {showCreateForm ? (
        <div className="bg-[var(--bg-color)] p-6 rounded-lg border border-[var(--border-color)] mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingTemplateId ? "Editar Template" : "Novo Template"}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do Template
                </label>
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-[var(--surface-color)]"
                  placeholder="Ex: Roupas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoria Relacionada
                </label>
                <input
                  type="text"
                  value={currentTemplate.category}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-[var(--surface-color)]"
                  placeholder="Ex: Vestuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Descrição
              </label>
              <textarea
                value={currentTemplate.description}
                onChange={(e) =>
                  setCurrentTemplate((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg bg-[var(--surface-color)]"
                placeholder="Descrição do template"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ícone</label>
              <input
                type="text"
                value={currentTemplate.icon}
                onChange={(e) =>
                  setCurrentTemplate((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg bg-[var(--surface-color)]"
                placeholder="fa-solid fa-box"
              />
              <div className="mt-2 text-sm text-[var(--text-secondary-color)]">
                Preview:{" "}
                <i className={`${currentTemplate.icon} text-xl ml-2`}></i>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Campos Personalizados</h4>
                <button
                  type="button"
                  onClick={addField}
                  className="text-[var(--accent-color)] text-sm hover:underline cursor-pointer"
                >
                  + Adicionar Campo
                </button>
              </div>

              <div className="space-y-3">
                {currentTemplate.fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start bg-[var(--surface-color)] p-3 rounded border border-[var(--border-color)]"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateField(idx, { label: e.target.value })
                          }
                          placeholder="Nome do Campo (Label)"
                          className="flex-1 px-2 py-1 border rounded text-sm bg-[var(--bg-color)]"
                          required
                        />
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(idx, { type: e.target.value as any })
                          }
                          className="w-32 px-2 py-1 border rounded text-sm bg-[var(--bg-color)]"
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="select">Seleção</option>
                          <option value="textarea">Área de Texto</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>
                      {field.type === "select" && (
                        <input
                          type="text"
                          value={field.options?.join(", ") || ""}
                          onChange={(e) =>
                            updateField(idx, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
                            })
                          }
                          placeholder="Opções separadas por vírgula (Ex: P, M, G)"
                          className="w-full px-2 py-1 border rounded text-sm bg-[var(--bg-color)]"
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(idx, { required: e.target.checked })
                            }
                            className="mr-1"
                          />{" "}
                          Obrigatório
                        </label>
                        <span className="text-xs text-[var(--text-secondary-color)]">
                          ID: {field.id}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {currentTemplate.fields.length === 0 && (
                  <p className="text-sm text-[var(--text-secondary-color)] italic text-center py-2">
                    Nenhum campo definido.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                type="button"
                className="px-4 py-2 border rounded-lg hover:bg-[var(--surface-color)] transition-colors cursor-pointer"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color-hover)] transition-colors flex items-center cursor-pointer"
                disabled={loading}
              >
                <FaSave className="mr-2" /> Salvar Template
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-[var(--surface-color)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center">
                      <i className={template.icon || "fa-solid fa-box"}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--text-color)]">
                        {template.name}
                      </h4>
                      <span className="text-xs text-[var(--text-secondary-color)]">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-1.5 text-[var(--accent-color)] hover:bg-[var(--bg-color)] rounded cursor-pointer"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 text-red-500 hover:bg-[var(--bg-color)] rounded cursor-pointer"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary-color)] mb-3 line-clamp-2 min-h-[40px]">
                  {template.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary-color)] border-t border-[var(--border-color)] pt-2">
                  <i className="fa-solid fa-list"></i> {template.fields.length}{" "}
                  campos
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && !loading && (
              <div className="col-span-full text-center py-8 text-[var(--text-secondary-color)] bg-[var(--surface-color)] rounded-xl border border-dashed border-[var(--border-color)]">
                <i className="fa-solid fa-box-open text-3xl mb-2 opacity-50"></i>
                <p>
                  {searchTerm
                    ? "Nenhum template encontrado para esta pesquisa."
                    : "Nenhum template de produto encontrado."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border border-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[var(--surface-color)]"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="text-sm text-[var(--text-secondary-color)]">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded border border-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[var(--surface-color)]"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />

      {/* Import Templates Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-color)] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <TemplateImport
                onImportComplete={(imported) => {
                  handleImportComplete(imported);
                  setShowImportModal(false);
                }}
                onClose={() => setShowImportModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTemplateManager;
