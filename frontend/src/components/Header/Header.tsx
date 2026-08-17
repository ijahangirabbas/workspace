import {
  Download,
  Moon,
  PanelLeftOpen,
  PanelRight,
  Search,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { findFolderPath } from "../../utils/tree";

export function Header() {
  const {
    activeFolderId,
    activePage,
    tree,
    settings,
    setSettings,
    sidebarOpen,
    setSidebarOpen,
    rightPanelOpen,
    setRightPanelOpen,
    setCommandPaletteOpen,
    setExportModalOpen,
  } = useWorkspace();

  const location = findFolderPath(
    tree,
    activePage?.folderId ?? activeFolderId ?? undefined,
  );

  const workspaceName = settings.workspaceName?.trim() || "Workspace";
  const userInitial = (settings.userName?.trim() || "U").charAt(0).toUpperCase();

  return (
    <header className="header">
      <div className="brand">
        <button
          className="logo-button"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Sparkles className="sparkle-icon" size={24} />
          <PanelLeftOpen className="sidebar-icon" size={18} />
        </button>
        <div>
          <strong>{workspaceName}</strong>
          <span>{location}</span>
        </div>
      </div>

      <div
        className="command-search-trigger"
        onClick={() => setCommandPaletteOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open command palette"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setCommandPaletteOpen(true);
          }
        }}
      >
        <Search size={15} />
        <span className="search-placeholder">Search pages, folders, actions...</span>
        <kbd className="search-kbd">Ctrl K</kbd>
      </div>

      <nav className="header-actions" aria-label="Workspace actions">
        <button
          className="icon-button"
          aria-label="Export or Import"
          title="Export / Import"
          onClick={() => setExportModalOpen(true)}
        >
          <Download size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Toggle theme"
          title={`Switch to ${settings.theme === "dark" ? "Light" : "Dark"} Mode`}
          onClick={() =>
            setSettings({
              ...settings,
              theme: settings.theme === "dark" ? "light" : "dark",
            })
          }
        >
          {settings.theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          className="icon-button"
          aria-label="Toggle page information"
          title="Page Info"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          <PanelRight size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Open settings"
          title="Settings"
          onClick={() => window.dispatchEvent(new Event("workspace:settings"))}
        >
          <Settings size={18} />
        </button>
        <div
          className="avatar"
          aria-label={settings.userName || "User profile"}
          title={settings.userName || "User profile"}
        >
          {userInitial}
        </div>
      </nav>
    </header>
  );
}

