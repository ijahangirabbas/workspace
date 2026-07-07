import { useEffect, type ReactNode } from "react";

export function ContextMenu({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const close = () => onClose();
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="context-menu" role="menu" onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  );
}
