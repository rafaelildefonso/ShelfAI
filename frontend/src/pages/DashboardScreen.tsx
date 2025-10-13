import { useState } from "react";
import "./../App.css";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import { getCategories, getProducts } from "../services/productService";
import { Bar, Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  totalProducts: number;
  completeProducts: number;
  incompleteProducts: number;
  totalCategories: number;
  recentImports: number;
  recentExports: number;
  lowStockProducts: number;
  pendingReviews: number;
}

type ChartPeriod = "12M" | "6M" | "3M";

const periodInMonths: Record<ChartPeriod, number> = {
  "12M": 12,
  "6M": 6,
  "3M": 3,
};

interface RecentActivity {
  id: string;
  type: "import" | "export" | "product" | "category";
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "error" | "info";
}

interface QuickStats {
  todayImports: number;
  weekImports: number;
  monthImports: number;
  todayExports: number;
  weekExports: number;
  monthExports: number;
}

type CategoriaDistribuicao = {
  name: string;
  value: number;
  color: string;
};

const coresCategorias: Record<string, string> = {
  Roupas: "#8B5CF6",
  Calçados: "#10B981",
  Acessórios: "#F59E0B",
  Eletrônicos: "#EF4444",
  Vestuário: "#22c04aff",
  Tecnologia: "#26a3d4ff",
  Casa: "#3B82F6",
};

import { useEffect } from "react";
import type { Product } from "../types/productType";
const MainContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("12M");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProducts: 0,
    completeProducts: 0,
    incompleteProducts: 0,
    totalCategories: 0,
    recentImports: 0, // Será carregado do backend
    recentExports: 0, // Será carregado do backend
    lowStockProducts: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getProducts().then((res) => res.data),
      getCategories().then((res) => res.data),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);

        // Calcular estatísticas reais
        const totalProducts = productsData.length;
        const completeProducts = productsData.filter(
          (p: any) => p.status === "complete"
        ).length;
        const incompleteProducts = productsData.filter(
          (p: any) => p.status === "incomplete"
        ).length;
        const totalCategories = categoriesData.length;

        // Calcular produtos com estoque baixo (se houver campo de estoque)
        const lowStockProducts = productsData.filter(
          (p: any) => p.stock !== undefined && p.minStock !== undefined && p.stock <= p.minStock
        ).length;

        setDashboardData({
          totalProducts,
          completeProducts,
          incompleteProducts,
          totalCategories,
          recentImports: 0, // TODO: Implementar endpoint para estatísticas de importações
          recentExports: 0, // TODO: Implementar endpoint para estatísticas de exportações
          lowStockProducts,
          pendingReviews: 0, // TODO: Implementar sistema de avaliações
        });
      })
      .catch(() => setError("Erro ao carregar dados do dashboard"))
      .finally(() => setLoading(false));
  }, []);

  // 3. Todos os outros hooks devem vir depois dos efeitos
  const [quickStats] = useState<QuickStats>({
    todayImports: 12,
    weekImports: 67,
    monthImports: 234,
    todayExports: 8,
    weekExports: 45,
    monthExports: 156,
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "import",
      title: "Importação Concluída",
      description: "45 produtos importados do arquivo produtos_jan2024.csv",
      time: "2 min atrás",
      status: "success",
    },
    {
      id: "2",
      type: "product",
      title: "Produto Atualizado",
      description: "Camiseta Premium - Preço atualizado para R$ 89,90",
      time: "15 min atrás",
      status: "info",
    },
    {
      id: "3",
      type: "export",
      title: "Exportação para Shopify",
      description: "12 produtos exportados com sucesso",
      time: "1 hora atrás",
      status: "success",
    },
    {
      id: "4",
      type: "category",
      title: "Nova Categoria",
      description: 'Categoria "Acessórios" criada com 8 produtos',
      time: "2 horas atrás",
      status: "info",
    },
    {
      id: "5",
      type: "product",
      title: "Estoque Baixo",
      description: 'Produto "Tênis Esportivo" com apenas 3 unidades',
      time: "3 horas atrás",
      status: "warning",
    },
  ]);

  const [chartData, setChartData] = useState<{
    productsByMonth: number[];
    categoriesDistribution: CategoriaDistribuicao[];
    importExportTrend: {
      imports: number[];
      exports: number[];
    };
  }>({
    productsByMonth: [],
    categoriesDistribution: [],
    importExportTrend: {
      imports: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48],
      exports: [8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35],
    },
  });

  // 5. Efeito para atualizar os dados dos gráficos quando produtos mudarem
  useEffect(() => {
    const countCategories: Record<string, number> = {};
    products.forEach((p) => {
      const categoryName = typeof p.category === 'string' ? p.category : p.category?.name || 'Sem Categoria';
      countCategories[categoryName] = (countCategories[categoryName] || 0) + 1;
    });

    const categorizedDistribution: CategoriaDistribuicao[] = Object.entries(
      countCategories
    ).map(([categoryName, qtd]) => ({
      name: categoryName,
      value: Math.round((qtd / products.length) * 100),
      color: coresCategorias[categoryName] || "#ccccccff",
    }));

    const contarProdutosPorMes = (produtos: Product[]) => {
      const meses = Array(12).fill(0);
      const anoAtual = new Date().getFullYear();

      produtos.forEach((p) => {
        if (p.createdAt && new Date(p.createdAt).getFullYear() === anoAtual) {
          const mes = new Date(p.createdAt).getMonth();
          meses[mes] += 1;
        }
      });

      return meses;
    };

    setChartData({
      productsByMonth: contarProdutosPorMes(products),
      categoriesDistribution: categorizedDistribution,
      importExportTrend: {
        imports: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48],
        exports: [8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35],
      },
    });
  }, [products]);

  // 4. Condicionais de renderização vêm por último
  if (loading)
    return <div className="p-10 text-center">Carregando dashboard...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  const completionRate =
    Math.round(
      (dashboardData.completeProducts / dashboardData.totalProducts) * 100
    ) || 0;
  const incompleteRate =
    Math.round(
      (dashboardData.incompleteProducts / dashboardData.totalProducts) * 100
    ) || 0;

  // Lógica para o Gráfico de Barras
  const visibleMonths = periodInMonths[chartPeriod];
  const monthLabelsFull = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dez

  // Função para pegar os últimos N meses com rotação
  const getLastMonths = (arr: any[], months: number, endMonth: number) => {
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const idx = (endMonth - i + 12) % 12;
      result.push(arr[idx]);
    }
    return result;
  };

  const visibleData = getLastMonths(
    chartData.productsByMonth,
    visibleMonths,
    currentMonth
  );
  const monthLabels = getLastMonths(
    monthLabelsFull,
    visibleMonths,
    currentMonth
  );

  const barChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Produtos Cadastrados",
        data: visibleData,
        backgroundColor: "#8B5CF6",
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { display: false },
      },
    },
  };

  const pieChartData = {
    labels: chartData.categoriesDistribution.map(
      (c) => `${c.name} (${c.value}%)`
    ),
    datasets: [
      {
        data: chartData.categoriesDistribution.map((c) => c.value),
        backgroundColor: chartData.categoriesDistribution.map((c) => c.color),
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.label || "";
          },
        },
      },
    },
  };

  return (
    <main className="app-main">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Bem-vindo ao ShelfAI</h1>
            <p>Sua solução inteligente para gestão de produtos e e-commerce</p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span className="welcome-stat-number">
                  {dashboardData.totalProducts.toLocaleString()}
                </span>
                <span className="welcome-stat-label">Produtos Cadastrados</span>
              </div>
              <div className="welcome-stat">
                <span className="welcome-stat-number">{completionRate}%</span>
                <span className="welcome-stat-label">Taxa de Completude</span>
              </div>
              <div className="welcome-stat">
                <span className="welcome-stat-number">
                  {dashboardData.totalCategories}
                </span>
                <span className="welcome-stat-label">Categorias Ativas</span>
              </div>
            </div>
          </div>
          <div className="dashboard-actions-header">
            <button
              className="quick-action-btn primary"
              onClick={() => (window.location.href = "/products")}
            >
              <i className="fa-solid fa-plus"></i>
              Adicionar Produto
            </button>
            <button
              className="quick-action-btn secondary"
              onClick={() => (window.location.href = "/import")}
            >
              <i className="fa-solid fa-file-import"></i>
              Importar
            </button>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">
                {dashboardData.totalProducts.toLocaleString()}
              </span>
              <span className="stat-label">Total de Produtos</span>
              <span className="stat-change positive">+12% este mês</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon complete">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">
                {dashboardData.completeProducts.toLocaleString()}
              </span>
              <span className="stat-label">Produtos Completos</span>
              <span className="stat-change positive">
                {completionRate}% do total
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon incomplete">
              <i className="fa-solid fa-exclamation-triangle"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">
                {dashboardData.incompleteProducts.toLocaleString()}
              </span>
              <span className="stat-label">Produtos Incompletos</span>
              <span className="stat-change negative">
                {incompleteRate}% precisam atenção
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa-solid fa-tags"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">
                {dashboardData.totalCategories}
              </span>
              <span className="stat-label">Categorias</span>
              <span className="stat-change positive">+2 novas</span>
            </div>
          </div>
        </div>

        {/* Estatísticas Secundárias */}
        <div className="dashboard-secondary-stats">
          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <i className="fa-solid fa-file-import"></i>
            </div>
            <div className="secondary-stat-content">
              <span className="secondary-stat-number">
                {dashboardData.recentImports}
              </span>
              <span className="secondary-stat-label">Importações Recentes</span>
            </div>
          </div>

          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <i className="fa-solid fa-file-export"></i>
            </div>
            <div className="secondary-stat-content">
              <span className="secondary-stat-number">
                {dashboardData.recentExports}
              </span>
              <span className="secondary-stat-label">Exportações Recentes</span>
            </div>
          </div>

          <div className="secondary-stat-card">
            <div className="secondary-stat-icon warning">
              <i className="fa-solid fa-exclamation-triangle"></i>
            </div>
            <div className="secondary-stat-content">
              <span className="secondary-stat-number">
                {dashboardData.lowStockProducts}
              </span>
              <span className="secondary-stat-label">Estoque Baixo</span>
            </div>
          </div>

          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="secondary-stat-content">
              <span className="secondary-stat-number">
                {dashboardData.pendingReviews}
              </span>
              <span className="secondary-stat-label">Avaliações Pendentes</span>
            </div>
          </div>
        </div>

        {/* Gráficos e Análises */}
        <div className="dashboard-charts">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Crescimento de Produtos</h3>
              <div className="chart-period">
                {(["12M", "6M", "3M"] as ChartPeriod[]).map((period) => (
                  <button
                    key={period}
                    className={`period-btn ${
                      chartPeriod === period ? "active" : ""
                    }`}
                    onClick={() => setChartPeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-content">
              <div className="line-chart">
                <Bar options={barChartOptions} data={barChartData} />
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#8B5CF6" }}
                  ></div>
                  <span>Produtos Cadastrados</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Distribuição por Categoria</h3>
            </div>
            <div className="chart-content">
              <div className="pie-chart">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
              <div className="chart-legend">
                {chartData.categoriesDistribution.map((category, index) => (
                  <div key={index} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>
                      {category.name} ({category.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Atividades Recentes e Ações Rápidas */}
        <div className="dashboard-bottom">
          <div className="recent-activities">
            <div className="section-header">
              <h3>Atividades Recentes</h3>
              <button className="view-all-btn">Ver todas</button>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.status}`}>
                    <i
                      className={`fa-solid ${
                        activity.type === "import"
                          ? "fa-file-import"
                          : activity.type === "export"
                          ? "fa-file-export"
                          : activity.type === "product"
                          ? "fa-box"
                          : "fa-tags"
                      }`}
                    ></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">
                      {activity.description}
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <div className="section-header">
              <h3>Ações Rápidas</h3>
            </div>
            <div className="actions-grid">
              <button
                className="quick-action-card"
                onClick={() => (window.location.href = "/products")}
              >
                <div className="action-icon">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <div className="action-content">
                  <h4>Adicionar Produto</h4>
                  <p>Cadastre um novo produto</p>
                </div>
              </button>

              <button
                className="quick-action-card"
                onClick={() => (window.location.href = "/import")}
              >
                <div className="action-icon">
                  <i className="fa-solid fa-file-import"></i>
                </div>
                <div className="action-content">
                  <h4>Importar Produtos</h4>
                  <p>Importe produtos em lote</p>
                </div>
              </button>

              <button
                className="quick-action-card"
                onClick={() => (window.location.href = "/export")}
              >
                <div className="action-icon">
                  <i className="fa-solid fa-file-export"></i>
                </div>
                <div className="action-content">
                  <h4>Exportar Produtos</h4>
                  <p>Exporte para marketplaces</p>
                </div>
              </button>

              <button
                className="quick-action-card"
                onClick={() => (window.location.href = "/settings")}
              >
                <div className="action-icon">
                  <i className="fa-solid fa-gear"></i>
                </div>
                <div className="action-content">
                  <h4>Configurações</h4>
                  <p>Configure sua plataforma</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default function DashboardScreen() {
  return (
    <div>
      <Header />
      <SideBarMenu pageName="dashboard" />
      <MainContent />
    </div>
  );
}
