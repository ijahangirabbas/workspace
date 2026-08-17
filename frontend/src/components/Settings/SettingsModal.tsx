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
    <Modal open={open} title="Workspace Settings" onClose={() => setOpen(false)}>
      <div className="settings-grid">
        <label>
          Workspace Name
          <input
            type="text"
            placeholder="e.g. My Notes"
            value={settings.workspaceName ?? "My Workspace"}
            onChange={(event) =>
              setSettings({
                ...settings,
                workspaceName: event.target.value,
              })
            }
          />
        </label>

        <label>
          User / Profile Name
          <input
            type="text"
            placeholder="e.g. Jahangir"
            value={settings.userName ?? "Jahangir"}
            onChange={(event) =>
              setSettings({
                ...settings,
                userName: event.target.value,
              })
            }
          />
        </label>

        <label>
          Daily Word Goal
          <input
            type="number"
            min={50}
            step={50}
            value={settings.wordGoal ?? 500}
            onChange={(event) =>
              setSettings({
                ...settings,
                wordGoal: Number(event.target.value) || 500,
              })
            }
          />
        </label>

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
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
          </select>
        </label>

        <label>
          Editor Font Size (px)
          <input
            type="number"
            min={13}
            max={24}
            value={settings.fontSize}
            onChange={(event) =>
              setSettings({ ...settings, fontSize: Number(event.target.value) })
            }
          />
        </label>

        <label>
          Autosave Interval (ms)
          <input
            type="number"
            min={400}
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
          Sidebar Width ({settings.sidebarWidth}px)
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
          Editor Max Width ({settings.editorWidth}px)
          <input
            type="range"
            min={680}
            max={1200}
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

