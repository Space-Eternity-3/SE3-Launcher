/**
 * @typedef {Object} FetchedVersion
 * @property {String} name Name of the version
 * @property {String} tag Version tag
 * @property {Boolean} hidden Is version hidden
 * @property {String} file Server version file name
 * @property {Number} size Size of the version
 * @property {String} image Server image file name
 */

/**
 * @typedef {Object} FetchedVersions
 * @property {String} latest latest version's tag
 * @property {FetchedVersion[]} Versions version list
 */

/**
 * Gets versions list
 * Throws an error if can't get
 * Works with internet off (If version list exists arleady), but it will not fetch the latest version list
 *
 * @returns {FetchedVersions}
 */
export async function GetVersions() {
    return await window.se3Api.GetVersions();
}

/**
 * Installs version
 * 
 * @param {import("../../preload").InstallVersionSettings} settings 
 * @returns {import("../../preload").Installer}
 */
export function InstallVersion(settings) {
    return window.se3Api.InstallVersion(settings);
};

/**
 * Checks if version directory exists
 *
 * @param {String} versionTag tag of the version to check
 * @returns {Boolean}
 */
export async function IsVersionInstalled(versionTag) {
    return await window.se3Api.IsVersionInstalled(versionTag);
}

export async function GetInstalledVersions() {
    return await window.se3Api.GetInstalledVersions();
}

export async function UninstallVersion(versionTag) {
    return await window.se3Api.UninstallVersion(versionTag);
}

export async function RunVersion(versionTag) {
    return await window.se3Api.RunVersion(versionTag);
}