const EventEmitter = require("events");
const { GetServerVersion } = require("../SE3Api");
const { IsNodeJsInstalled } = require("./NodeJsUtils");

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

    async Install() {

    }

    /**
     * Version of the server to be installed
     * 
     * @type {string}
     */
    serverVersion;
};
