import { ipcMain } from "electron";
import * as SE3Api from "../SE3Api";
import { IsVersionInstalled, GetInstalledVersions, UninstallVersion, RunVersion } from "../versionManager";
import { Installer } from "../installer/Installer";
import GameInstall from "../installer/GameInstall";
import IpcMessages from "../../common/IpcMessages";

/**
 * @type {Object.<string, Installer>}
 */
let installers = {};

ipcMain.handle(IpcMessages.VERSION_MANAGER.INSTALL_VERSION, async (e, id, data) => {
    function deleteInstaller(id) {
        installers[id] = null;
        delete installers[id];
    }

    function installerProgress(type, data) {
        if (!e.sender.isDestroyed()) e.sender.send(IpcMessages.VERSION_MANAGER.ON_VERSION_INSTALL_PROGRESS, id, type, data);
    }

    try {
        let versionInstaller;
        switch (data.type) {
            case "version": {
                versionInstaller = new Installer(await GameInstall(data.version));
                break;
            }
        }

        installers[id] = versionInstaller;

        versionInstaller.on("finished", () => {
            installerProgress("finish");
            deleteInstaller(id);
        });
        versionInstaller.on("error", (ex) => {
            installerProgress("error", ex);
            deleteInstaller(id);
        });
        versionInstaller.on("data", (data) => {
            installerProgress("data", data);
        });

        versionInstaller.on("cancelled", () => {
            installerProgress("cancelled", id);
            deleteInstaller(id);
        });

        versionInstaller.Start();
    } catch (err) {
        installerProgress("error", err);
        deleteInstaller(id);
    }
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.CANCEL_INSTALL, (e, id) => {
    installers[id]?.Stop?.();
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.UNINSTALL_VERSION, async(e, versionTag) => {
    return await UninstallVersion(versionTag);
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.GET_INSTALLED_VERSIONS, async () => {
    return await GetInstalledVersions();
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.GET_AVAILABLE_VERSIONS, async () => {
    return await SE3Api.GetAvailableVersions();
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.GET_VERSION_STATE, (e, versionTag) => {
    if (IsVersionInstalled(versionTag)) return "installed";
    if (typeof Object.values(installers).find((installer) => (installer.version === versionTag && installer.type === "version")) !== "undefined") return "installing";
    return "not_installed";
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.IS_VERSION_INSTALLED, (e, versionTag) => {
    return IsVersionInstalled(versionTag);
});

ipcMain.handle(IpcMessages.VERSION_MANAGER.RUN_VERSION, (e, versionTag) => {
    RunVersion(versionTag);
});

export function areInstallationsRunning() {
    return false;
}
