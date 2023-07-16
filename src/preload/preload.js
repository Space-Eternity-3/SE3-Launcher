const { contextBridge, ipcRenderer } = require("electron");
const { RendererBridge } = require("electronbb");
const versionsApiSettings = require("../SE3ApiSettings");

let rendererBridge = new RendererBridge();
const versionsApi = rendererBridge.GetSync("versionsApi");
const dialog = rendererBridge.GetSync("dialog");

require("./setup")();

let rendererExports = {};
let workers = {};

const Install = (data, callbacks) => {
    let id;
    // for safety lol
    while (true) {
        id = crypto.randomUUID();
        if (!(id in workers)) break;
    }

    workers[id] = { version: data.version, ...callbacks };

    ipcRenderer.invoke("install", id, {
        type: data.type,
        version: data.version,
    });

    return id;
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
            workers[id]?.updateData(data);

            break;
        case "finish":
            workers[id]?.finish();
            deleteWorker(id);
            break;
        case "error":
            workers[id]?.error(data);
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

const SE3Api = {
    Install,
    CancelInstall,
    Platform,
    ...versionsApi,
};


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

contextBridge.exposeInMainWorld("versionsApiSettings", versionsApiSettings);
contextBridge.exposeInMainWorld("se3Api", SE3Api);
contextBridge.exposeInMainWorld("dialog", dialog);