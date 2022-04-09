const axios = require("axios").default;
const { getCurrentWindow } = require("@electron/remote");
const { contextBridge } = require("electron");
const { URL } = require("url");
const Titlebar = require("@6c65726f79/custom-titlebar");
const Utils = require("./utils");

window.addEventListener("DOMContentLoaded", () => {
    const currentWindow = getCurrentWindow();
    new Titlebar({
        backgroundColor: "#363636",
        titleHorizontalAlignment: "left",
        menu: null,
        backgroundUnfocusEffect: false,
        onMinimize: () => currentWindow.minimize(),
        onMaximize: () =>
            currentWindow.isMaximized()
                ? currentWindow.unmaximize()
                : currentWindow.maximize(),
        onClose: () => currentWindow.close(),
        isMaximized: () => currentWindow.isMaximized(),
    });
});

const versionsApiSettings = {
    root: "https://nadwey.pl/",
    SE3Dir: "./kamiloso/SE3/",
    ImagesDir: "./Images",
    LauncherDir: "./Launcher",
    VersionsDir: "./Versions",
    VersionsFilesDir: "./Versions/Releases",
    VersionsInfo: "./Versions/Versions.php",

    GetSE3Dir: () => {
        return new URL(
            versionsApiSettings.SE3Dir,
            versionsApiSettings.root
        ).toString();
    },

    GetImagesDir: () => {
        return new URL(
            versionsApiSettings.ImagesDir,
            versionsApiSettings.GetSE3Dir()
        ).toString();
    },

    GetVersionsDir: () => {
        return new URL(
            versionsApiSettings.VersionsDir,
            versionsApiSettings.GetSE3Dir()
        ).toString();
    },

    GetVersionsFilesDir: () => {
        return new URL(
            versionsApiSettings.VersionsFilesDir,
            versionsApiSettings.GetSE3Dir()
        ).toString();
    },

    GetVersionsInfo: () => {
        return new URL(
            versionsApiSettings.VersionsInfo,
            versionsApiSettings.GetSE3Dir()
        ).toString();
    },
};

contextBridge.exposeInMainWorld("versionsApiSettings", versionsApiSettings);

contextBridge.exposeInMainWorld("versionsApi", {
    GetVersions: async () => {
        let res = await axios.get(versionsApiSettings.GetVersionsInfo());
        return res.data;
    },
});

console.log(Utils.GetGameDirectory());
console.log(Utils.GetLauncherDirectory());