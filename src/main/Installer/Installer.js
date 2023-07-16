const fs = require("fs");
const axios = require("axios");
const EventEmitter = require("node:events");
const compressing = require("compressing");
const path = require("path");

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
     * Cancels the action
     */
    cancel() {
        throw new Error("cancel() not implemented");
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
        this.emit("data", {
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

        this.abortController = new AbortController();
        const res = await axios.get(this.url, {
            responseType: "stream",
            signal: this.abortController.signal,
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
     * Cancels the action
     */
    cancel() {
        this.abortController.abort();
        this.writeStream.close();
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

    /**
     * @private
     * @type {AbortController}
     */
    abortController;
}

class ExtractAction extends Action {
    /**
     * Extracts an archive
     *
     * @param {String} archivePath
     * @param {String} extractPath
     */
    constructor(archivePath, extractPath) {
        super();

        this.archivePath = archivePath;
        this.extractPath = extractPath;

        this.displayText = "Extracting...";
    }

    async execute() {
        this.progress = null;
        this.updateData();

        if (!fs.existsSync(this.archivePath)) {
            this.emit("error", "Archive does not exist");
            return;
        }

        if (fs.existsSync(this.extractPath)) fs.rmSync(this.extractPath, { recursive: true, force: true });

        const filename = path.basename(this.archivePath);

        try {
            if (filename.endsWith(".zip")) {
                await compressing.zip.uncompress(this.archivePath, this.extractPath);
            } else if (filename.endsWith(".tar.gz")) {
                await compressing.tgz.uncompress(this.archivePath, this.extractPath);
            } else {
                this.emit("error", "Unknown archive type");
                return;
            }
        } catch (ex) {
            this.emit("error", ex);
            return;
        }
        this.emit("finished");
    }

    /**
     * @type {string}
     */
    archivePath;

    /**
     * @type {string}
     */
    extractPath;
}

/**
 * @typedef {Object} InstallerArgs
 * @property {Action[]} actions
 * @property {string} type
 * @property {string} version
 */

class Installer extends EventEmitter {
    /**
     * @param {InstallerArgs} args
     */
    constructor(args) {
        super();

        this.actions = args.actions;
        this.type = args.type;
        this.version = args.version;
    }

    async Start() {
        for await (const action of this.actions) {
            if (this.failed) break;
            await new Promise((resolve) => {
                action.on("data", (data) => {
                    this.emit("data", data);
                });

                action.on("error", (err) => {
                    this.emit("error", err);
                    this.failed = true;
                    resolve();
                });

                action.on("finished", () => {
                    resolve();
                });

                action.execute();
            });
            this.currentAction++;
        }
        if (!this.failed) this.emit("finished");
    }

    Stop() {
        try {
            this.failed = true;
            this.actions[this.currentAction]?.cancel?.();
            return true;
        } catch (ex) {
            return false; // cancel is not implemented
        }
    }

    /**
     * @private
     * List of actions to execute
     *
     * @type {Action[]}
     */
    actions;

    /**
     * @private
     * Current action
     *
     * @type {Number}
     */
    currentAction = 0;

    /**
     * @private
     * @type {Boolean}
     */
    failed = false;

    /**
     * The thing that gets installed
     * 
     * @type {string}
     */
    type;

    /**
     * Version of the thing that gets installed
     * 
     * @type {string}
     */
    version;
}

module.exports = {
    DownloadAction,
    ExtractAction,
    Installer,
};
