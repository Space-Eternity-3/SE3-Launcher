const getAppDataPath = require("appdata-path");
const path = require("path");
const { version } = require("./package.json");
const fs = require("fs");

const GetGameDirectory = () => {
    return getAppDataPath("Space Eternity 3");
}

// const GetLauncherDirectory = () => {
//     const dir = path.join(GetGameDirectory(), "Launcher", version);
//     fs.mkdirSync(dir, { recursive: true });
//     return dir;
// }

module.exports = {
    GetGameDirectory
}