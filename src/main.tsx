import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installGlobalRendererErrorReporters } from "./error-boundary";
import { setLocale } from "./lib/i18n";
import "./brand.css";

setLocale("zh-CN");
installGlobalRendererErrorReporters();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
