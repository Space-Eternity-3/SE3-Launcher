const { GetLauncherDirectory, GetVersionsDirectory } = require("../utils");
const path = require("path");
const { DownloadAction, ExtractAction } = require("./Installer");
const { GetVersionZipFile } = require("../SE3Api");

/**
 * @param {string} version 
 * @returns {import("./Installer").InstallerArgs}
 */
const GameInstall = async(version) => {
    const url = (await GetVersionZipFile(version)).url;
    const filename = path.basename(new URL(url).pathname);
    const downloadedFile = path.join(GetLauncherDirectory(), filename);
    
    return {
        actions: [
        new DownloadAction(url, downloadedFile),
        new ExtractAction(downloadedFile, path.join(GetVersionsDirectory(), version))
        ],
        type: "version",
        version,
    };
};

module.exports = GameInstall;
