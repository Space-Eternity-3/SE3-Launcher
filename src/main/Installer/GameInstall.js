const { GetLauncherDirectory, GetVersionsDirectory } = require("../utils");
const path = require("path");
const { DownloadAction, ExtractAction } = require("./Installer");
const { GetVersionZipFile } = require("../SE3Api");

const GameInstall = async(version) => {
    const url = (await GetVersionZipFile(version)).url;
    const filename = path.basename(new URL(url).pathname);
    const downloadedFile = path.join(GetLauncherDirectory(), filename);

    return [
        new DownloadAction(url, downloadedFile),
        new ExtractAction(downloadedFile, path.join(GetVersionsDirectory(), version))
    ]
};

module.exports = GameInstall;
