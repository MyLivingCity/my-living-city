import React from "react";
import ReactDOM from "react-dom/client"; // ✅ important change
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "@/styles/ui/_other.scss";

import { QueryClientProvider } from "react-query";
import UserProfileProvider from "src/providers/UserProfileProvider";
import { queryClient } from "src/lib/clientInitializer";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProfileProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
