const { ipcMain } = require("electron");
const SE3Api = require("./SE3Api");
const { VersionInstaller, IsVersionInstalled } = require("./VersionInstaller");

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
    ExportAsync("get_versions", SE3Api.GetVersions);
    ExportAsync("get_launcher_info", SE3Api.GetLauncherInfo);

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

    Export("is_version_installed", IsVersionInstalled);
    Export("installer_cancel", (id) => {
        installers[id].Stop();
    });
};

module.exports = RendererBridge;
