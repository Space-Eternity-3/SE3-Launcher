const axios = require("axios");
const { GetVersionZipFile, GetServerVersions } = require("../SE3Api");
const { URL } = require("url");
const path = require("path");
const { GetNodejsDirectory, GetLauncherDirectory } = require("../utils");
const EventEmitter = require("events");
const fs = require("fs");
const compressing = require("compressing");

class NodejsInstaller extends EventEmitter {
    constructor(serverVersion) {
        super();

        this.serverVersion = serverVersion;
    }

    /**
     * @public
     * Start installing
     */
    async Start() {
        try {
            // get the info of the server to download
            let server;
            try {
                server = (await GetServerVersions()).find(version => version.version === this.serverVersion);
            } catch (ex) {
                this.emit("error", "Could not get server info " + ex);
                return;
            }

            // get url and filename of the node.js runtime to download
            const nodeJsUrls = {
                win32: server.windowsRuntime,
                linux: server.linuxRuntime,
            };
            const nodeJsUrl = nodeJsUrls[process.platform];
            const nodeJsFilename = path.parse(new URL(nodeJsUrl).pathname).base;

            const savePath = path.join(GetLauncherDirectory(), nodeJsFilename);

            if (fs.existsSync(savePath)) fs.rmSync(savePath);
            const res = await axios.get(nodeJsUrl, {
                responseType: "stream",
            });

            const totalLength = parseInt(res.headers["content-length"], 10);

            this.writer = fs.createWriteStream(savePath);
            this.writer.on("error", (err) => {
                this.emit("error", err);
            });
            this.writer.on("close", async () => {
                this.emit("unpacking");
                const dir = path.join(GetNodejsDirectory(), server.runtimeVersion);
                if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });

                switch (path.parse(nodeJsFilename).ext) {
                    case ".zip":
                        try {
                            await compressing.zip.uncompress(savePath, dir);
                        } catch (ex) {
                            this.emit("error", ex);
                            return;
                        }
                        break;
                    case ".gz":
                        try {
                            await compressing.tgz.uncompress(savePath, dir);
                        } catch (ex) {
                            this.emit("error", ex);
                            return;
                        }
                };

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
    serverVersion;

    /**
     * @type {fs.WriteStream}
     */
    writer;

    /**
     * @type {Number}
     */
    downloadedBytes = 0;
}

module.exports = NodejsInstaller;