const axios = require("axios");
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
        if (store.has("versions"))
            return store.get("versions");
        throw new Error("Can't get versions");
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

/**
 * @typedef ServerVersion
 * @type {object}
 * @property {string} name - Name of this server version.
 * @property {string} version - Version tag of this server.
 * @property {string} downloadUrl - Download link to the server.
 * @property {string} linuxRuntime - Download link to Linux x64 Node.js runtime (tar.gz)
 * @property {string} windowsRuntime - Download link to Windows x64 Node.js runtime (.zip)
 * @property {string} runtimeVersion - Version of the Node.js runtime
 */

/**
 * Returns avaiable server versions.
 * 
 * @returns {ServerVersion[]}
 */
const GetServerVersions = async () => {
    try {
        const res = (await axios.get(se3ApiSettings.GetServersList())).data;
        store.set("servers", res);
        return res;
    } catch (ex) {
        if (store.has("servers"))
            return store.get("servers");
        throw new Error("Can't get servers");
    }
};

/**
 * Gets server versions
 * 
 * @param {string} serverVersion 
 * @returns {ServerVersion}
 */
const GetServerVersion = async(serverVersion) => {
    try {
        return (await GetServerVersions()).find(version => version.version === this.serverVersion);
    } catch (ex) {
        throw new Error("Could not get server info");
    }

};

module.exports = {
    GetVersions,
    GetVersionZipFile,
    GetServerVersions,
    GetServerVersion,
};
