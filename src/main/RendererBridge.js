const { ipcMain } = require("electron");
const SE3Api = require("./SE3Api");
const { VersionInstaller, IsVersionInstalled, GetInstalledVersions, UninstallVersion, RunVersion } = require("./VersionInstaller");
const { MainBridge } = require("electronbb");
let mainBridge = new MainBridge();

/**
 * @type {Object.<string, VersionInstaller>}
 */
let installers = {};

const RendererBridge = () => {
    // Installer
    ipcMain.handle("install_version", (e, id, tag) => {
        const deleteInstaller = (id) => {
            installers[id] = null;
            delete installers[id];
        };

        const sendMsg = (channel, ...args) => {
            if (!e.sender.isDestroyed()) e.sender.send(channel, ...args);
        };

        try {
            let versionInstaller = new VersionInstaller(tag);
            installers[id] = versionInstaller;
            versionInstaller.Start();

            versionInstaller.on("finished", () => {
                sendMsg("installer_finish", id);
                deleteInstaller(id);
            });
            versionInstaller.on("error", (ex) => {
                sendMsg("installer_error", id, ex);
                deleteInstaller(id);
            });
            versionInstaller.on("progress", (downloadedBytes, totalBytes) => {
                sendMsg("installer_progress", id, downloadedBytes, totalBytes);
            });
            versionInstaller.on("unpacking", () => {
                sendMsg("installer_unpacking", id);
            });
            versionInstaller.on("cancelled", () => {
                sendMsg("installer_canceled", id);
                deleteInstaller(id);
            });
        } catch (err) {
            sendMsg("installer_error", id, err);
            deleteInstaller(id);
        }
    });

    mainBridge.Export("versionsApi", {
        installerCancel: (id) => {
            installers[id].Stop();
        },
        IsVersionInstalled: IsVersionInstalled,
        GetVersions: SE3Api.GetVersions,
        GetInstalledVersions: GetInstalledVersions,
        UninstallVersion: UninstallVersion,
        RunVersion: RunVersion,
        GetVersionState: (versionTag) => {
            if (IsVersionInstalled(versionTag)) return "installed";
            if (typeof Object.values(installers).find((installer) => installer.versionTag === versionTag) !== "undefined") return "installing";
            return "not_installed";
        },
    });

    return {
        AreInstallationsRunning: () => {
            for (const installer of Object.values(installers)) if (typeof installer !== "undefined") return true;

            return false;
        },
    };
};

module.exports = RendererBridge;
