import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { StoreProvider } from "./contexts/store";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
