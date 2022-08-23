const axios = require("axios").default;
const se3ApiSettings = require("../SE3ApiSettings");
const Store = require("electron-store");
const { URL } = require("url");

const store = new Store();
const ABSOLUTE_URL_REGEX = new RegExp("^(?:[a-z+]+:)?//", "i");

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
const GetVersions = async () => {
    try {
        const res = (await axios.get(se3ApiSettings.GetVersionsInfo())).data;
        store.set("versions", res);
        return res;
    } catch (ex) {
        if (store.has("versions")) {
            return store.get("versions");
        }
        throw new Error("Can't load versions");
    }
};

/**
 * Gets link to version's zip file
 *
 * @param {String} versionTag version tag
 * @returns link
 */
const GetVersionZipFile = async (versionTag) => {
    const version = (await GetVersions()).Versions.find((version) => version.tag === versionTag);

    let url;
    const versionFile = process.platform === "win32" ? version.file : version.linuxFile;
    if (ABSOLUTE_URL_REGEX.test(versionFile)) url = versionFile;
    else url = new URL(versionFile, se3ApiSettings.GetVersionsFilesDir()).toString();

    return {
        url,
        version,
    };
};

module.exports = {
    GetVersions,
    GetVersionZipFile,
};
