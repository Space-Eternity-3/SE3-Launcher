const { GetVersions } = require("./SE3Api");
const fs = require("fs");
const path = require("path");
const { GetVersionsDirectory } = require("./utils");
const child_process = require("child_process");
const { dialog } = require("electron");

/**
 * Checks if version folder exists
 *
 * @param {String} versionTag
 */
const IsVersionInstalled = (versionTag) => {
    return fs.existsSync(path.join(GetVersionsDirectory(), versionTag));
};

/**
 * Returns installed versions
 *
 * @returns {import("./SE3Api").FetchedVersion[]}
 */
const GetInstalledVersions = async () => {
    let versions = (await GetVersions()).Versions;

    return versions.filter((version) => IsVersionInstalled(version.tag));
};

/**
 * Uninstall a version
 *
 * @param {String} versionTag tag of the version to uninstall
 */
const UninstallVersion = (versionTag) => {
    const versionPath = path.join(GetVersionsDirectory(), versionTag);
    fs.rmSync(versionPath, { recursive: true, force: true });
};

const RunVersion = (versionTag) => {
    const versionPath = path.join(GetVersionsDirectory(), versionTag);
    const execNames = ["Sondy Eksploracji 3.exe", "Space Eternity 3.exe", "Space Eternity 3.x86_64"];

    for (const name of execNames) {
        const execPath = path.join(versionPath, name);
        if (fs.existsSync(execPath)) {
            if (process.platform === "linux") fs.chmodSync(execPath, "777");
            const game = child_process.spawn(execPath, {
                detached: true,
                cwd: versionPath,
            });
            game.unref();
            return;
        }
    }

    dialog.showErrorBox("Couldn't find game executable", "Please try reinstalling the game.");
};

module.exports = {
    IsVersionInstalled,
    GetInstalledVersions,
    UninstallVersion,
    RunVersion,
};
