const axios = require("axios").default;
const { getCurrentWindow } = require("@electron/remote");
const { contextBridge, ipcRenderer } = require("electron");
const { URL } = require("url");
const Titlebar = require("@6c65726f79/custom-titlebar");
const isDev = ipcRenderer.sendSync("isDev");
const Store = require("electron-store");
const electron = require("electron");
const fs = require("fs");
const debugConfig = fs.existsSync("./debugConfig.json") ? require("./debugConfig.json") : {};

const store = new Store();

window.addEventListener("DOMContentLoaded", () => {
    // Open external links in browser
    document.querySelector('body').addEventListener('click', event => {
        if (event.target.tagName.toLowerCase() === 'a') {
            const absoluteUrl = new RegExp('^(?:[a-z]+:)?//', 'i');
            if (!absoluteUrl.test(event.target.href)) return;
            event.preventDefault();
            electron.shell.openExternal(event.target.href);
        }
    });
    
    const currentWindow = getCurrentWindow();
    new Titlebar({
        backgroundColor: "#363636",
        titleHorizontalAlignment: "left",
        menu: null,
        backgroundUnfocusEffect: false,
        onMinimize: () => currentWindow.minimize(),
        onMaximize: () => (currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize()),
        onClose: () => currentWindow.close(),
        isMaximized: () => currentWindow.isMaximized(),
    });
});

const versionsApiSettings = {
    root: (isDev && debugConfig.localServer) ? "http://localhost/" : "https://nadwey.pl/",
    SE3Dir: "./kamiloso/SE3/",
    ImagesDir: "./Images",
    LauncherDir: "./Launcher",
    VersionsDir: "./Versions",
    VersionsFilesDir: "./Versions/Releases",
    VersionsInfo: "./Versions/Versions.php",
    LauncherInfo: "./kamiloso/SE3/Launcher/Launcher.md",

    GetSE3Dir: () => {
        return new URL(versionsApiSettings.SE3Dir, versionsApiSettings.root).toString();
    },

    GetImagesDir: () => {
        return new URL(versionsApiSettings.ImagesDir, versionsApiSettings.GetSE3Dir()).toString();
    },

    GetVersionsDir: () => {
        return new URL(versionsApiSettings.VersionsDir, versionsApiSettings.GetSE3Dir()).toString();
    },

    GetVersionsFilesDir: () => {
        return new URL(versionsApiSettings.VersionsFilesDir, versionsApiSettings.GetSE3Dir()).toString();
    },

    GetVersionsInfo: () => {
        return new URL(versionsApiSettings.VersionsInfo, versionsApiSettings.GetSE3Dir()).toString();
    },
};
contextBridge.exposeInMainWorld("versionsApiSettings", versionsApiSettings);

const GetVersions = async () => {
    try {
        let res = await axios.get(versionsApiSettings.GetVersionsInfo());
        store.set("versions", res.data);
        return res.data;
    } catch (ex) {
        if (store.has("versions")) {
            return store.get("versions");
        }
        throw new Error("Can't load versions");
    }
};

const GetLauncherInfo = async() => {
    const url = new URL(versionsApiSettings.LauncherInfo, versionsApiSettings.root).toString();
    return (await axios.get(url, {
        transformResponse: []
    })).data;
}

const GetInstalledVersions = async () => {};

contextBridge.exposeInMainWorld("se3Api", {
    GetVersions,
    GetInstalledVersions,
    GetLauncherInfo,
});
