const { GetLauncherDirectory, GetNodejsDirectory } = require("../utils");
const path = require("path");
const { DownloadAction, ExtractAction } = require("./Installer");
const { GetServerRuntime } = require("../SE3Api");

/**
 * @param {string} version
 * @returns {import("./Installer").InstallerArgs}
 */
const NodeJsInstall = async (version) => {
    let url;
    switch (process.platform) {
        case "win32":
            url = (await GetServerRuntime(version)).windowsRuntime;
            break;
        case "linux":
            url = (await GetServerRuntime(version)).linuxRuntime;
            break;
    }

    const filename = path.basename(new URL(url).pathname);
    const downloadedFile = path.join(GetLauncherDirectory(), filename);

    return {
        actions: [new DownloadAction(url, downloadedFile), new ExtractAction(downloadedFile, path.join(GetNodejsDirectory(), version))],
        type: "nodejs",
        version,
    };
};

module.exports = NodeJsInstall;
