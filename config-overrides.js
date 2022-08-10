const path = require("path");

module.exports = {
    paths: function (paths) {
        paths.appIndexJs = path.resolve(__dirname, "src/renderer/index.js");
        paths.appSrc = path.resolve(__dirname, "src/renderer/");
        return paths;
    },
};
