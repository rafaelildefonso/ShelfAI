import "./App.css";
import { Routes, Route } from "react-router-dom";
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
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";

function App() {
  return (
    <div className="App">
      <CategoryProvider>
        <ProductProvider>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/products" element={<ProductsScreen />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/edit/:id" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductDetailScreen />} />
          <Route path="/export" element={<ExportScreen />} />
          <Route path="/import" element={<ImportScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
        </Routes>
        </ProductProvider>
      </CategoryProvider>
    </div>
  );
}

export default App;
