import {
  FileText,
  FolderPlus,
  PanelLeftClose,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { FolderTree } from "./FolderTree";
import { useWorkspace } from "../../context/WorkspaceContext";

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    tree,
    favoritePages,
    activePage,
    setActivePageId,
    setActiveFolderId,
    createFolder,
    settings,
    setTrashModalOpen,
  } = useWorkspace();

  if (!sidebarOpen) return null;

  return (
    <aside className="sidebar" style={{ width: settings.sidebarWidth }}>
      <div className="sidebar-section-title">
        <span>Workspace</span>
        <div className="sidebar-actions">
          <button
            className="icon-button small"
            aria-label="Create folder"
            onClick={() => void createFolder(null)}
          >
            <FolderPlus size={28} />
          </button>
          <button
            className="icon-button small"
            aria-label="Collapse sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose size={28} />
          </button>
        </div>
      </div>

      <div className="sidebar-tree-container">
        {favoritePages.length > 0 && (
          <div className="sidebar-favorites-group">
            <div className="sidebar-group-title">
              <Star size={12} className="star-icon filled" />
              <span>Favorites</span>
            </div>
            {favoritePages.map((page) => (
              <div
                key={`fav-${page._id}`}
                className="tree-row page-row favorite-row"
                data-active={activePage?._id === page._id}
                onClick={() => {
                  setActivePageId(page._id);
                  setActiveFolderId(page.folderId);
                }}
              >
                <button className="tree-label">
                  <FileText size={15} />
                  <span>{page.title}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <FolderTree nodes={tree} depth={0} />
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-footer-btn"
          onClick={() => setTrashModalOpen(true)}
          title="Trash"
        >
          <Trash2 size={16} />
          <span>Trash</span>
        </button>
        <button
          className="sidebar-footer-btn"
          onClick={() => window.dispatchEvent(new Event("workspace:settings"))}
          title="Settings"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}

