import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import { useProducts } from "../context/ProductContext";
import type { Product } from "../types/productType";
import { ProductCard } from "../components/ProductCard";
import { getProductWithCorrectStatus } from "../utils/productUtils";

const MainContent = () => {
  const navigate = useNavigate();
  const { products, addProduct, removeProduct } = useProducts();

  const [filter, setFilter] = useState<"all" | Product["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Recalcular o status de todos os produtos baseado nos campos
  const productsWithCorrectStatus = useMemo(() => {
    return products.map(getProductWithCorrectStatus);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return productsWithCorrectStatus.filter((product) => {
      const matchesFilter = filter === "all" || product.status === filter;
      const matchesSearch = searchTerm
        ? product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesFilter && matchesSearch;
    });
  }, [productsWithCorrectStatus, filter, searchTerm]);

  const handleEditProduct = useCallback(
    (product: Product) => {
      if (navigate) {
        navigate(`/products/edit/${product.id}`);
      }
    },
    [navigate]
  );

  const handleDeleteProduct = useCallback(
    (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir este produto?")) {
        removeProduct(id);
      }
    },
    [removeProduct]
  );

  const handleDuplicateProduct = useCallback(
    (product: Product) => {
      const duplicatedProduct = {
        ...product,
        id: undefined,
        name: `${product.name} (Cópia)`,
      };
      addProduct(duplicatedProduct);
    },
    [addProduct]
  );

  const stats = useMemo(
    () => ({
      total: productsWithCorrectStatus.length,
      complete: productsWithCorrectStatus.filter((p) => p.status === "complete")
        .length,
      incomplete: productsWithCorrectStatus.filter(
        (p) => p.status === "incomplete"
      ).length,
    }),
    [productsWithCorrectStatus]
  );

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
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
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
