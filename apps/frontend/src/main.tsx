import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ add this
import { QueryClientProvider } from "react-query";
import UserProfileProvider from "src/providers/UserProfileProvider";
import { queryClient } from "src/lib/clientInitializer";
import App from "./App.tsx";

import "./styles/base.scss";
import "./index.css";
import "@/styles/ui/_other.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProfileProvider>
    </QueryClientProvider>
  </StrictMode>,
);
