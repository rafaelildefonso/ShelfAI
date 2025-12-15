import { useState, useEffect, useRef } from "react";
import "./../App.css";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import { getProducts } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { activityService } from "../services/activityService";
import type { Activity } from "../services/activityService";
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

type CategoriaDistribuicao = {
  name: string;
  value: number;
  color: string;
};

// Paleta de cores vibrantes e distintas
const colorPalette = [
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Deep Orange
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F43F5E", // Rose
  "#6366F1", // Indigo
  "#A855F7", // Purple Light
  "#22D3EE", // Sky
  "#FBBF24", // Amber
];

// Função para gerar cores dinâmicas para categorias
const generateCategoryColor = (categoryName: string, index: number): string => {
  // Se o índice está dentro da paleta, usar cor da paleta
  if (index < colorPalette.length) {
    return colorPalette[index];
  }

  // Para categorias extras, gerar cores usando distribuição melhorada
  // Usar hash do nome para consistência
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Usar o ângulo dourado (222.5°) para distribuição uniforme de matizes
  const goldenAngle = 222.5;
  const hue = (index * goldenAngle + (Math.abs(hash) % 60)) % 360;

  // Saturação alta para cores vibrantes (70-85%)
  const saturation = 70 + (Math.abs(hash) % 16);

  // Luminosidade média-alta para boa visibilidade (55-65%)
  const lightness = 55 + (Math.abs(hash) % 11);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

import type { Product } from "../types/productType";
import { Link } from "react-router-dom";

const MainContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
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

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getProducts().then((res) => res.data),
      categoryService.list(),
      activityService.getActivities({ limit: 10 }),
      activityService.getStats(30),
    ])
      .then(([productsData, categoriesData, activitiesData, statsData]) => {
        setProducts(productsData);

        // Calcular estatísticas reais
        const totalProducts = productsData.length;
        const completeProducts = productsData.filter(
          (p: any) => p.status === "complete"
        ).length;
        const incompleteProducts = productsData.filter(
          (p: any) => p.status === "incomplete"
        ).length;
        // Contar apenas categorias do usuário (não default)
        const userCategories = categoriesData.filter(
          (cat: any) => !cat.isDefault
        );
        const totalCategories = userCategories.length;

        // Calcular produtos com estoque baixo (se houver campo de estoque)
        const lowStockProducts = productsData.filter(
          (p: any) =>
            p.stock !== undefined &&
            p.minStock !== undefined &&
            p.stock <= p.minStock
        ).length;

        // Usar estatísticas reais de atividades
        const recentImports = statsData.byType.import || 0;
        const recentExports = statsData.byType.export || 0;

        setDashboardData({
          totalProducts,
          completeProducts,
          incompleteProducts,
          totalCategories,
          recentImports,
          recentExports,
          lowStockProducts,
          pendingReviews: 0, // TODO: Implementar sistema de avaliações
        });

        // Carregar atividades recentes
        setRecentActivities(activitiesData);
      })
      .catch(() => setError("Erro ao carregar dados do dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // Realtime updates are now handled globally by ProductContext
  }, []);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Refs para as instâncias dos gráficos
  const barChartRef = useRef<any>(null);
  const pieChartRef = useRef<any>(null);

  // Listener para resize da janela com debounce
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (barChartRef.current) {
          barChartRef.current.resize();
        }
        if (pieChartRef.current) {
          pieChartRef.current.resize();
        }
      }, 100); // Debounce de 100ms para suavizar
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
      imports: [],
      exports: [],
    },
  });

  // 5. Efeito para atualizar os dados dos gráficos quando produtos e atividades mudarem
  useEffect(() => {
    const countCategories: Record<string, number> = {};
    products.forEach((p) => {
      const categoryName =
        typeof p.category === "string"
          ? p.category
          : p.category?.name || "Sem Categoria";
      countCategories[categoryName] = (countCategories[categoryName] || 0) + 1;
    });

    const categorizedDistribution: CategoriaDistribuicao[] = Object.entries(
      countCategories
    ).map(([categoryName, qtd], index) => ({
      name: categoryName,
      value: Math.round((qtd / products.length) * 100),
      color: generateCategoryColor(categoryName, index),
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

    // Calcular import/export por mês baseado em atividades
    const contarAtividadesPorMes = (
      atividades: Activity[],
      tipo: "import" | "export"
    ) => {
      const meses = Array(12).fill(0);
      const anoAtual = new Date().getFullYear();

      atividades.forEach((a) => {
        if (
          a.type === tipo &&
          a.createdAt &&
          new Date(a.createdAt).getFullYear() === anoAtual
        ) {
          const mes = new Date(a.createdAt).getMonth();
          meses[mes] += 1;
        }
      });

      return meses;
    };

    setChartData({
      productsByMonth: contarProdutosPorMes(products),
      categoriesDistribution: categorizedDistribution,
      importExportTrend: {
        imports: contarAtividadesPorMes(recentActivities, "import"),
        exports: contarAtividadesPorMes(recentActivities, "export"),
      },
    });
  }, [products, recentActivities]);

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

  // Lógica para o Gráfico de Barras - limitar em mobile
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

  const maxMonths = isMobile ? 3 : visibleMonths; // Em mobile, mostrar no máximo 3 meses
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
  const visibleDataMobile = getLastMonths(
    chartData.productsByMonth,
    maxMonths,
    currentMonth
  );
  const monthLabelsMobile = getLastMonths(
    monthLabelsFull,
    maxMonths,
    currentMonth
  );

  const barChartData = {
    labels: isMobile ? monthLabelsMobile : monthLabels,
    datasets: [
      {
        label: "Produtos Cadastrados",
        data: isMobile ? visibleDataMobile : visibleData,
        backgroundColor: "#8B5CF6",
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    fullSize: true,
    animation: {
      duration: 200,
      easing: "easeOutQuart" as const,
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          font: {
            size: 11,
          },
          precision: 0,
        },
      },
    },
    onResize: function () {
      // Callback personalizado para resize - garante redimensionamento
      console.log("Bar chart resized");
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
    fullSize: true,
    animation: {
      duration: 200,
      easing: "easeOutQuart" as const,
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
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
    onResize: function () {
      // Callback personalizado para resize - garante redimensionamento
      console.log("Pie chart resized");
    },
  };

  return (
    <main className="app-main">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Bem-vindo ao ShelfAI</h1>
            <p>Sua solução inteligente para gestão de produtos e e-commerce</p>
            {/*
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
            */}
          </div>
          <div className="dashboard-actions-header">
            <Link to="/products/new" className="quick-action-btn primary">
              <i className="fa-solid fa-plus"></i>
              Adicionar Produto
            </Link>
            <Link to="/import" className="quick-action-btn secondary">
              <i className="fa-solid fa-file-import"></i>
              Importar
            </Link>
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
              {(() => {
                const currentMonth = new Date().getMonth();
                const currentMonthProducts =
                  chartData.productsByMonth[currentMonth] || 0;

                if (currentMonthProducts > 0) {
                  return (
                    <span className="stat-change positive">
                      +{currentMonthProducts} este mês
                    </span>
                  );
                } else {
                  return (
                    <span className="stat-change">Nenhum novo este mês</span>
                  );
                }
              })()}
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
                {completionRate}% de completude
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
              <span className="stat-change positive">Ativas no sistema</span>
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
              {!isMobile && (
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
              )}
            </div>
            <div className="chart-content">
              <div className="line-chart">
                <Bar
                  ref={barChartRef}
                  options={barChartOptions}
                  data={barChartData}
                />
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
                <Pie
                  ref={pieChartRef}
                  data={pieChartData}
                  options={pieChartOptions}
                />
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
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
                            : activity.type === "category"
                            ? "fa-tags"
                            : activity.type === "user"
                            ? "fa-user"
                            : "fa-cog"
                        }`}
                      ></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-description">
                        {activity.description}
                      </div>
                      <div className="activity-time">
                        {activityService.formatRelativeTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activities flex justify-center items-center flex-col gap-5">
                  <i
                    className="fa-solid fa-inbox text-(--text-secondary-color)"
                    style={{ fontSize: 50 }}
                  ></i>
                  <p className="text-(--text-secondary-color)">
                    Nenhuma atividade recente
                  </p>
                </div>
              )}
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
