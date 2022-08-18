const electron = require("electron");

module.exports = () => {
    window.addEventListener("DOMContentLoaded", () => {
        // Open external links in browser
        document.querySelector("body").addEventListener("click", (event) => {
            if (event.target.tagName.toLowerCase() === "a") {
                if (!["https:", "http:"].includes(new URL(event.target.href).protocol)) return;
                const absoluteUrl = new RegExp("^(?:[a-z]+:)?//", "i");
                event.preventDefault();
                if (!absoluteUrl.test(event.target.href)) return;
                electron.shell.openExternal(event.target.href);
            }
        });
    });
};
