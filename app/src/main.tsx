import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/global.css";
import { App } from "./app";
import { AuthProvider } from "./components/common/auth-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
