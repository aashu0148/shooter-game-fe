import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./contexts/app.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster position="top-right" richColors />
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
