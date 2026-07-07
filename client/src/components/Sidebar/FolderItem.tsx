import {
  ChevronRight,
  Copy,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import type { FolderNode, Page } from "../../types";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import { FolderTree } from "./FolderTree";

export function FolderItem({
  node,
  depth,
}: {
  node: FolderNode;
  depth: number;
}) {
  const {
    activeFolderId,
    activePage,
    setActiveFolderId,
    setActivePageId,
    createFolder,
    createPage,
    updateFolder,
    deleteFolder,
    deletePage,
  } = useWorkspace();
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(node.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const offset = depth * 14 + 8;

  const commitRename = () => {
    setRenaming(false);
    if (name.trim() && name.trim() !== node.name) {
      void updateFolder(node._id, { name: name.trim() });
    }
  };

  return (
    <div className="folder-node" role="treeitem" aria-expanded={open}>
      <div
        className="tree-row"
        data-active={activeFolderId === node._id && !activePage}
        style={{ paddingLeft: offset }}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuOpen(true);
        }}
      >
        <button
          className="chevron"
          aria-label={open ? "Collapse folder" : "Expand folder"}
          onClick={() => setOpen(!open)}
        >
          <ChevronRight size={14} className={open ? "rotated" : ""} />
        </button>
        <button
          className="tree-label"
          onClick={() => {
            setActivePageId(null);
            setActiveFolderId(node._id);
          }}
          onDoubleClick={() => setRenaming(true)}
        >
          {open ? (
            <FolderOpen size={16} color={node.color} />
          ) : (
            <Folder size={16} color={node.color} />
          )}
          {renaming ? (
            <input
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitRename();
                if (event.key === "Escape") setRenaming(false);
              }}
            />
          ) : (
            <span>{node.name}</span>
          )}
        </button>
        <button
          className="icon-button small ghost"
          aria-label="Folder menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreHorizontal size={15} />
        </button>
        <ContextMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
          <button onClick={() => void createPage(node._id)}>
            <FilePlus size={14} />
            New Page
          </button>
          <button onClick={() => void createFolder(node._id)}>
            <FolderPlus size={14} />
            New Folder
          </button>
          <button onClick={() => setRenaming(true)}>
            <Pencil size={14} />
            Rename
          </button>
          <button
            onClick={() =>
              void updateFolder(node._id, { name: `${node.name} Copy` })
            }
          >
            <Copy size={14} />
            Duplicate Name
          </button>
          <button
            className="danger"
            onClick={() => void deleteFolder(node._id)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </ContextMenu>
      </div>
      {open ? (
        <>
          {node.pages.map((page) => (
            <PageRow
              key={page._id}
              page={page}
              depth={depth + 1}
              active={activePage?._id === page._id}
              onDelete={() => void deletePage(page._id)}
            />
          ))}
          <FolderTree nodes={node.folders} depth={depth + 1} />
        </>
      ) : null}
    </div>
  );
}

function PageRow({
  page,
  depth,
  active,
  onDelete,
}: {
  page: Page;
  depth: number;
  active: boolean;
  onDelete: () => void;
}) {
  const { setActivePageId, setActiveFolderId, updatePage } = useWorkspace();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(page.title);
  const offset = depth * 14 + 28;

  const commitRename = () => {
    setRenaming(false);
    if (title.trim() && title.trim() !== page.title) {
      void updatePage(page._id, { title: title.trim() });
    }
  };

  return (
    <div
      className="tree-row page-row"
      data-active={active}
      style={{ paddingLeft: offset }}
    >
      <button
        className="tree-label"
        onClick={() => {
          setActivePageId(page._id);
          setActiveFolderId(page.folderId);
        }}
        onDoubleClick={() => setRenaming(true)}
      >
        <FileText size={15} />
        {renaming ? (
          <input
            value={title}
            autoFocus
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") setRenaming(false);
            }}
          />
        ) : (
          <span>{page.title}</span>
        )}
      </button>
      <button
        className="icon-button small ghost"
        aria-label="Delete page"
        onClick={onDelete}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
