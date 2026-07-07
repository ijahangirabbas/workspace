import { useEffect, useState } from "react";
import { Modal } from "../Modal/Modal";
import { useWorkspace } from "../../context/WorkspaceContext";

export function SettingsModal() {
  const { settings, setSettings } = useWorkspace();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("workspace:settings", handler);
    return () => window.removeEventListener("workspace:settings", handler);
  }, []);

  return (
    <Modal open={open} title="Settings" onClose={() => setOpen(false)}>
      <div className="settings-grid">
        <label>
          Theme
          <select
            value={settings.theme}
            onChange={(event) =>
              setSettings({
                ...settings,
                theme: event.target.value as "dark" | "light",
              })
            }
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label>
          Font Size
          <input
            type="number"
            min={13}
            max={22}
            value={settings.fontSize}
            onChange={(event) =>
              setSettings({ ...settings, fontSize: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Sidebar Width
          <input
            type="range"
            min={240}
            max={380}
            value={settings.sidebarWidth}
            onChange={(event) =>
              setSettings({
                ...settings,
                sidebarWidth: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Autosave Interval
          <input
            type="number"
            min={500}
            step={100}
            value={settings.autosaveInterval}
            onChange={(event) =>
              setSettings({
                ...settings,
                autosaveInterval: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Editor Width
          <input
            type="range"
            min={680}
            max={1100}
            value={settings.editorWidth}
            onChange={(event) =>
              setSettings({
                ...settings,
                editorWidth: Number(event.target.value),
              })
            }
          />
        </label>
        <label>
          Accent Color
          <input
            type="color"
            value={settings.accentColor}
            onChange={(event) =>
              setSettings({ ...settings, accentColor: event.target.value })
            }
          />
        </label>
      </div>
    </Modal>
  );
}
