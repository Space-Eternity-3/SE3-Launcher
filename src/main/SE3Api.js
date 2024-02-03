import axios from "axios";
import se3ApiSettings from "../common/SE3ApiSettings";
import Store from "electron-store";
import { URL } from "url";

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
 * Returns Fetched version list from the server 
 * Returns cached version list if available
 * Throws if both are not available
 *
 * @returns {FetchedVersions}
 */
export async function GetAvailableVersions () {
    try {
        const res = (await axios.get(se3ApiSettings.GetVersionsInfo())).data;
        store.set("versions", res);
        return res;
    } catch (ex) {
        if (store.has("versions")) return store.get("versions");
        throw new Error("Can't get versions");
    }
};

/**
 * Gets link to version's zip file
 *
 * @param {String} versionTag version tag
 * @returns link
 */
export async function GetVersionZipFile(versionTag) {
    const version = (await GetAvailableVersions()).Versions.find((version) => version.tag === versionTag);

    let url;
    const versionFile = process.platform === "win32" ? version.file : version.linuxFile;

    if (ABSOLUTE_URL_REGEX.test(versionFile)) url = versionFile;
    else url = new URL(versionFile, se3ApiSettings.GetVersionsFilesDir()).toString();

    return {
        url,
        version,
    };
};
