import EventEmitter from "eventemitter3";
import { cancelInstall, installVersion } from "./preload/versionManager";

class Installer {
    constructor() {
        if (!Installer.emitter) {
            Installer.emitter = new EventEmitter();
        }
    }

    /**
     * @typedef {Object} InstallData
     * @property {"version"} type
     * @property {string} version
     */

    /**
     * @typedef {Object} Installation
     * @property {string} displayText
     * @property {string} detailsText
     * @property {number} progress
     */

    /**
     * Starts an installation
     *
     * @param {InstallData} data
     * @returns
     */
    install(data) {
        const this_ = this;
        return new Promise((resolve, reject) => {
            const id = installVersion(data, {
                updateData: (data) => {
                    Installer.installations[id] = data;
                    Installer.emitter.emit("update");
                },
                finish: () => {
                    this_.removeInstallationInternal(id);
                    Installer.emitter.emit("update");
                    resolve();
                },
                cancelled: () => {
                    this_.removeInstallationInternal(id);
                    Installer.emitter.emit("update");
                },
                error: (err) => {
                    this_.removeInstallationInternal(id);
                    Installer.emitter.emit("error", err);
                    reject(err);
                },
            });

            Installer.installations[id] = {
                displayText: "Starting...",
                detailsText: "",
                progress: 0,
            };

            Installer.emitter.emit("update");
        });
    }

    cancel(id) {
        cancelInstall(id);
        this.removeInstallationInternal(id);
    }

    /**
     * @private
     * @param {string} id
     */
    removeInstallationInternal(id) {
        Installer.installations[id] = null;
        delete Installer.installations[id];
        Installer.emitter.emit("update");
    }

    /**
     * @returns {Installation[]}
     */
    getInstallations() {
        return Installer.installations;
    }

    /**
     * @private
     * @type {Installation[]}
     */
    static installations = {};

    /**
     * @type {EventEmitter}
     * @private
     */
    static emitter;

    /**
     * @returns {EventEmitter}
     */
    getEmitter() {
        if (!Installer.emitter) {
            Installer.emitter = new EventEmitter();
        }

        return Installer.emitter;
    }
}

export default Installer;
