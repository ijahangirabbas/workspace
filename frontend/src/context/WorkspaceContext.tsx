import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import type { Folder, FolderNode, Page, Settings } from "../types";
import { buildTree } from "../utils/tree";
import { useLocalStorage } from "../hooks/useLocalStorage";

type SaveStatus = "Saved" | "Saving..." | "Offline";

interface WorkspaceContextValue {
  folders: Folder[];
  pages: Page[];
  tree: FolderNode[];
  favoritePages: Page[];
  activePage: Page | null;
  activeFolderId: string | null;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  commandPaletteOpen: boolean;
  trashModalOpen: boolean;
  exportModalOpen: boolean;
  saveStatus: SaveStatus;
  settings: Settings;
  notice: string | null;
  trashFolders: Folder[];
  trashPages: Page[];
  setActivePageId: (pageId: string | null) => void;
  setActiveFolderId: (folderId: string | null) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setRightPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTrashModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setSettings: (settings: Settings) => void;
  createFolder: (parentId?: string | null) => Promise<Folder | undefined>;
  createPage: (folderId?: string | null) => Promise<Page | undefined>;
  updatePage: (pageId: string, data: Partial<Page>) => Promise<void>;
  updateFolder: (folderId: string, data: Partial<Folder>) => Promise<void>;
  togglePinPage: (pageId: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  loadTrash: () => Promise<void>;
  restorePage: (pageId: string) => Promise<void>;
  restoreFolder: (folderId: string) => Promise<void>;
  permanentDeletePage: (pageId: string) => Promise<void>;
  permanentDeleteFolder: (folderId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  importPage: (data: { folderId: string; title: string; contentHtml: string }) => Promise<void>;
  importWorkspace: (backup: { folders: Partial<Folder>[]; pages: Partial<Page>[] }) => Promise<void>;
  notify: (message: string) => void;
  dbOffline: boolean;
  retryConnection: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: "dark",
  fontSize: 16,
  sidebarWidth: 300,
  autosaveInterval: 1200,
  editorWidth: 860,
  accentColor: "#3B82F6",
  workspaceName: "My Workspace",
  userName: "Jahangir",
  wordGoal: 500,
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [trashFolders, setTrashFolders] = useState<Folder[]>([]);
  const [trashPages, setTrashPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const [notice, setNotice] = useState<string | null>(null);
  const [dbOffline, setDbOffline] = useState(false);
  const [settings, setSettings] = useLocalStorage<Settings>(
    "workspace.settings",
    defaultSettings,
  );

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const load = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
      const healthRes = await fetch(`${API_URL}/health`)
        .then((r) => r.json())
        .catch(() => ({ ok: false, databaseConnected: false }));

      if (!healthRes.databaseConnected) {
        setDbOffline(true);
        setSaveStatus("Offline");
        return;
      }

      const [folderList, pageList] = await Promise.all([
        api.getFolders(),
        api.getPages(),
      ]);
      setFolders(folderList);
      setPages(pageList);
      setSaveStatus("Saved");
      setDbOffline(false);
    } catch {
      setDbOffline(true);
      setSaveStatus("Offline");
      notify("Unable to connect to Workspace API");
    }
  }, [notify]);

  const loadTrash = useCallback(async () => {
    try {
      const [tFolders, tPages] = await Promise.all([
        api.getTrashFolders(),
        api.getTrashPages(),
      ]);
      setTrashFolders(tFolders);
      setTrashPages(tPages);
    } catch {
      notify("Unable to load trash items");
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildTree(folders, pages), [folders, pages]);
  const favoritePages = useMemo(
    () => pages.filter((page) => page.isPinned),
    [pages],
  );
  const activePage = useMemo(
    () => pages.find((page) => page._id === activePageId) ?? null,
    [activePageId, pages],
  );

  const createFolder = useCallback(
    async (parentId: string | null = activeFolderId) => {
      try {
        const folder = await api.createFolder({
          name: "Untitled Folder",
          parentId,
          icon: "Folder",
          color: settings.accentColor,
        });
        setFolders((items) => [...items, folder]);
        setActiveFolderId(folder._id);
        notify("Folder created");
        return folder;
      } catch {
        notify("Folder could not be created");
      }
    },
    [activeFolderId, notify, settings.accentColor],
  );

  const createPage = useCallback(
    async (folderId: string | null = activeFolderId) => {
      let targetFolderId = folderId ?? folders[0]?._id;

      try {
        if (!targetFolderId) {
          const folder = await api.createFolder({
            name: "Inbox",
            parentId: null,
            icon: "Folder",
            color: settings.accentColor,
          });
          setFolders((items) => [...items, folder]);
          targetFolderId = folder._id;
        }

        const page = await api.createPage({
          folderId: targetFolderId,
          title: "Untitled Page",
          icon: "FileText",
        });
        setPages((items) => [page, ...items]);
        setActivePageId(page._id);
        setActiveFolderId(targetFolderId);
        notify("Page created");
        return page;
      } catch {
        notify("Page could not be created");
      }
    },
    [activeFolderId, folders, notify, settings.accentColor],
  );

  const updatePage = useCallback(
    async (pageId: string, data: Partial<Page>) => {
      setSaveStatus("Saving...");
      setPages((items) =>
        items.map((page) =>
          page._id === pageId
            ? { ...page, ...data, updatedAt: new Date().toISOString() }
            : page,
        ),
      );

      try {
        const page = await api.updatePage(pageId, data);
        setPages((items) =>
          items.map((item) => (item._id === pageId ? page : item)),
        );
        setSaveStatus("Saved");
      } catch {
        setSaveStatus("Offline");
        notify("Autosave failed");
      }
    },
    [notify],
  );

  const togglePinPage = useCallback(
    async (pageId: string) => {
      const page = pages.find((p) => p._id === pageId);
      if (!page) return;
      const nextPinned = !page.isPinned;
      await updatePage(pageId, { isPinned: nextPinned });
      notify(nextPinned ? "Added to Favorites" : "Removed from Favorites");
    },
    [notify, pages, updatePage],
  );

  const updateFolder = useCallback(
    async (folderId: string, data: Partial<Folder>) => {
      try {
        const folder = await api.updateFolder(folderId, data);
        setFolders((items) =>
          items.map((item) => (item._id === folderId ? folder : item)),
        );
      } catch {
        notify("Folder could not be updated");
      }
    },
    [notify],
  );

  // Soft Delete Page
  const deletePage = useCallback(
    async (pageId: string) => {
      try {
        await api.deletePage(pageId);
        setPages((items) => items.filter((page) => page._id !== pageId));
        setActivePageId((current) => (current === pageId ? null : current));
        notify("Page moved to Trash");
      } catch {
        notify("Page could not be deleted");
      }
    },
    [notify],
  );

  // Soft Delete Folder
  const deleteFolder = useCallback(
    async (folderId: string) => {
      try {
        await api.deleteFolder(folderId);
        await load();
        setActiveFolderId(null);
        setActivePageId(null);
        notify("Folder moved to Trash");
      } catch {
        notify("Folder could not be deleted");
      }
    },
    [load, notify],
  );

  // Restore Page
  const restorePage = useCallback(
    async (pageId: string) => {
      try {
        await api.restorePage(pageId);
        await load();
        await loadTrash();
        notify("Page restored from Trash");
      } catch {
        notify("Unable to restore page");
      }
    },
    [load, loadTrash, notify],
  );

  // Restore Folder
  const restoreFolder = useCallback(
    async (folderId: string) => {
      try {
        await api.restoreFolder(folderId);
        await load();
        await loadTrash();
        notify("Folder restored from Trash");
      } catch {
        notify("Unable to restore folder");
      }
    },
    [load, loadTrash, notify],
  );

  // Permanent Delete Page
  const permanentDeletePage = useCallback(
    async (pageId: string) => {
      try {
        await api.permanentDeletePage(pageId);
        setTrashPages((items) => items.filter((p) => p._id !== pageId));
        notify("Page permanently deleted");
      } catch {
        notify("Unable to delete page permanently");
      }
    },
    [notify],
  );

  // Permanent Delete Folder
  const permanentDeleteFolder = useCallback(
    async (folderId: string) => {
      try {
        await api.permanentDeleteFolder(folderId);
        setTrashFolders((items) => items.filter((f) => f._id !== folderId));
        notify("Folder permanently deleted");
      } catch {
        notify("Unable to delete folder permanently");
      }
    },
    [notify],
  );

  // Empty Trash
  const emptyTrash = useCallback(async () => {
    try {
      await api.emptyTrash();
      setTrashFolders([]);
      setTrashPages([]);
      notify("Trash emptied");
    } catch {
      notify("Unable to empty trash");
    }
  }, [notify]);

  // Import single page
  const importPage = useCallback(
    async ({
      folderId,
      title,
      contentHtml,
    }: {
      folderId: string;
      title: string;
      contentHtml: string;
    }) => {
      try {
        const page = await api.createPage({
          folderId,
          title: title || "Imported Document",
          content: { type: "html", html: contentHtml },
          icon: "FileText",
        });
        setPages((items) => [page, ...items]);
        setActivePageId(page._id);
        setActiveFolderId(folderId);
        notify("Document imported successfully");
      } catch {
        notify("Failed to import document");
      }
    },
    [notify],
  );

  // Import full workspace backup
  const importWorkspace = useCallback(
    async (backup: {
      folders: Partial<Folder>[];
      pages: Partial<Page>[];
    }) => {
      try {
        const folderIdMap = new Map<string, string>();

        // Create folders first
        for (const f of backup.folders || []) {
          const created = await api.createFolder({
            name: f.name || "Folder",
            icon: f.icon || "Folder",
            color: f.color || "#3B82F6",
            parentId: null,
          });
          if (f._id) {
            folderIdMap.set(f._id, created._id);
          }
        }

        // Reassign parents if applicable
        for (const f of backup.folders || []) {
          if (f._id && f.parentId && folderIdMap.has(f.parentId)) {
            const mappedId = folderIdMap.get(f._id);
            const mappedParentId = folderIdMap.get(f.parentId);
            if (mappedId && mappedParentId) {
              await api.updateFolder(mappedId, { parentId: mappedParentId });
            }
          }
        }

        // Create pages
        for (const p of backup.pages || []) {
          const targetFolderId =
            (p.folderId && folderIdMap.get(p.folderId)) ||
            (backup.folders?.[0]?._id &&
              folderIdMap.get(backup.folders[0]._id)) ||
            folders[0]?._id;

          if (targetFolderId) {
            await api.createPage({
              folderId: targetFolderId,
              title: p.title || "Page",
              content: p.content || { type: "html", html: "" },
              icon: p.icon || "FileText",
              isPinned: p.isPinned ?? false,
            });
          }
        }

        await load();
        notify("Workspace backup imported successfully");
      } catch {
        notify("Failed to import workspace backup");
      }
    },
    [folders, load, notify],
  );

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Ctrl + K or Cmd + K -> Command Palette
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }

      // Ctrl + B -> Toggle Sidebar
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "b" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setSidebarOpen((open) => !open);
      }

      // Ctrl + N -> New Page / Ctrl + Shift + N -> New Folder
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        if (event.shiftKey) void createFolder();
        else void createPage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createFolder, createPage]);

  const value = useMemo(
    () => ({
      folders,
      pages,
      tree,
      favoritePages,
      activePage,
      activeFolderId,
      sidebarOpen,
      rightPanelOpen,
      commandPaletteOpen,
      trashModalOpen,
      exportModalOpen,
      saveStatus,
      settings,
      notice,
      trashFolders,
      trashPages,
      dbOffline,
      setActivePageId,
      setActiveFolderId,
      setSidebarOpen,
      setRightPanelOpen,
      setCommandPaletteOpen,
      setTrashModalOpen,
      setExportModalOpen,
      setSettings,
      createFolder,
      createPage,
      updatePage,
      updateFolder,
      togglePinPage,
      deletePage,
      deleteFolder,
      loadTrash,
      restorePage,
      restoreFolder,
      permanentDeletePage,
      permanentDeleteFolder,
      emptyTrash,
      importPage,
      importWorkspace,
      notify,
      retryConnection: load,
    }),
    [
      folders,
      pages,
      tree,
      favoritePages,
      activePage,
      activeFolderId,
      sidebarOpen,
      rightPanelOpen,
      commandPaletteOpen,
      trashModalOpen,
      exportModalOpen,
      saveStatus,
      settings,
      notice,
      trashFolders,
      trashPages,
      dbOffline,
      createFolder,
      createPage,
      updatePage,
      updateFolder,
      togglePinPage,
      deletePage,
      deleteFolder,
      loadTrash,
      restorePage,
      restoreFolder,
      permanentDeletePage,
      permanentDeleteFolder,
      emptyTrash,
      importPage,
      importWorkspace,
      notify,
      load,
      setSettings,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}

