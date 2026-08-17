import React from "react";
import ReactDOM from "react-dom/client";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AppLayout } from "./layouts/AppLayout";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkspaceProvider>
      <AppLayout />
    </WorkspaceProvider>
  </React.StrictMode>,
);
