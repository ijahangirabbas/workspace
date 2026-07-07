import { Header } from "../components/Header/Header";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { EditorPane } from "../components/Editor/EditorPane";
import { RightPanel } from "../components/RightPanel/RightPanel";
import { SettingsModal } from "../components/Settings/SettingsModal";
import { useWorkspace } from "../context/WorkspaceContext";
import { useEffect } from "react";

export function AppLayout() {
  const { sidebarOpen, rightPanelOpen, notice, settings } = useWorkspace();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.setProperty(
      "--primary",
      settings.accentColor,
    );
  }, [settings.accentColor, settings.theme]);

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
      {notice ? (
        <div className="toast" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
