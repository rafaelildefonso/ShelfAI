import { useParams, useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import Header from "../components/Header";
import SideBarMenu from "../components/SideBarMenu";
import type { Product } from "../types/productType";
import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import type { ModalType } from "../components/common/Modal";
import { getProductById } from "../services/productService";
import Loading from "../components/Loading";
import {
  getMissingFields,
  calculateProductStatus,
} from "../utils/productUtils";
import { supabase } from "../services/supabaseClient";

// Componente para exibir uma seção de detalhes
const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-(--surface-color) rounded-lg shadow p-4 sm:p-6 mb-6">
    <h3 className="text-lg sm:text-xl font-bold text-(--text-color) mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

// Componente para exibir um item de detalhe
const DetailItem = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div
    className={`${fullWidth ? "col-span-1 md:col-span-2 lg:col-span-3" : ""}`}
  >
    <p className="text-sm font-medium text-(--text-color)">{label}</p>
    <p className="text-md text-(--text-secondary-color)">{value || "-"}</p>
  </div>
);

const ProductDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { removeProduct, addProduct } = useProducts();
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
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

  // const product = products.find((p) => p.id === id);
  const fetchProduct = async () => {
    try {
      const productData = await getProductById(id!);
      setProduct(productData);
    } catch (error) {
      setError("Erro ao carregar o produto");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();

    const subscription = supabase
      .channel(`product-detail-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Product",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            showModal("alert", "Atenção", "Este produto foi excluído.", () =>
              navigate("/products")
            );
          } else {
            fetchProduct();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <SideBarMenu pageName="products" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-70px)] bg-(--surface-color) ml-[280px] p-4">
          <Loading iconSize={40} textSize={35} fillSpace={true} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-background dark:bg-gray-900 min-h-screen mt-[70px]">
        <Header />
        <SideBarMenu pageName="products" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-70px)] bg-(--surface-color) ml-[280px] p-4 text-center">
          <i className="fa-solid fa-box-open text-4xl sm:text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl sm:text-2xl font-bold text-(--text-color)">
            Produto não encontrado
          </h2>
          <p className="text-(--text-color) mb-6">
            O produto que você está procurando não existe ou foi movido.
          </p>
          <Link
            to="/products"
            className="bg-(--accent-color) text-white px-4 py-2 rounded-md hover:bg-(--accent-color-hover) transition-colors"
          >
            Voltar para Produtos
          </Link>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDuplicate = () => {
    const duplicatedProduct = {
      ...product,
      id: undefined,
      name: `${product.name} (Cópia)`,
    };
    addProduct(duplicatedProduct);
    showModal("success", "Sucesso", "Produto duplicado com sucesso!", () =>
      navigate("/products")
    );
  };

  const handleDelete = () => {
    showModal(
      "confirm",
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este produto?",
      () => {
        removeProduct(product!.id);
        navigate("/products");
        closeModal();
      }
    );
  };

  const profitMargin =
    product.costPrice && product.price
      ? (
          ((product.price - product.costPrice) / product.costPrice) *
          100
        ).toFixed(2)
      : null;

  const images = [product.image, ...(product.images || [])].filter(
    Boolean
  ) as string[];
  const currentMainImage = mainImage || images[0];

  return (
    <div className="bg-background dark:bg-gray-900 min-h-screen">
      <Header />
      <SideBarMenu pageName="products" />
      <main className="app-main p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Link to="/products" className="back-btn">
            <i className="fa-solid fa-arrow-left"></i>
            Voltar
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-color)">
              {product.name}
            </h1>
            <p className="text-(--text-color)">Detalhes do produto</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleEdit}
              className="bg-(--accent-color) text-white px-4 py-2 rounded-md hover:bg-accent-hover transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <i className="fa-solid fa-edit"></i>Editar
            </button>
            <button
              onClick={handleDuplicate}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <i className="fa-solid fa-copy"></i>Duplicar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <i className="fa-solid fa-trash"></i>Excluir
            </button>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Coluna da Esquerda (Imagens e Ações) */}
          <div className="lg:col-span-1">
            <div className="bg-(--surface-color) rounded-lg shadow p-4">
              <div
                className="main-image mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden"
                style={{ minHeight: "300px" }}
              >
                {currentMainImage ? (
                  <img
                    src={currentMainImage}
                    alt={product.name}
                    className="w-full h-auto max-h-80 object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <i className="fa-solid fa-image text-6xl text-gray-400 dark:text-gray-500 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                      Sem imagem disponível
                    </p>
                  </div>
                )}
              </div>
              <div className="image-gallery">
                {images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-x-auto">
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${product.name} - thumbnail ${index + 1}`}
                        className={`w-full h-16 sm:h-20 object-cover rounded-md cursor-pointer border-2 ${
                          currentMainImage === img
                            ? "border-accent"
                            : "border-transparent"
                        }`}
                        onClick={() => setMainImage(img)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-images text-2xl mb-2"></i>
                    <p className="text-sm">Nenhuma miniatura disponível</p>
                  </div>
                )}
              </div>
            </div>

            {/* Missing Fields Checklist */}
            {(() => {
              const missingFields = getMissingFields(product);
              const status = calculateProductStatus(product);

              if (status === "incomplete" && missingFields.length > 0) {
                return (
                  <div className="border border-yellow-400 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3 text-yellow-500">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <h3 className="font-semibold">
                        Campos Obrigatórios Faltando
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {missingFields.map((field, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-yellow-400"
                        >
                          <i className="fa-regular fa-square"></i>
                          <span>{field}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleEdit}
                      className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen"></i>
                      Preencher Agora
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Coluna da Direita (Detalhes) */}
          <div className="lg:col-span-2">
            <DetailSection title="Informações Gerais">
              <DetailItem label="Nome do Produto" value={product.name} />
              {product.sku && (
                <DetailItem label="SKU / ID Interno" value={product.sku} />
              )}
              <DetailItem
                label="Status"
                value={
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      product.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.active ? "Ativo" : "Inativo"}
                  </span>
                }
              />
              {(product.category || product.categoryId) && (
                <DetailItem
                  label="Categoria"
                  value={
                    typeof product.category === "string"
                      ? product.category
                      : product.category?.name || "-"
                  }
                />
              )}
              {product.subcategory && (
                <DetailItem label="Subcategoria" value={product.subcategory} />
              )}
              {product.brand && (
                <DetailItem label="Marca" value={product.brand} />
              )}
              {product.model && (
                <DetailItem label="Modelo" value={product.model} />
              )}
              {product.color && (
                <DetailItem label="Cor" value={product.color} />
              )}
              {product.size && (
                <DetailItem label="Tamanho" value={product.size} />
              )}
              {product.material && (
                <DetailItem label="Material" value={product.material} />
              )}
              {product.weight && product.weight > 0 && (
                <DetailItem label="Peso" value={`${product.weight} kg`} />
              )}
              {(product.length || product.width || product.height) && (
                <DetailItem
                  label="Dimensões (C x L x A)"
                  value={
                    product.length && product.width && product.height
                      ? `${product.length} x ${product.width} x ${product.height} cm`
                      : "-"
                  }
                />
              )}
              {product.description && (
                <DetailItem
                  label="Descrição Curta"
                  value={product.description}
                  fullWidth
                />
              )}
              {product.tags && product.tags.length > 0 && (
                <DetailItem
                  label="Tags"
                  value={product.tags.join(", ")}
                  fullWidth
                />
              )}
            </DetailSection>

            {/* Seção de Especificações do Template */}
            {product.templateData &&
              Object.keys(product.templateData).length > 0 && (
                <DetailSection title="Especificações">
                  {Object.entries(product.templateData)
                    .filter(
                      ([_, value]) =>
                        value !== undefined && value !== null && value !== ""
                    )
                    .map(([fieldId, value]) => {
                      // Mapeamento de IDs para labels
                      const fieldLabels: Record<string, string> = {
                        size: "Tamanho",
                        color: "Cor",
                        material: "Material",
                        gender: "Gênero",
                        season: "Temporada",
                        care_instructions: "Instruções de Cuidado",
                        heel_height: "Altura do Salto (cm)",
                        sole_type: "Tipo de Sola",
                        closure_type: "Tipo de Fechamento",
                        brand: "Marca",
                        model: "Modelo",
                        storage: "Armazenamento",
                        screen_size: "Tamanho da Tela",
                        warranty: "Garantia",
                        operating_system: "Sistema Operacional",
                        dimensions: "Dimensões",
                        weight: "Peso",
                        assembly_required: "Requer Montagem",
                        room_type: "Tipo de Ambiente",
                        sport_type: "Tipo de Esporte",
                        age_group: "Faixa Etária",
                        product_type: "Tipo de Produto",
                        skin_type: "Tipo de Pele",
                        volume: "Volume/Peso",
                        fragrance: "Fragrância",
                        cruelty_free: "Cruelty Free",
                      };

                      const label =
                        fieldLabels[fieldId] ||
                        fieldId
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase());
                      const displayValue =
                        typeof value === "boolean"
                          ? value
                            ? "Sim"
                            : "Não"
                          : String(value);

                      return (
                        <DetailItem
                          key={fieldId}
                          label={label}
                          value={displayValue}
                        />
                      );
                    })}
                </DetailSection>
              )}

            <DetailSection title="Estoque e Localização">
              <DetailItem
                label="Localização no Estoque"
                value={product.stockLocation}
              />
            </DetailSection>

            <DetailSection title="Preços e Custos">
              <DetailItem
                label="Preço de Custo"
                value={
                  product.costPrice ? `R$ ${product.costPrice.toFixed(2)}` : "-"
                }
              />
              <DetailItem
                label="Preço de Venda"
                value={`R$ ${product.price?.toFixed(2)}`}
              />
              <DetailItem
                label="Margem de Lucro"
                value={profitMargin ? `${profitMargin}%` : "-"}
              />
              {/* Adicionar lógica de promoções aqui */}
            </DetailSection>

            <DetailSection title="Metadados">
              <DetailItem
                label="Data de Cadastro"
                value={new Date(product.createdAt).toLocaleDateString("pt-BR")}
              />
              <DetailItem
                label="Última Atualização"
                value={new Date(product.updatedAt).toLocaleDateString("pt-BR")}
              />
              <DetailItem label="Origem do Cadastro" value={product.origin} />
              <DetailItem
                label="Cadastrado por"
                value={product.createdBy?.name || "-"}
              />
              <DetailItem
                label="Última Edição por"
                value={product.lastEditedBy?.name || "-"}
              />
            </DetailSection>

            <DetailSection title="Observações">
              <DetailItem
                label="Notas Internas"
                value={product.internalNotes}
                fullWidth
              />
            </DetailSection>
          </div>
        </div>
      </main>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default ProductDetailScreen;
