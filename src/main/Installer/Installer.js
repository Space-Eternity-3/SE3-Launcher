const fs = require("fs");
const axios = require("axios");
const EventEmitter = require("events");

class Action extends EventEmitter {
    constructor() {
        super();

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

    /**
     * Text that gets displayed in the UI
     *
     * @type {string}
     */
    displayText;

    /**
     * Details that get displayed in the UI
     *
     * @type {string}
     */
    detailsText;

    /**
     * Progress of the action
     *
     * @type {number}
     */
    progress;

    updateData() {
        this.emit("update", {
            displayText: this.displayText,
            detailsText: this.detailsText,
            progress: this.progress,
        });
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
        super();

        this.url = url;
        this.savePath = savePath;

        this.displayText = "Downloading...";
    }

    async execute() {
        this.updateData();

        if (fs.existsSync(this.savePath)) fs.rmSync(this.savePath);
        const res = await axios.get(this.url, {
            responseType: "stream",
        });

        const totalLength = parseInt(res.headers["content-length"], 10);

        this.writeStream = fs.createWriteStream(this.savePath);
        this.writeStream.on("error", (err) => {
            this.emit("error", err);
        });
        this.writeStream.on("close", async () => {
            this.emit("finished");
        });

        let downloadedBytes = 0;
        res.data.on("data", (chunk) => {
            downloadedBytes += chunk.length;
            this.progress = (downloadedBytes / totalLength) * 100;
            this.detailsText = `${(downloadedBytes / 1024 / 1024).toFixed(2)}MiB / ${(totalLength / 1024 / 1024).toFixed(2)}MiB bytes`;
            this.updateData();
        });

        res.data.pipe(this.writeStream);
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

module.exports = {
    DownloadAction,
};
