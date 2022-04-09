const getAppDataPath = require("appdata-path");
const path = require("path");
const { version } = require("./package.json");

const GetGameDirectory = () => {
    return getAppDataPath("Space Eternity 3");
}

const GetLauncherDirectory = () => {
    return path.join(GetGameDirectory(), "Launcher", version);
}

module.exports = {
    GetGameDirectory,
    GetLauncherDirectory
}