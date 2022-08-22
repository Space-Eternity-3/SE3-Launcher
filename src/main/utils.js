const path = require("path");
const fs = require("fs");
const os = require("os");

const GetGameDirectory = () => {
    let dir;
    if (process.platform === "win32") dir = process.env.APPDATA;
    else dir = path.join(os.homedir(), ".se3");

    fs.mkdirSync(dir, { recursive: true });
    return dir;
};

const GetVersionsDirectory = () => {
    const dir = path.join(GetGameDirectory(), "Versions");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
};

const GetLauncherDirectory = () => {
    const dir = path.join(GetGameDirectory(), "Launcher", "v3");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
};

module.exports = {
    GetGameDirectory,
    GetVersionsDirectory,
    GetLauncherDirectory,
};
