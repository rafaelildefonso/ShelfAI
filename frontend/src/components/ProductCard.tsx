import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import type { Product } from "../types/productType";

export type ProductCardProps = {
  product: Omit<Product, "stock" | "minStock"> & {
    stock?: number;
    minStock?: number;
  };
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (product: Product) => void;
  showActions?: boolean;
};

export const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  showActions = true,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { editProduct } = useProducts();

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!navigate) return;
      if ((e.target as HTMLElement).closest("button, a, input")) {
        return;
      }
      navigate(`/products/${product.id}`);
    },
    [navigate, product.id]
  );

  const discountPercentage = useMemo(() => {
    if (!product.originalPrice || !product.price) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  }, [product.originalPrice, product.price]);

  const formatDate = (date: Date | string) => {
    if (!date) return "";

    const dateToFormat = typeof date === "string" ? new Date(date) : date;

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateToFormat);
  };

  function toggleStatus() {
    editProduct(product.id, { ...product, active: !product.active });
  }

  return (
    <div
      onClick={handleCardClick}
      className={`product-card cursor-pointer ${
        product.featured ? "featured" : ""
      } ${!product.active ? "inactive" : ""}`}
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

        <p className="product-description">
          {product.description || "Sem descrição"}
        </p>

        {product.brand && (
          <div className="product-brand">
            <i className="fa-solid fa-tag"></i>
            <span>{product.brand}</span>
          </div>
        )}

        <div className="product-categories">
          <span className="product-category">
            {product.category?.name || "Sem categoria"}
          </span>
          {product.subcategory && (
            <span className="product-subcategory">• {product.subcategory}</span>
          )}
        </div>

        <div className="product-pricing">
          <div className="price-container">
            <span className="product-price">
              R$ {product.price?.toFixed(2) || "0,00"}
            </span>
            {product.originalPrice &&
              product.originalPrice !== product.price && (
                <span className="product-original-price">
                  R$ {product.originalPrice.toFixed(2)}
                </span>
              )}
          </div>
        </div>

        {product.tags?.length > 0 && (
          <div className="product-tags">
            {product.tags?.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {product.tags?.length > 3 && (
              <span className="tag more">+{product.tags?.length - 3}</span>
            )}
          </div>
        )}

        <div className="product-dates">
          <div className="date-item">
            <i className="fa-solid fa-calendar-plus"></i>
            <span>Criado: {formatDate(product?.createdAt)}</span>
          </div>
          <div className="date-item">
            <i className="fa-solid fa-calendar-edit"></i>
            <span>Atualizado: {formatDate(product?.updatedAt)}</span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="product-actions">
          <button
            className="action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(product);
            }}
            title="Editar produto"
          >
            <i className="fa-solid fa-edit"></i>
          </button>
          <button
            className="action-btn duplicate-btn"
            title="Duplicar produto"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(product);
            }}
          >
            <i className="fa-solid fa-copy"></i>
          </button>
          <button
            className="action-btn toggle-btn"
            title={product.active ? "Desativar" : "Ativar"}
            onClick={(e) => {
              e.stopPropagation();
              toggleStatus();
            }}
          >
            <i
              className={`fa-solid ${
                product.active ? "fa-eye-slash" : "fa-eye"
              }`}
            ></i>
          </button>
          <button
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(product.id);
            }}
            title="Excluir produto"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};
