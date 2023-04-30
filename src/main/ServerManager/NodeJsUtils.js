const path = require("path");
const fs = require("fs");
const { GetNodejsDirectory } = require("../utils");

/**
 * Gets node and npm executables
 * 
 * @param {string} nodeVersion 
 */
const GetNodeJsExecs = (nodeVersion) => {
    const baseDir = path.join(GetNodejsDirectory(), nodeVersion);

    let subDir;
    switch (process.platform) {
        case "linux":
            subDir = path.join(`node-${nodeVersion}-linux-x64`, "bin");
            break;
        case "win32":
            throw new Error("Not implemended"); // TODO
    };

    return {
        node: path.join(baseDir, subDir, "node"),
        npm: path.join(baseDir, subDir, "npm")
    };
};

/**
 * Checks if node and npm executables exist
 * 
 * @param {string} nodeVersion version of node.js
 * @returns {boolean} returns true if both files exist
 */
const IsNodeJsInstalled = (nodeVersion) => {
    const nodeJsExecutables = GetNodeJsExecs(nodeVersion);

    return fs.existsSync(nodeJsExecutables.node) && fs.existsSync(nodeJsExecutables.npm);
};

module.exports = {
    GetNodeJsExecs,
    IsNodeJsInstalled
};
