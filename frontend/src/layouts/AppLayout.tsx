import { Header } from "../components/Header/Header";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { EditorPane } from "../components/Editor/EditorPane";
import { RightPanel } from "../components/RightPanel/RightPanel";
import { SettingsModal } from "../components/Settings/SettingsModal";
import { CommandPalette } from "../components/CommandPalette/CommandPalette";
import { TrashModal } from "../components/TrashModal/TrashModal";
import { ExportImportModal } from "../components/ExportModal/ExportImportModal";
import { useWorkspace } from "../context/WorkspaceContext";
import { useEffect } from "react";

export function AppLayout() {
  const {
    sidebarOpen,
    rightPanelOpen,
    notice,
    settings,
    dbOffline,
    retryConnection,
  } = useWorkspace();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.setProperty(
      "--primary",
      settings.accentColor,
    );
  }, [settings.accentColor, settings.theme]);

  if (dbOffline) {
    return (
      <div className="db-error-layout">
        <div className="db-error-card">
          <div className="db-error-icon">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
              <path d="M3 12A9 3 0 0 0 21 12"></path>
              <line x1="18" y1="18" x2="22" y2="22"></line>
              <line x1="22" y1="18" x2="18" y2="22"></line>
            </svg>
          </div>
          <h1>Database Connection Offline</h1>
          <p>
            Workspace is unable to connect to your local MongoDB service at:
          </p>
          <code className="db-error-code">
            mongodb://127.0.0.1:27017/workspace
          </code>

          <div className="db-troubleshoot">
            <h3>How to resolve this:</h3>
            <ol>
              <li>
                Ensure <strong>MongoDB Community Server</strong> is installed on this computer.
              </li>
              <li>
                Verify that the <strong>MongoDB Windows Service</strong> is running (run <code>services.msc</code> in Windows search and check "MongoDB Server").
              </li>
              <li>
                If you recently started MongoDB, click the button below to retry the connection.
              </li>
            </ol>
          </div>

          <button className="db-retry-button" onClick={retryConnection}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <div
        className="workspace-grid"
        data-sidebar-open={sidebarOpen}
        data-panel-open={rightPanelOpen}
      >
        <Sidebar />
        <EditorPane />
        <RightPanel />
      </div>
      <SettingsModal />
      <CommandPalette />
      <TrashModal />
      <ExportImportModal />
      {notice ? (
        <div className="toast" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}

