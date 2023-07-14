const { contextBridge, ipcRenderer } = require("electron");
const { RendererBridge } = require("electronbb");
require("./setup")();

let rendererBridge = new RendererBridge();
const versionsApi = rendererBridge.GetSync("versionsApi");
const dialog = rendererBridge.GetSync("dialog");

const versionsApiSettings = require("../SE3ApiSettings");
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
        case "data":
            workers[id].updateData(data);

            break;
        case "finish":
            workers[id].finish();
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
ipcRenderer.on("uncaught_exception", (event, err) => {
    rendererExports["uncaught_exception"](err);
});

const Platform = () => process.platform;

contextBridge.exposeInMainWorld("se3Api", {
    InstallVersion,
    CancelInstall,
    Platform,
    ...versionsApi,
});

contextBridge.exposeInMainWorld("dialog", dialog);