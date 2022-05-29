const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
require("@electron/remote/main").initialize();
require("electron-store").initRenderer();
require("./main/RendererBridge")();

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        minWidth: 750,
        minHeight: 500,
        icon: path.join(__dirname, "resources", "ikona.ico"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            backgroundThrottling: false,
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            webviewTag: true,
        },
        frame: false,
        title: "SE3 Launcher",
    });

    require("@electron/remote/main").enable(mainWindow.webContents);
    if (isDev) {
        mainWindow.setMenuBarVisibility(false); // dev tools
        const waitOn = require("wait-on");
        await waitOn({ resources: ["http://localhost:3000"] });
        await mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.setMenu(null);
        mainWindow.loadURL(path.join(__dirname, "./build/index.html"));
    }
}

ipcMain.on("isDev", (e) => {
    e.returnValue = isDev;
});

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});
