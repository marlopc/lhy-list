import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { FileProvider } from "./contexts/file";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <FileProvider>
      <App />
    </FileProvider>
  </React.StrictMode>
);
