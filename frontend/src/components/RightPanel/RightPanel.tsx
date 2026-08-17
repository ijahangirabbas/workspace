import {
  Calendar,
  Clock,
  FileText,
  Folder,
  Hash,
  Star,
  Target,
  WholeWord,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { findFolderPath } from "../../utils/tree";

export function RightPanel() {
  const { activePage, rightPanelOpen, tree, settings, togglePinPage } =
    useWorkspace();

  if (!rightPanelOpen) return null;

  const plainText = getText(activePage?.content);
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const characters = plainText.length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  const paragraphs = activePage?.content
    ? getParagraphsCount(activePage.content)
    : 0;

  const wordGoal = settings.wordGoal || 500;
  const goalProgress = Math.min(100, Math.round((words / wordGoal) * 100));

  return (
    <aside className="right-panel">
      <div className="right-panel-header">
        <h2>Page Insights</h2>
        {activePage && (
          <button
            className={`icon-button small ghost ${activePage.isPinned ? "active" : ""}`}
            title={activePage.isPinned ? "Remove from Favorites" : "Add to Favorites"}
            onClick={() => void togglePinPage(activePage._id)}
          >
            <Star
              size={15}
              className={`star-icon ${activePage.isPinned ? "filled" : ""}`}
            />
          </button>
        )}
      </div>

      {activePage ? (
        <div className="meta-list">
          <div className="writing-goal-card">
            <div className="goal-header">
              <div className="goal-title">
                <Target size={15} />
                <span>Writing Target</span>
              </div>
              <span className="goal-count">
                <strong>{words}</strong> / {wordGoal} words
              </span>
            </div>
            <div className="goal-progress-bar">
              <div
                className="goal-progress-fill"
                style={{
                  width: `${goalProgress}%`,
                  backgroundColor:
                    goalProgress >= 100 ? "var(--success)" : "var(--primary)",
                }}
              />
            </div>
            <div className="goal-footer">
              <small>{goalProgress}% completed</small>
              {goalProgress >= 100 && (
                <small className="goal-achieved">Goal reached! 🎉</small>
              )}
            </div>
          </div>

          <div className="meta-stats-grid">
            <div className="stat-card">
              <WholeWord size={16} />
              <div className="stat-info">
                <span className="stat-value">{words}</span>
                <span className="stat-label">Words</span>
              </div>
            </div>
            <div className="stat-card">
              <Hash size={16} />
              <div className="stat-info">
                <span className="stat-value">{characters}</span>
                <span className="stat-label">Characters</span>
              </div>
            </div>
            <div className="stat-card">
              <FileText size={16} />
              <div className="stat-info">
                <span className="stat-value">{paragraphs}</span>
                <span className="stat-label">Paragraphs</span>
              </div>
            </div>
            <div className="stat-card">
              <Clock size={16} />
              <div className="stat-info">
                <span className="stat-value">{minutes} min</span>
                <span className="stat-label">Read Time</span>
              </div>
            </div>
          </div>

          <div className="meta-divider" />

          <Meta
            icon={Folder}
            label="Location"
            value={findFolderPath(tree, activePage.folderId)}
          />
          <Meta
            icon={Calendar}
            label="Created"
            value={new Date(activePage.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
          <Meta
            icon={Clock}
            label="Updated"
            value={new Date(activePage.updatedAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>
      ) : (
        <p className="muted">Select a page to view document metrics and statistics.</p>
      )}
    </aside>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="meta-item">
      <Icon size={14} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getText(content: unknown): string {
  if (content && typeof content === "object" && "html" in content) {
    return String((content as { html?: unknown }).html ?? "").replace(
      /<[^>]*>/g,
      " ",
    );
  }

  if (!content || typeof content !== "object") return "";
  const node = content as { text?: string; content?: unknown[] };
  return `${node.text ?? ""} ${(node.content ?? []).map(getText).join(" ")}`.trim();
}

function getParagraphsCount(content: unknown): number {
  if (content && typeof content === "object" && "html" in content) {
    const html = String((content as { html?: unknown }).html ?? "");
    const matches = html.match(/<(p|h[1-6]|blockquote|pre|li)[^>]*>/gi);
    return matches ? matches.length : html.trim() ? 1 : 0;
  }
  return 0;
}

