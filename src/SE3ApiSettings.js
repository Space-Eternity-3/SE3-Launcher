const { URL } = require("url");

const se3ApiSettings = {
    root: "https://nadwey.pl/", // no debugConfig lol
    SE3Dir: "./kamiloso/SE3/",
    ImagesDir: "./Images/",
    LauncherDir: "./Launcher/",
    VersionsDir: "./Versions/",
    VersionsFilesDir: "./Versions/Releases/",
    VersionsInfo: "./Versions/Versions.php",
    LauncherInfo: "./Launcher.md",

    GetSE3Dir: () => {
        return new URL(se3ApiSettings.SE3Dir, se3ApiSettings.root).toString();
    },

    GetImagesDir: () => {
        return new URL(se3ApiSettings.ImagesDir, se3ApiSettings.GetSE3Dir()).toString();
    },

    GetLauncherDir: () => {
        return new URL(se3ApiSettings.LauncherDir, se3ApiSettings.GetSE3Dir()).toString();
    },

    GetVersionsDir: () => {
        return new URL(se3ApiSettings.VersionsDir, se3ApiSettings.GetSE3Dir()).toString();
    },

    GetVersionsFilesDir: () => {
        return new URL(se3ApiSettings.VersionsFilesDir, se3ApiSettings.GetSE3Dir()).toString();
    },

    GetVersionsInfo: () => {
        return new URL(se3ApiSettings.VersionsInfo, se3ApiSettings.GetSE3Dir()).toString();
    },

    GetLauncherInfo: () => {
        return new URL(se3ApiSettings.LauncherInfo, se3ApiSettings.GetLauncherDir()).toString();
    },
};

module.exports = se3ApiSettings;