import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideBarMenu from "../components/SideBarMenu";
import { ProductCard } from "../components/ProductCard";
import { getProducts } from "../services/productService";
import { categoryService } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import type { Product } from "../types/productType";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (query) params.search = query;
        if (categoryId) {
          params.categoryId = categoryId;
          // Fetch category name for display
          try {
            const cat = await categoryService.get(categoryId);
            setCategoryName(cat.name);
          } catch (e) {
            console.error("Erro ao buscar nome da categoria", e);
          }
        } else {
          setCategoryName("");
        }

        // Parallel fetch for products and categories
        const [productsResponse, allCategories] = await Promise.all([
          getProducts(params),
          categoryService.list(),
        ]);

        setProducts(productsResponse.data);

        // Filter categories client-side if query exists
        if (query) {
          const filteredCategories = allCategories.filter((cat) =>
            cat.name.toLowerCase().includes(query.toLowerCase())
          );
          setCategories(filteredCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, categoryId]);

  const handleCategoryClick = (id: string) => {
    navigate(`/search?categoryId=${id}`);
  };

  return (
    <div>
      <Header />
      <SideBarMenu pageName="search" />

      <div className="products-container">
        <main className="products-main">
          <div className="products-header">
            <div className="page-title">
              <h1>Resultados da busca</h1>
              <p>
                {loading ? (
                  "Buscando..."
                ) : (
                  <>
                    Encontrados <strong>{products.length}</strong> produtos
                    {categories.length > 0 && (
                      <>
                        {" "}
                        e <strong>{categories.length}</strong> categorias
                      </>
                    )}
                    {query && (
                      <>
                        {" "}
                        para "<strong>{query}</strong>"
                      </>
                    )}
                    {categoryName && (
                      <>
                        {" "}
                        na categoria "<strong>{categoryName}</strong>"
                      </>
                    )}
                  </>
                )}
              </p>
            </div>

            <button
              className="add-product-btn"
              onClick={() => navigate("/products")}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Voltar para Produtos
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="categories-section">
                  <h2 className="section-title">
                    <i className="fa-solid fa-tags"></i>
                    Categorias Encontradas
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="category-card"
                      >
                        <div className="category-icon">
                          <i className="fa-solid fa-tag"></i>
                        </div>
                        <span className="category-name">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {products.length > 0 ? (
                <div>
                  {categories.length > 0 && (
                    <h2 className="section-title">
                      <i className="fa-solid fa-box"></i>
                      Produtos Encontrados
                    </h2>
                  )}
                  <div className="products-grid">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showActions={false}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                categories.length === 0 && (
                  <div className="empty-state">
                    <i className="fa-solid fa-search"></i>
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente termos diferentes ou remova os filtros.</p>
                    <button
                      onClick={() => navigate("/products")}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver todos os produtos
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
