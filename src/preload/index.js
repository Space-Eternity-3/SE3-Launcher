import { contextBridge, ipcRenderer } from "electron";
import "./versionManager";

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

let rendererExports = {};

ipcRenderer.on("uncaught_exception", (event, err) => {
    rendererExports["uncaught_exception"](err);
});

contextBridge.exposeInMainWorld("preloadBridge", {
    set: (name, object) => {
        if (!(name in rendererExports)) rendererExports[name] = object;
    },
    delete: (name) => {
        if (!(name in rendererExports)) return;
        delete rendererExports[name];
        rendererExports[name] = [];
    },
});
