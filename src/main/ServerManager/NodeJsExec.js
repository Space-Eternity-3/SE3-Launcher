const path = require("path");

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
        node: path.join(subDir, "node"),
        npm: path.join(subDir, "npm")
    };
};

module.exports = {
    GetNodeJsExecs
};
