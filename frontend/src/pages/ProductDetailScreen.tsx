import { useParams, useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import Header from "../components/Header";
import SideBarMenu from "../components/SideBarMenu";
import type { Product } from "../types/productType";
import { useEffect, useState } from "react";
import { getProductById } from "../services/productService";
import Loading from "../components/Loading";

// Componente para exibir uma seção de detalhes
const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-(--surface-color) rounded-lg shadow p-6 mb-6">
    <h3 className="text-xl font-bold text-(--text-color) mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
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

  // const product = products.find((p) => p.id === id);
  useEffect(() => {
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
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <SideBarMenu pageName="products" />
        <div className="flex flex-col items-center justify-center h-[100%] bg-(--surface-color) ml-[280px]">
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
        <div className="flex flex-col items-center justify-center h-[100%] bg-(--surface-color) ml-[280px]">
          <i className="fa-solid fa-box-open text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-(--text-color)">
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
    alert("Produto duplicado com sucesso!");
    navigate("/products");
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      removeProduct(product.id);
      navigate("/products");
    }
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
    <div className="bg-background dark:bg-gray-900 min-h-screen mt-[70px]">
      <Header />
      <SideBarMenu pageName="products" />
      <main className="ml-[280px] p-8">
        {/* Cabeçalho da Página */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-(--text-color)">
              {product.name}
            </h1>
            <p className="text-(--text-color)">Detalhes do produto</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-hover transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-edit"></i>Editar
            </button>
            <button
              onClick={handleDuplicate}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-copy"></i>Duplicar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-trash"></i>Excluir
            </button>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda (Imagens e Ações) */}
          <div className="lg:col-span-1">
            <div className="bg-(--surface-color) rounded-lg shadow p-4">
              <div className="main-image mb-4">
                <img
                  src={currentMainImage}
                  alt={product.name}
                  className="w-full h-auto object-cover rounded-md"
                />
              </div>
              <div className="image-gallery grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} - thumbnail ${index + 1}`}
                    className={`w-full h-auto object-cover rounded-md cursor-pointer border-2 ${
                      currentMainImage === img
                        ? "border-accent"
                        : "border-transparent"
                    }`}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Coluna da Direita (Detalhes) */}
          <div className="lg:col-span-2">
            <DetailSection title="Informações Gerais">
              <DetailItem label="Nome do Produto" value={product.name} />
              <DetailItem label="SKU / ID Interno" value={product.sku} />
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
              <DetailItem 
                label="Categoria" 
                value={typeof product.category === 'string' ? product.category : product.category?.name || '-'} 
              />
              <DetailItem label="Subcategoria" value={product.subcategory} />
              <DetailItem label="Marca" value={product.brand} />
              <DetailItem label="Modelo" value={product.model} />
              <DetailItem label="Cor" value={product.color} />
              <DetailItem label="Tamanho" value={product.size} />
              <DetailItem label="Material" value={product.material} />
              <DetailItem
                label="Peso"
                value={product.weight ? `${product.weight} kg` : "-"}
              />
              <DetailItem
                label="Dimensões (C x L x A)"
                value={
                  product.length && product.width && product.height
                    ? `${product.length} x ${product.width} x ${product.height} cm`
                    : "-"
                }
              />
              <DetailItem
                label="Descrição Curta"
                value={product.description}
                fullWidth
              />
              <DetailItem
                label="Tags"
                value={product.tags.length > 0 ? product.tags.join(", ") : "-"}
                fullWidth
              />
            </DetailSection>

            <DetailSection title="Estoque e Localização">
              <DetailItem
                label="Quantidade em Estoque"
                value={`${product.stock} unidades`}
              />
              <DetailItem
                label="Nível Mínimo de Estoque"
                value={`${product.minStock} unidades`}
              />
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
                value={`R$ ${product.price.toFixed(2)}`}
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
              <DetailItem label="Cadastrado por" value={product.createdBy} />
              <DetailItem
                label="Última Edição por"
                value={product.lastEditedBy}
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
    </div>
  );
};

export default ProductDetailScreen;
