const { VersionInstaller, IsVersionInstalled, GetInstalledVersions, UninstallVersion } = require("../src/main/VersionInstaller");
const utils = require("../src/main/utils");
const fs = require("fs");
const path = require("path");

const VERSION_TAG = "SE3-Beta-1.13";
const VERSION_DIR = path.join(utils.GetVersionsDirectory(), VERSION_TAG);

jest.setTimeout(2 * 1000 * 60); // 2 minutes
test("Installing versions", () => {
    return new Promise(async (resolve, reject) => {
        try {
            fs.rmSync(VERSION_DIR, { force: true, recursive: true });

            const versionInstaller = new VersionInstaller(VERSION_TAG);

            versionInstaller.on("finished", () => {
                if (fs.existsSync(VERSION_DIR)) resolve();
                else reject("Installation doesn't exists");
            });

            versionInstaller.on("error", (err) => {
                reject(err);
            });

            versionInstaller.on("cancelled", () => {
                reject("Installation shouldn't be cancelled");
            });

            await versionInstaller.Start();
        } catch (err) {
            reject(err);
        }
    });
});

test("Cancelling installation", () => {
    return new Promise(async (resolve, reject) => {
        try {
            fs.rmSync(VERSION_DIR, { force: true, recursive: true });

            const versionInstaller = new VersionInstaller(VERSION_TAG);

            versionInstaller.on("progress", () => {
                versionInstaller.Stop();
            });

            versionInstaller.on("finished", () => {
                reject("Installation should be cancelled");
            });

            versionInstaller.on("error", (err) => {
                reject(err);
            });

            versionInstaller.on("cancelled", () => {
                resolve();
            });

            await versionInstaller.Start();
        } catch (err) {
            reject(err);
        }
    });
});

test("IsVersionInstalled", () => {
    fs.rmSync(VERSION_DIR, { force: true, recursive: true });
    expect(IsVersionInstalled(VERSION_TAG)).toBe(false);
    fs.mkdirSync(VERSION_DIR);
    expect(IsVersionInstalled(VERSION_TAG)).toBe(true);
});

test("GetInstalledVersions", () => {
    return new Promise(async (resolve, reject) => {
        try {
            fs.rmSync(utils.GetVersionsDirectory(), { force: true, recursive: true });

            const versionInstaller = new VersionInstaller(VERSION_TAG);

            versionInstaller.on("finished", async() => {
                if (IsVersionInstalled(VERSION_TAG)) {
                    const installedVersions = await GetInstalledVersions();
                    if (installedVersions.length === 1 && installedVersions[0].tag === VERSION_TAG) resolve();
                    else reject("GetInstalledVersions failed");
                } else reject("Installation doesn't exists");
            });

            versionInstaller.on("error", (err) => {
                reject(err);
            });

            versionInstaller.on("cancelled", () => {
                reject("Installation shouldn't be cancelled");
            });

            await versionInstaller.Start();
        } catch (err) {
            reject(err);
        }
    });
});

test("UninstallVersion", () => {
    return new Promise(async (resolve, reject) => {
        try {
            fs.rmSync(utils.GetVersionsDirectory(), { force: true, recursive: true });

            const versionInstaller = new VersionInstaller(VERSION_TAG);

            versionInstaller.on("finished", () => {
                if (IsVersionInstalled(VERSION_TAG)) {
                    UninstallVersion(VERSION_TAG);
                    if (!IsVersionInstalled(VERSION_TAG)) resolve();
                    else reject("Version should be uninstalled");
                } else reject("Installation doesn't exists");
            });

            versionInstaller.on("error", (err) => {
                reject(err);
            });

            versionInstaller.on("cancelled", () => {
                reject("Installation shouldn't be cancelled");
            });

            await versionInstaller.Start();
        } catch (err) {
            reject(err);
        }
    });
});
