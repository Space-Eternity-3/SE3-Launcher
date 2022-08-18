const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");
const isDev = require("electron-is").dev();
require("electron-store").initRenderer();
const { AreInstallationsRunning } = require("./RendererBridge")();

setupTitlebar();

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        minWidth: 750,
        minHeight: 500,
        icon: path.join(__dirname, "resources", "icon.ico"),
        webPreferences: {
            preload: require.resolve("../preload/preload.js"),
            backgroundThrottling: false,
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            sandbox: false,
        },
        frame: process.platform !== "win32",
        title: "SE3 Launcher",
    });

    mainWindow.on("close", (e) => {
        if (!AreInstallationsRunning()) return;
        const choice = dialog.showMessageBoxSync(mainWindow, {
            type: "question",
            buttons: ["Yes", "No"],
            title: "Are you sure you want to quit?",
            message: "Installations are running.",
        });
        if (choice === 1) {
            e.preventDefault();
        }
    });

    process.on("uncaughtException", (ex) => {
        console.error(ex);
        try {
            mainWindow.webContents.send("uncaught_exception", ex);
        } catch {}
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
