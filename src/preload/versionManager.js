import { contextBridge, ipcRenderer } from "electron";
import IpcMessages from "../common/IpcMessages";

let installers = {};

function deleteInstaller(id) {
    installers[id] = null;
    delete installers[id];
};

/**
 * Starts installing a version
 * 
 * @param {*} data 
 * @returns {string} id of the installer
 */
function installVersion(data, callbacks) {
    let id;
    // for safety lol
    while (true) {
        id = crypto.randomUUID();
        if (!(id in installers)) break;
    }

    installers[id] = { version: data.version, ...callbacks };

    ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.INSTALL_VERSION, id, data);

    return id;
}

ipcRenderer.on(IpcMessages.VERSION_MANAGER.ON_VERSION_INSTALL_PROGRESS, (event, id, type, data) => {
    if (!(id in installers)) return;
    switch (type) {
        case "data":
            installers[id]?.updateData(data);
            break;
        case "finish":
            installers[id]?.finish();
            deleteInstaller(id);
            break;
        case "error":
            installers[id]?.error(data);
            deleteInstaller(id);
            break;
        case "cancelled":
            installers[id]?.cancelled();
            deleteInstaller(id);
            break;
        default:
            break;
    }
});

function cancelInstall(id) {
    ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.CANCEL_INSTALL, id);
}

async function uninstallVersion(versionTag) {
    await ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.UNINSTALL_VERSION, versionTag);
}

async function getInstalledVersions() {
    return await ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.GET_INSTALLED_VERSIONS);
}

async function getAvailableVersions() {
    return await ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.GET_AVAILABLE_VERSIONS);
}

async function getVersionState(versionTag) {
    return await ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.GET_VERSION_STATE, versionTag);
}

async function isVersionInstalled(versionTag) {
    return await ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.IS_VERSION_INSTALLED, versionTag);
}

function runVersion(versionTag) {
    ipcRenderer.invoke(IpcMessages.VERSION_MANAGER.RUN_VERSION, versionTag);
}

contextBridge.exposeInMainWorld("versionManager", {
    installVersion,
    cancelInstall,
    uninstallVersion,
    getInstalledVersions,
    getAvailableVersions,
    getVersionState,
    isVersionInstalled,
    runVersion,
    getPlatform: () => process.platform,
});
