const { GetLauncherDirectory, GetNodejsDirectory } = require("../utils");
const path = require("path");
const { DownloadAction, ExtractAction } = require("./Installer");
const { GetServerVersion } = require("../SE3Api");

/**
 * @param {string} version
 * @returns {import("./Installer").InstallerArgs}
 */
const ServerInstall = async (version, serverDir) => {
    const server = await GetServerVersion(version);
    const url = server.downloadUrl;

    const filename = path.basename(new URL(url).pathname);
    const downloadedFile = path.join(GetLauncherDirectory(), filename);

    return {
        actions: [new DownloadAction(url, downloadedFile), new ExtractAction(downloadedFile, serverDir)],
        type: "server",
        version,
    };
};

module.exports = ServerInstall;
