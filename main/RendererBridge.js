const { ipcMain } = require("electron");
const SE3Api = require("./SE3Api");
const { VersionInstaller, IsVersionInstalled, GetInstalledVersions, UninstallVersion, RunVersion } = require("./VersionInstaller");

/**
 * @type {Object.<string, VersionInstaller>}
 */
let installers = {};

const Export = (name, fun) => {
    ipcMain.handle(name, (e, ...args) => {
        return fun(...args);
    });
};

const ExportAsync = (name, fun) => {
    ipcMain.handle(name, async (e, ...args) => {
        return await fun(...args);
    });
};

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
    Export("installer_cancel", (id) => {
        installers[id].Stop();
    });

    Export("is_version_installed", IsVersionInstalled);
    ExportAsync("get_versions", SE3Api.GetVersions);
    ExportAsync("get_installed_versions", GetInstalledVersions);
    ExportAsync("uninstall_version", UninstallVersion);
    Export("run_version", RunVersion);
};

module.exports = RendererBridge;
