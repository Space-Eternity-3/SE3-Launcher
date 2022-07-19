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
        }

        try {
            let versionInstaller = new VersionInstaller(tag);
            installers[id] = versionInstaller;
            versionInstaller.Start();

            versionInstaller.on("finished", () => {
                e.sender.send("installer_finish", id);
                deleteInstaller(id);
            });
            versionInstaller.on("error", (ex) => {
                e.sender.send("installer_error", id, ex);
                deleteInstaller(id);
            });
            versionInstaller.on("progress", (downloadedBytes, totalBytes) => {
                e.sender.send("installer_progress", id, downloadedBytes, totalBytes);
            });
            versionInstaller.on("unpacking", () => {
                e.sender.send("installer_unpacking", id);
            });
            versionInstaller.on("cancelled", () => {
                e.sender.send("installer_canceled", id);
                deleteInstaller(id);
            })
        } catch (err) {
            e.sender.send("installer_error", id, err);
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
        RunVersion: RunVersion
    });
};

module.exports = RendererBridge;
