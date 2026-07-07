import { Calendar, Clock, FileText, Folder, Hash, WholeWord } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { findFolderPath } from "../../utils/tree";

export function RightPanel() {
  const { activePage, rightPanelOpen, tree } = useWorkspace();

  if (!rightPanelOpen) return null;

  const plainText = getText(activePage?.content);
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return (
    <aside className="right-panel">
      <h2>Page Info</h2>
      {activePage ? (
        <div className="meta-list">
          <Meta icon={FileText} label="Page Icon" value={activePage.icon} />
          <Meta icon={Folder} label="Location" value={findFolderPath(tree, activePage.folderId)} />
          <Meta icon={Calendar} label="Created" value={new Date(activePage.createdAt).toLocaleString()} />
          <Meta icon={Clock} label="Updated" value={new Date(activePage.updatedAt).toLocaleString()} />
          <Meta icon={WholeWord} label="Words" value={String(words)} />
          <Meta icon={Hash} label="Characters" value={String(plainText.length)} />
          <Meta icon={Clock} label="Reading Time" value={`${minutes} min`} />
        </div>
      ) : (
        <p className="muted">No page selected.</p>
      )}
    </aside>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="meta-item">
      <Icon size={15} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getText(content: unknown): string {
  if (content && typeof content === "object" && "html" in content) {
    return String((content as { html?: unknown }).html ?? "").replace(/<[^>]*>/g, " ");
  }

  if (!content || typeof content !== "object") return "";
  const node = content as { text?: string; content?: unknown[] };
  return `${node.text ?? ""} ${(node.content ?? []).map(getText).join(" ")}`.trim();
}
