const { ipcMain } = require("electron");
const SE3Api = require("./SE3Api");
const { IsVersionInstalled, GetInstalledVersions, UninstallVersion, RunVersion } = require("./VersionManager");
const { MainBridge } = require("electronbb");
const { Installer } = require("./Installer/Installer");
const GameInstall = require("./Installer/GameInstall");
const NodeJsInstall = require("./Installer/NodeJsInstall");
let mainBridge = new MainBridge();

/**
 * @type {Object.<string, Installer>}
 */
let installers = {};

const GetVersionState = (versionTag) => {
    if (IsVersionInstalled(versionTag)) return "installed";
    if (typeof Object.values(installers).find((installer) => installer.versionTag === versionTag) !== "undefined") return "installing";
    return "not_installed";
};

const RendererBridge = () => {
    // Installer
    ipcMain.handle("install", async (e, id, data) => {
        const deleteInstaller = (id) => {
            installers[id] = null;
            delete installers[id];
        };

        const InstallerEvent = (type, ...args) => {
            if (!e.sender.isDestroyed()) e.sender.send("installer_event", id, type, ...args);
        };

        try {
            let versionInstaller;
            switch (data.type) {
                case "version": {
                    versionInstaller = new Installer(await GameInstall(data.version));
                    break;
                }
                case "server": {
                    
                    break;
                }
                case "nodejs": {
                    versionInstaller = new Installer(await NodeJsInstall(data.version));
                    break;
                }
            }
            
            installers[id] = versionInstaller;

            versionInstaller.on("finished", () => {
                InstallerEvent("finish");
                deleteInstaller(id);
            });
            versionInstaller.on("error", (ex) => {
                InstallerEvent("error", ex);
                deleteInstaller(id);
            });
            versionInstaller.on("data", (data) => {
                InstallerEvent("data", data);
            });

            versionInstaller.Start();
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
        mainBridge,
    };
};

module.exports = RendererBridge;
