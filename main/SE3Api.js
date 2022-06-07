const axios = require("axios").default;
const se3ApiSettings = require("../SE3ApiSettings");
const Store = require("electron-store");
const { URL } = require("url");

const store = new Store();

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
 * Gets launcher info (markdown)
 * 
 * @returns {String} markdown launcher info
 */
const GetLauncherInfo = async () => {
    return (
        await axios.get(se3ApiSettings.GetLauncherInfo(), {
            transformResponse: [],
        })
    ).data;
};

/**
 * Gets link to version's zip file
 * 
 * @param {String} versionTag version tag
 * @returns link
 */
const GetVersionZipFile = async(versionTag) => {
    const version = (await GetVersions()).Versions.find(version => version.tag === versionTag);

    return {
        url: new URL(version.file, se3ApiSettings.GetVersionsFilesDir()).toString(),
        version
    };
};

module.exports = {
    GetVersions,
    GetLauncherInfo,
    GetVersionZipFile
};
