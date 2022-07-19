const { contextBridge, ipcRenderer } = require("electron");
const { Titlebar, Color } = require("custom-electron-titlebar");
const electron = require("electron");
const versionsApiSettings = require("../SE3ApiSettings");
const { RendererBridge } = require("electronbb");
let rendererBridge = new RendererBridge();
const versionsApi = rendererBridge.GetSync("versionsApi");

window.addEventListener("DOMContentLoaded", () => {
    // Open external links in browser
    document.querySelector("body").addEventListener("click", (event) => {
        if (event.target.tagName.toLowerCase() === "a") {
            if (!["https:", "http:"].includes(new URL(event.target.href).protocol)) return;
            const absoluteUrl = new RegExp("^(?:[a-z]+:)?//", "i");
            event.preventDefault();
            if (!absoluteUrl.test(event.target.href)) return;
            electron.shell.openExternal(event.target.href);
        }
    });

    new Titlebar({
        icon: "ikona.png",
        backgroundColor: Color.fromHex("#363636"),
        menu: null,
    });
});

contextBridge.exposeInMainWorld("versionsApiSettings", versionsApiSettings);

const GetLauncherInfo = async () => {
    return await ipcRenderer.invoke("get_launcher_info");
};

/**
 * @typedef {Object} InstallVersionSettings
 * @property {String} tag
 * @property {function(Number, Number)} onProgress
 * @property {function()} onUnpacking
 * @property {function()} onFinish
 * @property {function(err)} onError
 * @property {function()} onCancel
 */

/**
 * @typedef {Object} Installer
 * @property {function()} Cancel
 */

/**
 * @type {Object.<string, InstallVersionSettings>}
 */
let workers = {};

/**
 * Installs version
 *
 * @param {InstallVersionSettings} settings
 * @returns {Installer}
 */
const InstallVersion = (settings) => {
    const id = crypto.randomUUID();
    workers[id] = settings;

    ipcRenderer.invoke("install_version", id, settings.tag);

    return {
        Cancel: () => {
            versionsApi.installerCancel(id);
        },
    };
};

const deleteWorker = (id) => {
    workers[id] = null;
    delete workers[id];
};

ipcRenderer.on("installer_progress", (event, id, downloadedBytes, totalBytes) => {
    workers[id].onProgress(downloadedBytes, totalBytes);
});

ipcRenderer.on("installer_unpacking", (event, id) => {
    workers[id].onUnpacking();
});

ipcRenderer.on("installer_finish", (event, id) => {
    workers[id].onFinish();
    deleteWorker(id);
});

ipcRenderer.on("installer_canceled", (event, id) => {
    workers[id].onCancel();
    deleteWorker(id);
});

ipcRenderer.on("installer_error", (event, id, err) => {
    workers[id].onError(err);
    deleteWorker(id);
});

contextBridge.exposeInMainWorld("se3Api", {
    GetLauncherInfo,
    InstallVersion,
    ...versionsApi,
});

// :)
(() => {
    let listeners = {};

    const callListener = (name, ...args) => {
        if (!(name in listeners) || !Array.isArray(listeners[name])) return;
        for (const callback of listeners[name]) {
            callback(...args);
        }
    };

    contextBridge.exposeInMainWorld("listeners", {
        add: (name, callback) => {
            if (!(name in listeners) || !Array.isArray(listeners[name])) listeners[name] = [];
            listeners[name].push(callback);
        },
        remove: (name) => {
            if (!(name in listeners) || !Array.isArray(listeners[name])) return;
            listeners[name] = [];
        },
        test: (ex) => {
            callListener("uncaught_exception", ex);
        },
    });

    ipcRenderer.on("uncaught_exception", (event, err) => {
        callListener("uncaught_exception", err);
    });
})();
