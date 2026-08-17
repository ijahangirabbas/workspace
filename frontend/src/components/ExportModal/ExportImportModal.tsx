import { useRef, useState } from "react";
import {
  Download,
  FileCode,
  FileDown,
  FileText,
  FolderUp,
  Upload,
} from "lucide-react";
import { Modal } from "../Modal/Modal";
import { useWorkspace } from "../../context/WorkspaceContext";

export function ExportImportModal() {
  const {
    exportModalOpen,
    setExportModalOpen,
    activePage,
    folders,
    pages,
    activeFolderId,
    importPage,
    importWorkspace,
    notify,
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);

  const getPageHtml = (): string => {
    if (!activePage?.content) return "";
    if (
      typeof activePage.content === "object" &&
      "html" in activePage.content
    ) {
      return String((activePage.content as { html?: unknown }).html ?? "");
    }
    return "";
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(`Exported "${filename}"`);
  };

  // Convert HTML to simple markdown
  const htmlToMarkdown = (html: string): string => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i>(.*?)<\/i>/gi, "*$1*")
      .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
      .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n\n")
      .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<ul[^>]*>/gi, "")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<ol[^>]*>/gi, "")
      .replace(/<\/ol>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "---\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const exportMarkdown = () => {
    if (!activePage) return;
    const body = htmlToMarkdown(getPageHtml());
    const md = `# ${activePage.title}\n\n${body}`;
    const filename = `${activePage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.md`;
    downloadFile(filename, md, "text/markdown;charset=utf-8");
  };

  const exportHtml = () => {
    if (!activePage) return;
    const rawHtml = getPageHtml();
    const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${activePage.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; padding: 0 20px; color: #1e293b; }
    h1 { font-size: 2.2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    pre { background: #f1f5f9; padding: 15px; border-radius: 6px; overflow-x: auto; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    blockquote { border-left: 4px solid #3b82f6; margin-left: 0; padding-left: 16px; color: #64748b; }
  </style>
</head>
<body>
  <h1>${activePage.title}</h1>
  ${rawHtml}
</body>
</html>`;
    const filename = `${activePage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.html`;
    downloadFile(filename, doc, "text/html;charset=utf-8");
  };

  const exportPlainText = () => {
    if (!activePage) return;
    const text = `${activePage.title}\n\n${htmlToMarkdown(getPageHtml())}`;
    const filename = `${activePage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.txt`;
    downloadFile(filename, text, "text/plain;charset=utf-8");
  };

  const exportWorkspaceJson = () => {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      folders,
      pages,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    downloadFile("workspace-backup.json", jsonStr, "application/json");
  };

  const handleDocumentFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const title = file.name.replace(/\.[^/.]+$/, "");
      const targetFolderId = activeFolderId || folders[0]?._id;

      if (!targetFolderId) {
        notify("Please create a folder before importing documents");
        return;
      }

      // Format markdown/text lines as HTML paragraphs
      const html = text
        .split("\n\n")
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br/>")}</p>`)
        .join("");

      await importPage({
        folderId: targetFolderId,
        title,
        contentHtml: html,
      });
      setExportModalOpen(false);
    } catch {
      notify("Failed to read document file");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleWorkspaceBackupChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.folders || !backup.pages) {
        throw new Error("Invalid workspace backup structure");
      }
      await importWorkspace(backup);
      setExportModalOpen(false);
    } catch {
      notify("Invalid workspace JSON backup file");
    } finally {
      setImporting(false);
      if (jsonBackupInputRef.current) jsonBackupInputRef.current.value = "";
    }
  };

  return (
    <Modal
      open={exportModalOpen}
      title="Export & Import"
      onClose={() => setExportModalOpen(false)}
    >
      <div className="export-modal-grid">
        <section className="export-section">
          <h3>Export Active Page</h3>
          {activePage ? (
            <div className="export-button-group">
              <button className="export-btn" onClick={exportMarkdown}>
                <FileCode size={16} />
                <span>Markdown (.md)</span>
              </button>
              <button className="export-btn" onClick={exportHtml}>
                <FileDown size={16} />
                <span>HTML (.html)</span>
              </button>
              <button className="export-btn" onClick={exportPlainText}>
                <FileText size={16} />
                <span>Plain Text (.txt)</span>
              </button>
            </div>
          ) : (
            <p className="muted">No active page selected to export.</p>
          )}
        </section>

        <section className="export-section">
          <h3>Full Workspace Backup</h3>
          <p className="section-desc">
            Export all folders, pages, and configurations as a single JSON file.
          </p>
          <button className="export-btn primary" onClick={exportWorkspaceJson}>
            <Download size={16} />
            <span>Export Workspace JSON Backup</span>
          </button>
        </section>

        <section className="export-section">
          <h3>Import to Workspace</h3>
          <div className="export-button-group">
            <button
              className="export-btn"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Import Markdown / Text Document</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.html"
              style={{ display: "none" }}
              onChange={handleDocumentFileChange}
            />

            <button
              className="export-btn"
              disabled={importing}
              onClick={() => jsonBackupInputRef.current?.click()}
            >
              <FolderUp size={16} />
              <span>Restore Workspace from JSON Backup</span>
            </button>
            <input
              ref={jsonBackupInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleWorkspaceBackupChange}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
