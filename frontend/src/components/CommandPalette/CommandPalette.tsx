import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Download,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  Moon,
  Search,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    pages,
    folders,
    setActivePageId,
    setActiveFolderId,
    createPage,
    createFolder,
    setSettings,
    settings,
    setTrashModalOpen,
    setExportModalOpen,
  } = useWorkspace();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const quickActions = [
      {
        id: "action-new-page",
        label: "Create New Page",
        category: "Actions",
        icon: FilePlus,
        run: () => void createPage(),
      },
      {
        id: "action-new-folder",
        label: "Create New Folder",
        category: "Actions",
        icon: FolderPlus,
        run: () => void createFolder(null),
      },
      {
        id: "action-toggle-theme",
        label: `Switch to ${settings.theme === "dark" ? "Light" : "Dark"} Theme`,
        category: "Actions",
        icon: settings.theme === "dark" ? Sun : Moon,
        run: () =>
          setSettings({
            ...settings,
            theme: settings.theme === "dark" ? "light" : "dark",
          }),
      },
      {
        id: "action-open-trash",
        label: "Open Trash / Bin",
        category: "Actions",
        icon: Trash2,
        run: () => setTrashModalOpen(true),
      },
      {
        id: "action-export-import",
        label: "Export / Import Workspace...",
        category: "Actions",
        icon: Download,
        run: () => setExportModalOpen(true),
      },
      {
        id: "action-open-settings",
        label: "Open Settings",
        category: "Actions",
        icon: Settings,
        run: () => window.dispatchEvent(new Event("workspace:settings")),
      },
    ];

    if (!q) {
      return quickActions;
    }

    const matchedActions = quickActions.filter((action) =>
      action.label.toLowerCase().includes(q),
    );

    const matchedFolders = folders
      .filter((folder) => folder.name.toLowerCase().includes(q))
      .map((folder) => ({
        id: `folder-${folder._id}`,
        label: folder.name,
        category: "Folders",
        icon: Folder,
        run: () => {
          setActivePageId(null);
          setActiveFolderId(folder._id);
        },
      }));

    const matchedPages = pages
      .filter((page) => page.title.toLowerCase().includes(q))
      .map((page) => ({
        id: `page-${page._id}`,
        label: page.title,
        category: "Pages",
        icon: FileText,
        run: () => {
          setActivePageId(page._id);
          setActiveFolderId(page.folderId);
        },
      }));

    return [...matchedActions, ...matchedFolders, ...matchedPages];
  }, [
    createFolder,
    createPage,
    folders,
    pages,
    query,
    setActiveFolderId,
    setActivePageId,
    setExportModalOpen,
    setSettings,
    setTrashModalOpen,
    settings,
  ]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  if (!commandPaletteOpen) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setCommandPaletteOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? (items.length ? items.length - 1 : 0) : prev - 1,
      );
      return;
    }

    if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      const action = items[selectedIndex];
      setCommandPaletteOpen(false);
      action.run();
    }
  };

  return (
    <div
      className="command-palette-backdrop"
      role="presentation"
      onMouseDown={() => setCommandPaletteOpen(false)}
    >
      <div
        className="command-palette-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="command-palette-header">
          <Search size={18} className="command-palette-search-icon" />
          <input
            ref={inputRef}
            className="command-palette-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search documents..."
          />
          <kbd className="command-palette-esc">ESC</kbd>
        </div>

        <div className="command-palette-results">
          {items.length === 0 ? (
            <div className="command-palette-empty">No results found</div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-palette-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    item.run();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Icon size={16} className="command-palette-item-icon" />
                  <span className="command-palette-item-label">
                    {item.label}
                  </span>
                  <span className="command-palette-item-category">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
