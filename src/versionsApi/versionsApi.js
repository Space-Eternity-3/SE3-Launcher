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
    return window.versionsApi.GetVersions();
}