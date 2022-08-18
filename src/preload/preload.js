const { contextBridge, ipcRenderer } = require("electron");
const { RendererBridge } = require("electronbb");
require("./setup")();

let rendererBridge = new RendererBridge();
const versionsApi = rendererBridge.GetSync("versionsApi");

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

ipcRenderer.on("installer_progress", (event, id, downloadedBytes, totalBytes) => {
    workers[id].updateDetails(`Downloading...\n\n${humanFileSize(downloadedBytes, false, 2)} / ${humanFileSize(totalBytes, false, 2)}`);
    workers[id].updateProgress(downloadedBytes / totalBytes * 90);
});

ipcRenderer.on("installer_unpacking", (event, id) => {
    workers[id].updateDetails("Unpacking...");
    workers[id].updateProgress(95);
    workers[id].unpacking();
});

ipcRenderer.on("installer_finish", (event, id) => {
    workers[id].finish();
    deleteWorker(id);
});

ipcRenderer.on("installer_canceled", (event, id) => {
    workers[id].cancel();
    deleteWorker(id);
});

ipcRenderer.on("installer_error", (event, id, err) => {
    workers[id].error(err);
    deleteWorker(id);
});

contextBridge.exposeInMainWorld("se3Api", {
    InstallVersion,
    CancelInstall,
    ...versionsApi,
});
