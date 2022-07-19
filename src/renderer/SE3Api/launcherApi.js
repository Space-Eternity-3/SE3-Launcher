/**
 * Gets launcher info (markdown)
 *
 * @returns {String} markdown launcher info
 */
export async function GetLauncherInfo() {
    try {
        return await (await window.fetch(window.versionsApiSettings.GetLauncherInfo())).text();
    } catch (ex) {
        throw new Error("Failed to get launcher info " + ex);
    }
}
