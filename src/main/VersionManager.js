import { GetAvailableVersions } from "./SE3Api";
import fs from "fs";
const fsPromises = fs.promises;
import path from "path";
import { GetVersionsDirectory } from "./utils";
import child_process from "child_process";
import { dialog } from "electron";

/**
 * Checks if version folder exists
 *
 * @param {String} versionTag
 */
export function IsVersionInstalled(versionTag) {
    return fs.existsSync(path.join(GetVersionsDirectory(), versionTag));
};

/**
 * Returns installed versions
 *
 * @returns {import("./SE3Api").FetchedVersion[]}
 */
export async function GetInstalledVersions() {
    let versions = (await GetAvailableVersions()).Versions;

    return versions.filter((version) => IsVersionInstalled(version.tag));
};

/**
 * Uninstall a version
 *
 * @param {String} versionTag tag of the version to uninstall
 */
export async function UninstallVersion(versionTag) {
    const versionPath = path.join(GetVersionsDirectory(), versionTag);
    await fsPromises.rm(versionPath, { recursive: true, force: true });
};

export function RunVersion (versionTag) {
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
