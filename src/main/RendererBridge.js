const { ipcMain } = require("electron");
const SE3Api = require("./SE3Api");
const { VersionInstaller, IsVersionInstalled, GetInstalledVersions, UninstallVersion, RunVersion } = require("./VersionInstaller");
const { MainBridge } = require("electronbb");
let mainBridge = new MainBridge();

/**
 * @type {Object.<string, VersionInstaller>}
 */
let installers = {};

const GetVersionState = (versionTag) => {
    if (IsVersionInstalled(versionTag)) return "installed";
    if (typeof Object.values(installers).find((installer) => installer.versionTag === versionTag) !== "undefined") return "installing";
    return "not_installed";
};

const RendererBridge = () => {
    // Installer
    ipcMain.handle("install_version", (e, id, tag) => {
        const deleteInstaller = (id) => {
            installers[id] = null;
            delete installers[id];
        };

        const InstallerEvent = (type, ...args) => {
            if (!e.sender.isDestroyed()) e.sender.send("installer_event", id, type, ...args);
        };

        try {
            let versionInstaller = new VersionInstaller(tag);
            installers[id] = versionInstaller;
            versionInstaller.Start();

            versionInstaller.on("finished", () => {
                InstallerEvent("finish");
                deleteInstaller(id);
            });
            versionInstaller.on("error", (ex) => {
                InstallerEvent("error", ex);
                deleteInstaller(id);
            });
            versionInstaller.on("progress", (downloadedBytes, totalBytes) => {
                InstallerEvent("progress", { downloadedBytes, totalBytes });
            });
            versionInstaller.on("unpacking", () => {
                InstallerEvent("unpacking");
            });
            versionInstaller.on("cancelled", () => {
                InstallerEvent("cancelled");
                deleteInstaller(id);
            });
        } catch (err) {
            InstallerEvent("error", err);
            deleteInstaller(id);
        }
    });

    mainBridge.Export("versionsApi", {
        installerCancel: (id) => {
            installers[id]?.Stop?.();
        },
        IsVersionInstalled,
        GetVersions: SE3Api.GetVersions,
        GetInstalledVersions,
        UninstallVersion,
        RunVersion,
        GetVersionState,
        GetServerVersions: SE3Api.GetServerVersions,
    });

    return {
        AreInstallationsRunning: () => {
            for (const installer of Object.values(installers)) if (typeof installer !== "undefined") return true;

            return false;
        },
    };
};

module.exports = RendererBridge;
