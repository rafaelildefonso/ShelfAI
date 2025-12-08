import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoryImport from "../components/CategoryImport";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaFileImport,
} from "react-icons/fa";
import { supabase } from "../services/supabaseClient";

interface Category {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [showImportModal, setShowImportModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Load categories
  useEffect(() => {
    let subscription: any;

    if (user?.role === "ADMIN") {
      loadCategories();

      subscription = supabase
        .channel("admin-categories")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Category" },
          () => {
            loadCategories();
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [user]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listDefaultCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategory = () => {
    setFormData({ name: "", description: "" });
    setIsAdding(true);
    setIsEditing(null);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsEditing(category.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await adminService.updateDefaultCategory(isEditing, formData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await adminService.createDefaultCategory(formData);
        toast.success("Categoria criada com sucesso!");
      }

      setIsAdding(false);
      setIsEditing(null);
      await loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar categoria"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await adminService.deleteDefaultCategory(id);
        toast.success("Categoria excluída com sucesso!");
        await loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Erro ao excluir categoria");
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-color)]">
            Carregando painel administrativo...
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] p-4">
        <div className="text-center max-w-md">
          <div className="bg-[var(--error-color)]/10 text-[var(--error-color)] p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p>Você não tem permissão para acessar esta página.</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-text-color)] rounded-lg hover:bg-[var(--accent-color-hover)] transition-colors cursor-pointer"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-color)]">
              Painel Administrativo
            </h1>
            <p className="text-[var(--text-secondary-color)]">
              Gerencie as configurações do sistema
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 text-sm text-[var(--text-color)] bg-[var(--surface-color)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
          >
            <FaArrowLeft className="mr-2" /> Voltar
          </button>
        </div>

        <div className="bg-[var(--surface-color)] rounded-xl shadow-md overflow-hidden mb-8 border border-[var(--border-color)]">
          <div className="p-6 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--surface-color)]">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-color)]">
                Categorias Padrão
              </h2>
              <p className="text-sm text-[var(--text-secondary-color)]">
                Gerencie as categorias padrão do sistema
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center px-4 py-2 text-[var(--text-color)] bg-[var(--surface-color)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
              >
                <FaFileImport className="mr-2" /> Importar CSV
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isAdding}
                className="flex items-center px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-text-color)] rounded-lg hover:bg-[var(--accent-color-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaPlus className="mr-2" /> Adicionar Categoria
              </button>
            </div>
          </div>

          {isAdding && (
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]">
              <h3 className="text-lg font-medium text-[var(--text-color)] mb-4">
                {isEditing ? "Editar Categoria" : "Nova Categoria"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary-color)] mb-1">
                    Nome <span className="text-[var(--error-color)]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--surface-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-colors cursor-text"
                    placeholder="Digite o nome da categoria"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary-color)] mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--surface-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-colors cursor-text"
                    rows={3}
                    placeholder="Adicione uma descrição para a categoria (opcional)"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-color)] bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors flex items-center cursor-pointer"
                  >
                    <FaTimes className="mr-2" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-[var(--accent-text-color)] bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] rounded-lg transition-colors flex items-center cursor-pointer"
                  >
                    <FaSave className="mr-2" />{" "}
                    {isEditing ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 flex justify-center bg-[var(--surface-color)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-secondary-color)] bg-[var(--surface-color)]">
                Nenhuma categoria cadastrada. Clique em "Adicionar Categoria"
                para começar.
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border-color)]">
                  <thead className="bg-[var(--bg-color)]">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider"
                      >
                        Nome
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider"
                      >
                        Descrição
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider"
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--surface-color)] divide-y divide-[var(--border-color)]">
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-[var(--bg-color)]"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-color)]">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary-color)]">
                          {category.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 text-[var(--accent-color)] hover:text-[var(--accent-color-hover)] rounded-full hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-[var(--error-color)] hover:opacity-80 rounded-full hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary-color)]">
          <p>
            © {new Date().getFullYear()} ShelfAI - Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Import Categories Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-color)] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CategoryImport
                onImportComplete={() => {
                  loadCategories();
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

export default AdminDashboard;
