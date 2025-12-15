import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductsScreen from "./pages/ProductsScreen";
import ProductFormPage from "./pages/ProductFormPage";
import ProductDetailScreen from "./pages/ProductDetailScreen";
import ExportScreen from "./pages/ExportScreen";
import ImportScreen from "./pages/ImportScreen";
import SettingsScreen from "./pages/SettingsScreen";
import DashboardScreen from "./pages/DashboardScreen";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MenuProvider } from "./context/MenuContext";
import NotFoundPage from "./pages/NotFoundPage";
import { MobileMenuOverlay } from "./components/SideBarMenu";
import AdminDashboard from "./pages/AdminDashboard";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpPage from "./pages/HelpPage";
import ReportsPage from "./pages/ReportsPage";
import SupportPage from "./pages/SupportPage";

function App() {
  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={5000} />
      <AuthProvider>
        <CategoryProvider>
          <ProductProvider>
            <MenuProvider>
              <MobileMenuOverlay />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Rotas protegidas */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <ProductsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/new"
                  element={
                    <ProtectedRoute>
                      <ProductFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ProductFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetailScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export"
                  element={
                    <ProtectedRoute>
                      <ExportScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/import"
                  element={
                    <ProtectedRoute>
                      <ImportScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredRoles={["ADMIN", "USER"]}>
                      <SettingsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SearchResultsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/support"
                  element={
                    <ProtectedRoute>
                      <SupportPage />
                    </ProtectedRoute>
                  }
                />

                {/* Página de acesso negado */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <NotFoundPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MenuProvider>
          </ProductProvider>
        </CategoryProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
