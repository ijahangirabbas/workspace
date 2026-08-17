import { useEffect } from "react";
import { Folder, FileText, RotateCcw, Trash2 } from "lucide-react";
import { Modal } from "../Modal/Modal";
import { useWorkspace } from "../../context/WorkspaceContext";

export function TrashModal() {
  const {
    trashModalOpen,
    setTrashModalOpen,
    trashFolders,
    trashPages,
    loadTrash,
    restorePage,
    restoreFolder,
    permanentDeletePage,
    permanentDeleteFolder,
    emptyTrash,
  } = useWorkspace();

  useEffect(() => {
    if (trashModalOpen) {
      void loadTrash();
    }
  }, [loadTrash, trashModalOpen]);

  const isEmpty = trashFolders.length === 0 && trashPages.length === 0;

  return (
    <Modal
      open={trashModalOpen}
      title="Trash & Deleted Items"
      onClose={() => setTrashModalOpen(false)}
    >
      <div className="trash-modal-content">
        <div className="trash-modal-header">
          <p className="trash-modal-desc">
            Items in the trash can be restored back to your workspace or permanently purged.
          </p>
          {!isEmpty && (
            <button
              className="danger-button small"
              onClick={() => {
                if (window.confirm("Are you sure you want to permanently empty all trash items? This cannot be undone.")) {
                  void emptyTrash();
                }
              }}
            >
              <Trash2 size={14} />
              Empty All Trash
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="trash-empty-state">
            <Trash2 size={36} className="muted" />
            <p>Trash is empty. No deleted pages or folders.</p>
          </div>
        ) : (
          <div className="trash-list">
            {trashFolders.length > 0 && (
              <div className="trash-section">
                <h4>Folders ({trashFolders.length})</h4>
                <div className="trash-items-group">
                  {trashFolders.map((folder) => (
                    <div key={folder._id} className="trash-item-row">
                      <div className="trash-item-info">
                        <Folder size={16} color={folder.color || "#3B82F6"} />
                        <span className="trash-item-name">{folder.name}</span>
                        {folder.deletedAt && (
                          <small className="trash-item-date">
                            Deleted {new Date(folder.deletedAt).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                      <div className="trash-item-actions">
                        <button
                          className="icon-button small"
                          title="Restore folder"
                          onClick={() => void restoreFolder(folder._id)}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          className="icon-button small danger"
                          title="Delete permanently"
                          onClick={() => {
                            if (window.confirm(`Permanently delete folder "${folder.name}"?`)) {
                              void permanentDeleteFolder(folder._id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trashPages.length > 0 && (
              <div className="trash-section">
                <h4>Pages ({trashPages.length})</h4>
                <div className="trash-items-group">
                  {trashPages.map((page) => (
                    <div key={page._id} className="trash-item-row">
                      <div className="trash-item-info">
                        <FileText size={16} />
                        <span className="trash-item-name">{page.title}</span>
                        {page.deletedAt && (
                          <small className="trash-item-date">
                            Deleted {new Date(page.deletedAt).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                      <div className="trash-item-actions">
                        <button
                          className="icon-button small"
                          title="Restore page"
                          onClick={() => void restorePage(page._id)}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          className="icon-button small danger"
                          title="Delete permanently"
                          onClick={() => {
                            if (window.confirm(`Permanently delete page "${page.title}"?`)) {
                              void permanentDeletePage(page._id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
