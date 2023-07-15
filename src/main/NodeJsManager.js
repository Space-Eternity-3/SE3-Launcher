const { GetNodejsDirectory } = require("./utils");
const path = require("path");
const fs = require("fs");

const GetNodeExecutablesPath = (version) => {
    const nodeJsDir = GetNodejsDirectory();

    switch (process.platform) {
        case "win32": {
            const versionPath = path.join(nodeJsDir, version);
            if (!fs.existsSync(versionPath)) return null;

            const execPath = path.join(versionPath, fs.readdirSync(versionPath).find((f) => f.startsWith("node")));
            if (!fs.existsSync(execPath)) return null;

            return execPath;
        }
        case "linux": {
            const versionPath = path.join(nodeJsDir, version);
            if (!fs.existsSync(versionPath)) return null;

            const execPath = path.join(versionPath, fs.readdirSync(versionPath).find((f) => f.startsWith("node")), "bin");
            if (!fs.existsSync(execPath)) return null;

            return execPath;
        }
    };
    return null;
};

module.exports = {
    GetNodeExecutablesPath,
};
