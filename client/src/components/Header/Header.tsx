import {
  ChevronsLeft,
  ChevronsRight,
  Moon,
  PanelRight,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { useMemo, useState } from "react";
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
    pages,
    folders,
    setActivePageId,
    setActiveFolderId
  } = useWorkspace();
  const [query, setQuery] = useState("");

  const location = findFolderPath(tree, activePage?.folderId ?? activeFolderId ?? undefined);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const value = query.toLowerCase();
    return [
      ...folders.filter((folder) => folder.name.toLowerCase().includes(value)).map((folder) => ({ id: folder._id, label: folder.name, type: "folder" })),
      ...pages.filter((page) => page.title.toLowerCase().includes(value)).map((page) => ({ id: page._id, label: page.title, type: "page" }))
    ].slice(0, 8);
  }, [folders, pages, query]);

  return (
    <header className="header">
      <div className="brand">
        {/* <button
          className="icon-button"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronsLeft size={18} />
          ) : (
            <ChevronsRight size={18} />
          )}
        </button> */}
        {/* <div className="logo" aria-hidden="true"><Sparkles size={16} /></div> */}
        <button
          className="logo-button"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Sparkles className="sparkle-icon" size={24} />
          <PanelLeftOpen className="sidebar-icon" size={18} />
        </button>
        <div>
          <strong>Jahangir's</strong>
          <span>{location}</span>
        </div>
      </div>
      <div className="command-search">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search folders and pages"
          aria-label="Search"
        />
        {results.length ? (
          <div className="search-popover">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => {
                  if (result.type === "page") setActivePageId(result.id);
                  else {
                    setActivePageId(null);
                    setActiveFolderId(result.id);
                  }
                  setQuery("");
                }}
              >
                <span>{result.label}</span>
                <small>{result.type}</small>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <nav className="header-actions" aria-label="Workspace actions">
        <button
          className="icon-button"
          aria-label="Toggle theme"
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
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          <PanelRight size={18} />
        </button>
        <button
          className="icon-button"
          aria-label="Open settings"
          onClick={() => window.dispatchEvent(new Event("workspace:settings"))}
        >
          <Settings size={18} />
        </button>
        <div className="avatar" aria-label="User avatar"></div>
      </nav>
    </header>
  );
}

