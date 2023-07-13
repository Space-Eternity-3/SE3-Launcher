const fs = require("fs");

class Action {
    constructor() {
        if (this.constructor == Action) {
            throw new Error("Action class can't be instantiated.");
        }
    }

    /**
     * Executes the action
     */
    async execute() {
        throw new Error("execute() not implemented");
    }
}

class DownloadAction extends Action {
    /**
     * Action for downloading a file
     *
     * @param {String} url
     * @param {String} savePath
     */
    constructor(url, savePath) {
        this.url = url;
        this.savePath = savePath;
    }

    async execute() {
        if (fs.existsSync(this.savePath)) fs.rmSync(this.savePath);
        const res = await axios.get(this.url, {
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
    }

    /**
     * @type {string}
     */
    url;

    /**
     * @type {string}
     */
    savePath;

    /**
     * @private
     * @type {fs.WriteStream}
     */
    writeStream;
}
