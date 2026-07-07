import type { FolderNode } from "../../types";
import { FolderItem } from "./FolderItem";

export function FolderTree({ nodes, depth }: { nodes: FolderNode[]; depth: number }) {
  return (
    <div className="folder-tree" role={depth === 0 ? "tree" : "group"}>
      {nodes.map((node) => (
        <FolderItem key={node._id} node={node} depth={depth} />
      ))}
    </div>
  );
}
