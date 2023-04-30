const EventEmitter = require("events");
const { GetServerVersion } = require("../SE3Api");
const { IsNodeJsInstalled } = require("./NodeJsUtils");
const NodejsInstaller = require("./NodeJsInstaller");
const { URL } = require("url");
const dialog = require("electron").dialog;
const fs = require("fs");
const path = require("path");
const { GetLauncherDirectory } = require("../utils");
const axios = require("axios");
const compressing = require("compressing");

class ServerInstaller extends EventEmitter {
    /**
     * Creates ServerInstaller instance
     * 
     * @param {string} serverVersion server version e.g. Beta-1.15
     */
    constructor(serverVersion) {
        super();

        this.serverVersion = serverVersion;
    };

    async GetSteps() {
        // TODO
    }

    async Start() {
        const serverVersion = await GetServerVersion(this.serverVersion);

        if (!IsNodeJsInstalled(serverVersion.runtimeVersion)) {
            const nodeJsInstaller = new NodejsInstaller(this.serverVersion);
            nodeJsInstaller.on("error", (err) => {
                throw err;
            });
            await nodeJsInstaller.Start();
        }

        const serverFilename = path.parse(new URL(serverVersion.downloadUrl).pathname).base;
        const savePath = path.join(GetLauncherDirectory(), serverFilename);

        if (fs.existsSync(savePath)) fs.rmSync(savePath);
        const res = await axios.get(serverVersion.downloadUrl, {
            responseType: "stream",
        });

        const totalLength = parseInt(res.headers["content-length"], 10);

        this.writer = fs.createWriteStream(savePath);
        this.writer.on("error", (err) => {
            this.emit("error", err);
        });
        this.writer.on("close", async () => {
            this.emit("unpacking");
            const dir = path.join(dialog.showOpenDialogSync({ properties: ["openDirectory"] })[0]);
            if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

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
     * Cancels installing
     */
    Stop() {
        this.writer.destroy();
        this.emit("cancelled");
    }

    /**
     * Version of the server to be installed
     * 
     * @type {string}
     */
    serverVersion;

    /**
     * @type {fs.WriteStream}
     */
    writer;

    /**
     * @type {Number}
     */
    downloadedBytes = 0;
};

module.exports = ServerInstaller;