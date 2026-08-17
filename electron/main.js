const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

let mainWindow = null;
let backendProcess = null;

// Determine if we are in development mode
const isDev = !app.isPackaged;

// State configuration for window size and position persistence
const stateFile = path.join(app.getPath("userData"), "window-state.json");
let windowState = {
  width: 1024,
  height: 768,
  x: undefined,
  y: undefined,
  isMaximized: false,
};

// Load saved window state
try {
  if (fs.existsSync(stateFile)) {
    windowState = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  }
} catch (err) {
  console.error("Failed to load window state:", err);
}

// Save window state helper
let saveTimeout;
function saveState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const isMax = mainWindow.isMaximized();
        const bounds = isMax ? null : mainWindow.getBounds();
        const state = {
          width: bounds ? bounds.width : windowState.width,
          height: bounds ? bounds.height : windowState.height,
          x: bounds ? bounds.x : windowState.x,
          y: bounds ? bounds.y : windowState.y,
          isMaximized: isMax,
        };
        fs.writeFileSync(stateFile, JSON.stringify(state), "utf8");
        windowState = state;
      }
    } catch (err) {
      console.error("Failed to save window state:", err);
    }
  }, 500);
}

// Spawn the Express backend process in production mode
function startBackend() {
  if (isDev) {
    console.log("Development mode: backend expected to run via npm run dev");
    return;
  }

  // Path to backend index file inside ASAR or app path
  // Since we configured build to copy 'backend/dist/**/*', it will be located here:
  const backendPath = path.join(app.getAppPath(), "backend", "dist", "index.js");

  console.log("Production mode: Spawning Express server at:", backendPath);

  const env = {
    ...process.env,
    PORT: "4000",
    MONGODB_URI: "mongodb://127.0.0.1:27017/workspace",
    CLIENT_ORIGIN: "*", // Allow all origins for the local loopback interface
    NODE_ENV: "production",
  };

  try {
    // Spawn the backend JS script using the Electron Node executable itself
    backendProcess = child_process.fork(backendPath, [], {
      env,
      stdio: "inherit",
    });

    backendProcess.on("error", (err) => {
      console.error("Failed to start Express child process:", err);
    });

    backendProcess.on("exit", (code, signal) => {
      console.log(`Express child process exited with code ${code} (signal: ${signal})`);
    });
  } catch (err) {
    console.error("Exception thrown while spawning backend process:", err);
  }
}

// Kill backend child process
function killBackend() {
  if (backendProcess) {
    console.log("Terminating Express child process...");
    backendProcess.kill();
    backendProcess = null;
  }
}

function createWindow() {
  startBackend();

  mainWindow = new BrowserWindow({
    title: "Workspace",
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 800,
    minHeight: 600,
    // Custom icon path configuration
    icon: fs.existsSync(path.join(__dirname, "../assets/icon.ico"))
      ? path.join(__dirname, "../assets/icon.ico")
      : path.join(__dirname, "../assets/icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Handle window layout change events
  mainWindow.on("resize", saveState);
  mainWindow.on("move", saveState);
  mainWindow.on("close", saveState);

  // Load React Frontend
  if (isDev) {
    // In dev, load Vite dev server
    const loadDevServer = () => {
      mainWindow.loadURL("http://localhost:5173").catch(() => {
        console.log("Vite dev server not ready yet. Retrying in 1s...");
        setTimeout(loadDevServer, 1000);
      });
    };
    loadDevServer();
  } else {
    // In prod, load built static file
    const productionFilePath = path.join(__dirname, "../frontend/dist/index.html");
    mainWindow.loadFile(productionFilePath).catch((err) => {
      console.error("Failed to load production index.html:", err);
    });
  }

  // Setup Menu Template
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload", visible: isDev },
        { role: "forceReload", visible: isDev },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { role: "close" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle triggers
app.whenReady().then(() => {
  // Register IPC API handles
  ipcMain.handle("get-app-info", () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
    };
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Safeguard process termination on exit
app.on("will-quit", () => {
  killBackend();
});

process.on("exit", () => {
  killBackend();
});
