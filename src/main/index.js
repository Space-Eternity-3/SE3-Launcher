import { app, BrowserWindow, ipcMain, dialog, nativeTheme } from "electron";
import path from "path";
require("electron-store").initRenderer(); // TODO: remove electron-store from the codebase
import { areInstallationsRunning } from "./renderer_bridge/versionManager";
import "./renderer_bridge/utils";
import { is } from "@electron-toolkit/utils";

const isDev = !app.isPackaged;
nativeTheme.themeSource = "dark";

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        minWidth: 750,
        minHeight: 500,
        icon: path.join(__dirname, "resources", "icon.ico"),
        webPreferences: {
            preload: path.join(__dirname, "../preload/index.js"),
            backgroundThrottling: false,
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
        },
        title: "SE3 Launcher",
    });

    mainWindow.on("close", (e) => {
        if (!areInstallationsRunning()) return;
        const choice = dialog.showMessageBoxSync(mainWindow, {
            type: "question",
            buttons: ["Yes", "No"],
            title: "Confirm",
            message: "Are you sure you want to quit? There are installations in progress.",
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

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
        mainWindow.setMenuBarVisibility(false); // allows devtools
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
        mainWindow.setMenu(null);
    }
}

ipcMain.on("isDev", (e) => {
    e.returnValue = is.dev;
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
