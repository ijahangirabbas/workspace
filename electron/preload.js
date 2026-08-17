const { contextBridge, ipcRenderer } = require("electron");

// Expose safe API endpoints to the renderer window
contextBridge.exposeInMainWorld("electronAPI", {
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
});
