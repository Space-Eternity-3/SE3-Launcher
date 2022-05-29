const axios = require("axios").default;
const { GetVersionZipFile } = require("./SE3Api");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { GetLauncherDirectory, GetVersionsDirectory } = require("../utils");
const decompress = require("decompress");

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

                try {
                    await decompress(savePath, dir);
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
}

module.exports = {
    VersionInstaller,
    IsVersionInstalled
};
