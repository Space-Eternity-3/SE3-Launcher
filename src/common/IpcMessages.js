const IpcMessages = {
    VERSION_MANAGER: {
        INSTALL_VERSION: "version-manager-install-version", // renderer -> main | (id, data)
        ON_VERSION_INSTALL_PROGRESS: "version-manager-on-version-install-progress", // main -> renderer | (id, type, ...args)
        CANCEL_INSTALL: "version-manager-cancel-install", // renderer -> main | (id)

        UNINSTALL_VERSION: "version-manager-uninstall-version", // renderer -> main | (versionTag)
        
        GET_INSTALLED_VERSIONS: "version-manager-get-installed-versions", // renderer -> main
        GET_AVAILABLE_VERSIONS: "version-manager-get-available-versions", // renderer -> main
        GET_VERSION_STATE: "version-manager-get-version-state", // renderer -> main | (versionTag)
        IS_VERSION_INSTALLED: "version-manager-is-version-installed", // renderer -> main | (versionTag)

        RUN_VERSION: "version-manager-run-version", // renderer -> main | (versionTag)
    },
}

export default IpcMessages;