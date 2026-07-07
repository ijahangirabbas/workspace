import type { Folder, FolderNode, Page } from "../types";

export function buildTree(folders: Folder[], pages: Page[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  folders.forEach((folder) => {
    nodes.set(folder._id, { ...folder, folders: [], pages: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.folders.push(node);
    } else {
      roots.push(node);
    }
  });

  pages.forEach((page) => {
    nodes.get(page.folderId)?.pages.push(page);
  });

  const sortNodes = (items: FolderNode[]) => {
    items.sort((first, second) => first.name.localeCompare(second.name));
    items.forEach((item) => {
      item.pages.sort((first, second) => first.title.localeCompare(second.title));
      sortNodes(item.folders);
    });
  };

  sortNodes(roots);
  return roots;
}

export function findFolderPath(nodes: FolderNode[], folderId?: string): string {
  if (!folderId) return "Workspace";

  const walk = (items: FolderNode[], trail: string[]): string[] | null => {
    for (const item of items) {
      const nextTrail = [...trail, item.name];
      if (item._id === folderId) return nextTrail;
      const nested = walk(item.folders, nextTrail);
      if (nested) return nested;
    }

    return null;
  };

  return walk(nodes, ["Workspace"])?.join(" / ") ?? "Workspace";
}
