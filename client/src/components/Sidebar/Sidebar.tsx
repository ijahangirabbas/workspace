import { FolderPlus, PanelLeftClose, Settings } from "lucide-react";
import { FolderTree } from "./FolderTree";
import { useWorkspace } from "../../context/WorkspaceContext";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, tree, createFolder, settings } = useWorkspace();

  if (!sidebarOpen) return null;

  return (
    <aside className="sidebar" style={{ width: settings.sidebarWidth }}>
      <div className="sidebar-section-title">
        <span>Workspace</span>
        <div className="sidebar-actions">
          <button className="icon-button small" aria-label="Create folder" onClick={() => void createFolder(null)}>
            <FolderPlus size={28} />
          </button>
          <button className="icon-button small" aria-label="Collapse sidebar" onClick={() => setSidebarOpen(false)}>
            <PanelLeftClose size={28} />
          </button>
        </div>
      </div>
      <FolderTree nodes={tree} depth={0} />
      <button className="settings-shortcut" onClick={() => window.dispatchEvent(new Event("workspace:settings"))}>
        <Settings size={16} />
        <span>Settings</span>
      </button>
    </aside>
  );
}
