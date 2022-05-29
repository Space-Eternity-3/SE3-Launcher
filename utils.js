const getAppDataPath = require("appdata-path");
const path = require("path");
const { version } = require("./package.json");
const fs = require("fs");

const GetGameDirectory = () => {
    const dir = getAppDataPath("Space Eternity 3");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

const GetVersionsDirectory = () => {
    const dir = path.join(GetGameDirectory(), "Versions");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

const GetLauncherDirectory = () => {
    const dir = path.join(GetGameDirectory(), "Launcher", "v3");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

module.exports = {
    GetGameDirectory,
    GetVersionsDirectory,
    GetLauncherDirectory
}