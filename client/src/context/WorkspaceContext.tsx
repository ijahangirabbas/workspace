import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { Folder, FolderNode, Page, Settings } from "../types";
import { buildTree } from "../utils/tree";
import { useLocalStorage } from "../hooks/useLocalStorage";

type SaveStatus = "Saved" | "Saving..." | "Offline";

interface WorkspaceContextValue {
  folders: Folder[];
  pages: Page[];
  tree: FolderNode[];
  activePage: Page | null;
  activeFolderId: string | null;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  saveStatus: SaveStatus;
  settings: Settings;
  notice: string | null;
  setActivePageId: (pageId: string | null) => void;
  setActiveFolderId: (folderId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setSettings: (settings: Settings) => void;
  createFolder: (parentId?: string | null) => Promise<void>;
  createPage: (folderId?: string | null) => Promise<void>;
  updatePage: (pageId: string, data: Partial<Page>) => Promise<void>;
  updateFolder: (folderId: string, data: Partial<Folder>) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
}

const defaultSettings: Settings = {
  theme: "dark",
  fontSize: 16,
  sidebarWidth: 300,
  autosaveInterval: 1200,
  editorWidth: 860,
  accentColor: "#3B82F6"
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");
  const [notice, setNotice] = useState<string | null>(null);
  const [settings, setSettings] = useLocalStorage<Settings>("workspace.settings", defaultSettings);

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }, []);

  const load = useCallback(async () => {
    try {
      const [folderList, pageList] = await Promise.all([api.getFolders(), api.getPages()]);
      setFolders(folderList);
      setPages(pageList);
      setSaveStatus("Saved");
    } catch {
      setSaveStatus("Offline");
      notify("Unable to connect to Workspace API");
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildTree(folders, pages), [folders, pages]);
  const activePage = useMemo(() => pages.find((page) => page._id === activePageId) ?? null, [activePageId, pages]);

  const createFolder = useCallback(
    async (parentId: string | null = activeFolderId) => {
      try {
        const folder = await api.createFolder({ name: "Untitled Folder", parentId, icon: "Folder", color: settings.accentColor });
        setFolders((items) => [...items, folder]);
        setActiveFolderId(folder._id);
      } catch {
        notify("Folder could not be created");
      }
    },
    [activeFolderId, notify, settings.accentColor]
  );

  const createPage = useCallback(
    async (folderId: string | null = activeFolderId) => {
      let targetFolderId = folderId ?? folders[0]?._id;

      try {
        if (!targetFolderId) {
          const folder = await api.createFolder({ name: "Inbox", parentId: null, icon: "Folder", color: settings.accentColor });
          setFolders((items) => [...items, folder]);
          targetFolderId = folder._id;
        }

        const page = await api.createPage({ folderId: targetFolderId, title: "Untitled Page", icon: "FileText" });
        setPages((items) => [page, ...items]);
        setActivePageId(page._id);
        setActiveFolderId(targetFolderId);
      } catch {
        notify("Page could not be created");
      }
    },
    [activeFolderId, folders, notify, settings.accentColor]
  );

  const updatePage = useCallback(
    async (pageId: string, data: Partial<Page>) => {
      setSaveStatus("Saving...");
      setPages((items) => items.map((page) => (page._id === pageId ? { ...page, ...data, updatedAt: new Date().toISOString() } : page)));

      try {
        const page = await api.updatePage(pageId, data);
        setPages((items) => items.map((item) => (item._id === pageId ? page : item)));
        setSaveStatus("Saved");
      } catch {
        setSaveStatus("Offline");
        notify("Autosave failed");
      }
    },
    [notify]
  );

  const updateFolder = useCallback(
    async (folderId: string, data: Partial<Folder>) => {
      try {
        const folder = await api.updateFolder(folderId, data);
        setFolders((items) => items.map((item) => (item._id === folderId ? folder : item)));
      } catch {
        notify("Folder could not be updated");
      }
    },
    [notify]
  );

  const deletePage = useCallback(
    async (pageId: string) => {
      try {
        await api.deletePage(pageId);
        setPages((items) => items.filter((page) => page._id !== pageId));
        setActivePageId((current) => (current === pageId ? null : current));
      } catch {
        notify("Page could not be deleted");
      }
    },
    [notify]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      try {
        await api.deleteFolder(folderId);
        await load();
        setActiveFolderId(null);
        setActivePageId(null);
      } catch {
        notify("Folder could not be deleted");
      }
    },
    [load, notify]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen((open) => !open);
      }

      if (event.ctrlKey && event.key.toLowerCase() === "n") {
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
      activePage,
      activeFolderId,
      sidebarOpen,
      rightPanelOpen,
      saveStatus,
      settings,
      notice,
      setActivePageId,
      setActiveFolderId,
      setSidebarOpen,
      setRightPanelOpen,
      setSettings,
      createFolder,
      createPage,
      updatePage,
      updateFolder,
      deletePage,
      deleteFolder
    }),
    [
      activeFolderId,
      activePage,
      createFolder,
      createPage,
      deleteFolder,
      deletePage,
      folders,
      notice,
      pages,
      rightPanelOpen,
      saveStatus,
      settings,
      sidebarOpen,
      tree,
      updateFolder,
      updatePage
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}
