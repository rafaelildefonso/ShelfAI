import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App.tsx";
import { setupFetchInterceptor } from "./config/fetchInterceptor";

// Initialize fetch interceptor
setupFetchInterceptor();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
