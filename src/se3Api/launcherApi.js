/**
 * Gets launcher info (markdown)
 * 
 * @returns {String} markdown launcher info
 */
 export async function GetLauncherInfo() {
    return await window.se3Api.GetLauncherInfo();
}