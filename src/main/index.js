const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");
const isDev = require("electron-is").dev();
require("electron-store").initRenderer();
require("./RendererBridge")();

setupTitlebar();

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        minWidth: 750,
        minHeight: 500,
        icon: path.join(__dirname, "resources", "ikona.ico"),
        webPreferences: {
            preload: require.resolve("../preload/preload.js"),
            backgroundThrottling: false,
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            webviewTag: true,
        },
        frame: false,
        title: "SE3 Launcher",
    });

    process.on("uncaughtException", (ex) => {
        mainWindow.webContents.send("uncaught_exception", ex);
        console.error(ex);
    });

    attachTitlebarToWindow(mainWindow);

    if (isDev) {
        mainWindow.setMenuBarVisibility(false); // dev tools
        const waitOn = require("wait-on");
        await waitOn({ resources: ["http://localhost:3000"] });
        await mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.setMenu(null);
        mainWindow.loadFile("build/index.html");
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
