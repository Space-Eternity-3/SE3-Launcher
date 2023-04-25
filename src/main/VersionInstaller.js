const axios = require("axios");
const { GetVersionZipFile, GetVersions } = require("./SE3Api");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { GetLauncherDirectory, GetVersionsDirectory } = require("./utils");
const compressing = require("compressing");
const child_process = require("child_process");

class VersionInstaller extends EventEmitter {
    constructor(versionTag) {
        super();

        this.versionTag = versionTag;
    }

    /**
     * @public
     * Start installing
     */
    async Start() {
        try {
            let file;
            try {
                file = await GetVersionZipFile(this.versionTag);
            } catch (ex) {
                this.emit("error", "Could not get version zip file " + ex);
                return;
            }
            const savePath = path.join(GetLauncherDirectory(), file.version.file);

            if (fs.existsSync(savePath)) fs.rmSync(savePath);
            const res = await axios.get(file.url, {
                responseType: "stream",
            });

            const totalLength = parseInt(res.headers["content-length"], 10);

            this.writer = fs.createWriteStream(savePath);
            this.writer.on("error", (err) => {
                this.emit("error", err);
            });
            this.writer.on("close", async () => {
                this.emit("unpacking");
                const dir = path.join(GetVersionsDirectory(), file.version.tag);
                if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });

                try {
                    await compressing.zip.uncompress(savePath, dir);
                } catch (ex) {
                    this.emit("error", ex);
                    return;
                }

                this.emit("finished");
            });

            res.data.on("data", (chunk) => {
                this.downloadedBytes += chunk.length;
                this.emit("progress", this.downloadedBytes, totalLength);
            });
            res.data.pipe(this.writer);
        } catch (ex) {
            this.emit("error", "Failed to install " + ex);
        }
    }

    /**
     * Cancels installing
     */
    Stop() {
        this.writer.destroy();
        this.emit("cancelled");
    }

    /**
     * @type {String}
     */
    versionTag;

    /**
     * @type {fs.WriteStream}
     */
    writer;

    /**
     * @type {Number}
     */
    downloadedBytes = 0;
}

/**
 * Checks if version folder exists
 *
 * @param {String} versionTag
 */
const IsVersionInstalled = (versionTag) => {
    return fs.existsSync(path.join(GetVersionsDirectory(), versionTag));
};

/**
 * Returns installed versions
 *
 * @returns {import("./SE3Api").FetchedVersion[]}
 */
const GetInstalledVersions = async () => {
    let versions = (await GetVersions()).Versions;

    return versions.filter((version) => IsVersionInstalled(version.tag));
};

/**
 * Uninstall a version
 *
 * @param {String} versionTag tag of the version to uninstall
 */
const UninstallVersion = (versionTag) => {
    const versionPath = path.join(GetVersionsDirectory(), versionTag);
    fs.rmSync(versionPath, { recursive: true, force: true });
};

const RunVersion = (versionTag) => {
    const versionPath = path.join(GetVersionsDirectory(), versionTag);
    const execNames = ["Sondy Eksploracji 3.exe", "Space Eternity 3.exe", "Space Eternity 3.x86_64"];

    for (const name of execNames) {
        const execPath = path.join(versionPath, name);
        if (fs.existsSync(execPath)) {
            if (process.platform === "linux") fs.chmodSync(execPath, "777");
            const game = child_process.spawn(execPath, {
                detached: true,
                cwd: versionPath,
            });
            game.unref();
            return;
        }
    }

    throw new Error("Failed to run version");
};

module.exports = {
    VersionInstaller,
    IsVersionInstalled,
    GetInstalledVersions,
    UninstallVersion,
    RunVersion,
};
