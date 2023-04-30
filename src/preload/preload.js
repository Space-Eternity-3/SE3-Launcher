const { contextBridge, ipcRenderer } = require("electron");
const { RendererBridge } = require("electronbb");
require("./setup")();

let rendererBridge = new RendererBridge();
const versionsApi = rendererBridge.GetSync("versionsApi");
const dialog = rendererBridge.GetSync("dialog");

const versionsApiSettings = require("../SE3ApiSettings");
const { humanFileSize } = require("./utils");
contextBridge.exposeInMainWorld("versionsApiSettings", versionsApiSettings);

let rendererExports = {};
contextBridge.exposeInMainWorld("preloadBridge", {
    set: (name, object) => {
        if (!(name in rendererExports)) rendererExports[name] = object;
    },
    delete: (name) => {
        if (!(name in rendererExports)) return;
        delete rendererExports[name];
        rendererExports[name] = [];
    },
});
ipcRenderer.on("uncaught_exception", (event, err) => {
    rendererExports["uncaught_exception"](err);
});

let workers = {};

const InstallVersion = (version, functions) => {
    const id = version;

    workers[id] = { version, ...functions };

    ipcRenderer.invoke("install_version", id, version);
};

const CancelInstall = (id) => {
    versionsApi.installerCancel(id);
};

const deleteWorker = (id) => {
    workers[id] = null;
    delete workers[id];
};

ipcRenderer.on("installer_event", (event, id, type, data) => {
    if (!(id in workers)) return;
    switch (type) {
        case "progress":
            const downloadedBytes = data.downloadedBytes;
            const totalBytes = data.totalBytes;
        
            workers[id].updateDetails(`Downloading...\n\n${humanFileSize(downloadedBytes, false, 2)} / ${humanFileSize(totalBytes, false, 2)}`);
            workers[id].updateProgress((downloadedBytes / totalBytes) * 90);

            break;
        case "unpacking":
            workers[id].updateDetails("Unpacking...");
            workers[id].updateProgress(95);
            workers[id].unpacking();
            break;
        case "finish":
            workers[id].finish();
            deleteWorker(id);
            break;
        case "canceled":
            workers[id].cancel();
            deleteWorker(id);
            break;
        case "error":
            workers[id].error(data);
            deleteWorker(id);
            break;
        default:
            break;
    }
});

const Platform = () => process.platform;

contextBridge.exposeInMainWorld("se3Api", {
    InstallVersion,
    CancelInstall,
    Platform,
    ...versionsApi,
});

contextBridge.exposeInMainWorld("dialog", dialog);