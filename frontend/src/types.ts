export type JsonContent = Record<string, unknown>;

export interface Folder {
  _id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  _id: string;
  folderId: string;
  title: string;
  content: JsonContent;
  icon: string;
  showTimestamps?: boolean;
  disableSpellcheck?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderNode extends Folder {
  folders: FolderNode[];
  pages: Page[];
}

export interface Settings {
  theme: "dark" | "light";
  fontSize: number;
  sidebarWidth: number;
  autosaveInterval: number;
  editorWidth: number;
  accentColor: string;
  workspaceName?: string;
  userName?: string;
  wordGoal?: number;
}

