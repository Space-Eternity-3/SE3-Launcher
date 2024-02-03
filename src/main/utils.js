import path from "path";
import fs from "fs";
import os from "os";

export function GetGameDirectory () {
    let dir;
    if (process.platform === "win32") dir = path.join(process.env.APPDATA, "Space Eternity 3");
    else dir = path.join(os.homedir(), ".se3");

    fs.mkdirSync(dir, { recursive: true });
    return dir;
};

export function GetVersionsDirectory() {
    const dir = path.join(GetGameDirectory(), "Versions");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
};

export function GetLauncherDirectory () {
    const dir = path.join(GetGameDirectory(), "Launcher", "v3");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
};
