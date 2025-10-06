import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import { useProducts } from "../context/ProductContext";
import type { Product } from "../types/productType";

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDuplicate: (product: Product) => void;
};

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
}: ProductCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Impede a navegação se o clique foi em um botão ou elemento interativo
    if ((e.target as HTMLElement).closest('button, a, input')) {
      return;
    }
    navigate(`/products/${product.id}`);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const stockStatus =
    product.stock <= product.minStock
      ? "low"
      : product.stock === 0
      ? "out"
      : "good";

  const formatDate = (date: Date | string) => {
    if (!date) return ""; // retorna vazio se não tiver data

    const dateToFormat = typeof date === "string" ? new Date(date) : date;

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateToFormat);
  };

  const { editProduct } = useProducts();

  function toggleStatus() {
    editProduct(product.id, { ...product, active: !product.active });
  }

  return (
    <div
      onClick={handleCardClick}
      className={`product-card cursor-pointer ${product.featured ? "featured" : ""} ${
        !product.active ? "inactive" : ""
      }`}
    >
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="no-image">
            <i className="fa-solid fa-image"></i>
          </div>
        )}

        <div className="product-badges">
          {product.featured && (
            <span className="badge featured-badge">
              <i className="fa-solid fa-star"></i>
              Destaque
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="badge discount-badge">-{discountPercentage}%</span>
          )}
          <span className={`status-badge ${product.status}`}>
            {product.status === "complete" ? "Completo" : "Incompleto"}
          </span>
        </div>
      </div>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-sku">SKU: {product.sku}</div>
        </div>

        <p className="product-description">{product.description}</p>

        {product.brand && (
          <div className="product-brand">
            <i className="fa-solid fa-tag"></i>
            <span>{product.brand}</span>
          </div>
        )}

        <div className="product-categories">
          <span className="product-category">{product.category?.name || 'Sem categoria'}</span>
          {product.subcategory && (
            <span className="product-subcategory">• {product.subcategory}</span>
          )}
        </div>

        <div className="product-pricing">
          <div className="price-container">
            <span className="product-price">R$ {product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="product-original-price">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="product-stats">
          <div className="stat-item">
            <i className="fa-solid fa-eye"></i>
            <span>{product.views.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-shopping-cart"></i>
            <span>{product.sales.toLocaleString()}</span>
          </div>
          {product.rating && (
            <div className="stat-item">
              <i className="fa-solid fa-star"></i>
              <span>
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}
        </div>

        <div className="product-stock">
          <div className={`stock-indicator ${stockStatus}`}>
            <i
              className={`fa-solid ${
                stockStatus === "out"
                  ? "fa-times-circle"
                  : stockStatus === "low"
                  ? "fa-exclamation-triangle"
                  : "fa-check-circle"
              }`}
            ></i>
            <span>
              {stockStatus === "out"
                ? "Sem estoque"
                : stockStatus === "low"
                ? "Estoque baixo"
                : "Em estoque"}
            </span>
          </div>
          <span className="stock-quantity">{product.stock} unidades</span>
        </div>

        {product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="tag more">+{product.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="product-dates">
          <div className="date-item">
            <i className="fa-solid fa-calendar-plus"></i>
            <span>Criado: {formatDate(product.createdAt)}</span>
          </div>
          <div className="date-item">
            <i className="fa-solid fa-calendar-edit"></i>
            <span>Atualizado: {formatDate(product.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="product-actions">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(product)}
          title="Editar produto"
        >
          <i className="fa-solid fa-edit"></i>
        </button>
        <button
          className="action-btn duplicate-btn"
          title="Duplicar produto"
          onClick={() => onDuplicate(product)}
        >
          <i className="fa-solid fa-copy"></i>
        </button>
        <button
          className="action-btn toggle-btn"
          title={product.active ? "Desativar" : "Ativar"}
          onClick={() => toggleStatus()}
        >
          <i
            className={`fa-solid ${product.active ? "fa-eye-slash" : "fa-eye"}`}
          ></i>
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(product.id)}
          title="Excluir produto"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

const MainContent = () => {
  const navigate = useNavigate();
  const { products, addProduct, removeProduct } = useProducts();

  const [filter, setFilter] = useState<"all" | "complete" | "incomplete">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesFilter = filter === "all" || product.status === filter;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEditProduct = (product: Product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      removeProduct(id);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicatedProduct = { ...product, id: undefined };
    addProduct(duplicatedProduct);
  };

  const stats = {
    total: products.length,
    complete: products.filter((p) => p.status === "complete").length,
    incomplete: products.filter((p) => p.status === "incomplete").length,
  };

  return (
    <div className="products-container">
      <main className="products-main">
        <div className="products-header">
          <div className="page-title">
            <h1>Produtos</h1>
            <p>Gerencie seu catálogo de produtos</p>
          </div>

          <button
            className="add-product-btn"
            onClick={() => navigate("/products/new")}
          >
            <i className="fa-solid fa-plus"></i>
            Adicionar Produto
          </button>
        </div>

        <div className="products-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa-solid fa-box"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon complete">
              <i className="fa-solid fa-check"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.complete}</span>
              <span className="stat-label">Completos</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon incomplete">
              <i className="fa-solid fa-exclamation"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.incomplete}</span>
              <span className="stat-label">Incompletos</span>
            </div>
          </div>
        </div>

        <div className="products-controls">
          <div className="search-controls">
            <div className="search-box">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-controls">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${filter === "complete" ? "active" : ""}`}
              onClick={() => setFilter("complete")}
            >
              Completos
            </button>
            <button
              className={`filter-btn ${
                filter === "incomplete" ? "active" : ""
              }`}
              onClick={() => setFilter("incomplete")}
            >
              Incompletos
            </button>
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onDuplicate={handleDuplicateProduct}
              />
            ))
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-box-open"></i>
              <h3>Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros ou adicione um novo produto</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProductsScreen = () => {
  return (
    <div>
      <Header />
      <SideBarMenu pageName="products" />
      <MainContent />
    </div>
  );
};

export default ProductsScreen;
