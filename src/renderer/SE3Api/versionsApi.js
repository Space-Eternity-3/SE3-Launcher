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
 * Throws an error if can't
 * Works with internet off (loads from storage)
 *
 * @returns {FetchedVersions}
 */
export async function GetVersions() {
    return await window.se3Api.GetVersions();
}

/**
 * Installs version
 *
 */
export function InstallVersion(version, functions) {
    return window.se3Api.InstallVersion(version, functions);
}

/**
 * Checks if version directory exists
 *
 * @param {String} versionTag tag of the version to check
 * @returns {Boolean}
 */
export function IsVersionInstalled(versionTag) {
    return window.se3Api.IsVersionInstalled(versionTag);
}

export async function GetInstalledVersions() {
    return await window.se3Api.GetInstalledVersions();
}

export function UninstallVersion(versionTag) {
    return window.se3Api.UninstallVersion(versionTag);
}

export function RunVersion(versionTag) {
    return window.se3Api.RunVersion(versionTag);
}

/**
 *
 * @param {String} versionTag
 * @returns {"installed"|"installing"|"not_installed"}
 */
export function GetVersionState(versionTag) {
    return window.se3Api.GetVersionState(versionTag);
}

/**
 * Cancels installing
 *
 * @param {String} versionTag
 * @returns
 */
export function CancelInstall(versionTag) {
    return window.se3Api.CancelInstall(versionTag);
}
