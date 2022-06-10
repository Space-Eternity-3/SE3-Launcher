import styles from "./styles/App.module.css";
import "github-markdown-css/github-markdown-dark.css";
import { useEffect, useState } from "react";
import VersionSelector from "./VersionSelector";
import { GetInstalledVersions, GetVersions, InstallVersion, IsVersionInstalled, UninstallVersion } from "./SE3Api/versionsApi";
import { GetLauncherInfo } from "./SE3Api/launcherApi";
import HomePage from "./HomePage";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Container, Tabs, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { humanFileSize } from "./utils";
import { throttle } from "lodash";
import InstalledVersion from "./InstalledVersion";

let versions = {};

export default function App() {
    const [activeTab, setActiveTab] = useState(0);
    const [versionsSelectorVersions, setVersionsSelectorVersions] = useState([]);
    const [versionSelectorShown, setVersionSelectorShown] = useState(false);
    const [launcherText, setLauncherText] = useState("Failed to load launcher info");
    const [installedVersions, setInstalledVersions] = useState([]);
    const [playButtonText, setPlayButtonText] = useState("Play");
    const modals = useModals();

    const updateInstalledVersions = async () => {
        const installedVersions = await GetInstalledVersions();
        setInstalledVersions(installedVersions);

        if (await IsVersionInstalled(versions.latest)) setPlayButtonText("Play");
        else if (installedVersions.length > 0) setPlayButtonText("Update");
        else setPlayButtonText("Install");
    };

    useEffect(() => {
        (async () => {
            try {
                setLauncherText(await GetLauncherInfo());
            }
            catch (ex) {

            }

            versions = await GetVersions();
            if (!versions) {
                showNotification({
                    title: "Failed to get versions. Check your internet connection.",
                    color: "red",
                    autoClose: true,
                    disallowClose: false
                })
            }
            updateInstalledVersions();
        })();
    }, []);

    useEffect(() => {
        window.listeners.add("uncaught_exception", (err) => {
            showNotification({
                color: "red",
                title: "Error ocurred in main process.",
                message: (
                    <div>
                        <code>{`${err}`}</code>
                        <br />
                        <br />
                        If the error keeps appearing, please report it on{" "}
                        <Text variant="link" component="a" href="https://github.com/Space-Eternity-3/SE3-Launcher/issues">
                            Github
                        </Text>{" "}
                        or{" "}
                        <Text variant="link" component="a" href="https://discord.gg/e4ppBTRKhg">
                            our discord server
                        </Text>
                        .
                    </div>
                ),
                disallowClose: false,
                autoClose: true,
            });
        });

        return () => {
            window.listeners.remove("uncaught_exception");
        };
    }, []);

    const VersionSelectorVersions = async () => {
        const versions = await GetVersions();
        let outVersions = [];
        versions.Versions.reverse().forEach((e) => {
            outVersions.push({
                label: `${e.name} - ${humanFileSize(e.size, true, 2)}`,
                value: e.tag,
                hidden: e.hidden,
                name: e.name,
            });
        });
        return outVersions;
    };

    const onInstall = async (version) => {
        setVersionSelectorShown(false);
        const notificationID = `installing-${version.value}`;

        /**
         * @type {import("../preload").Installer}
         */
        let installer;

        showNotification({
            id: notificationID,
            loading: true,
            title: `Installing ${version.name}`,
            message: "Starting...",
            autoClose: false,
            disallowClose: true,
        });

        const cancelInstallation = (e) => {
            modals.openConfirmModal({
                title: "Are you sure you want to cancel the installation?",
                labels: { confirm: "Cancel", cancel: "No, go back" },
                onConfirm: () => installer.Cancel(),
                confirmProps: {
                    color: "orange",
                },
                centered: true,
                zIndex: 999,
            });
        };

        const updateProgress = (downloadedBytes, totalBytes) => {
            updateNotification({
                id: notificationID,
                title: `Installing ${version.name}`,
                message: (
                    <>
                        Downloaded {humanFileSize(downloadedBytes, true, 2)} / {humanFileSize(totalBytes, true, 2)}
                        <br />
                        <button className={styles.installingCancelButton} onClick={cancelInstallation}>
                            Cancel
                        </button>
                    </>
                ),
                autoClose: false,
                disallowClose: true,
                loading: true,
            });
        };

        const throttled = throttle(updateProgress, 150);

        installer = InstallVersion({
            tag: version.value,
            onProgress: (downloadedBytes, totalBytes) => {
                throttled(downloadedBytes, totalBytes);
            },
            onUnpacking: () => {
                throttled.flush();
                updateNotification({
                    id: notificationID,
                    title: `Installing ${version.name}`,
                    message: `Unpacking...`,
                    autoClose: false,
                    disallowClose: true,
                    loading: true,
                });
            },
            onFinish: () => {
                updateNotification({
                    id: notificationID,
                    title: `Finished installing ${version.name}`,
                    autoClose: true,
                    disallowClose: false,
                    loading: false,
                });
                updateInstalledVersions();
            },
            onCancel: () => {
                throttled.flush();
                updateNotification({
                    id: notificationID,
                    title: `Canceled ${version.name}`,
                    autoClose: true,
                    disallowClose: false,
                    loading: false,
                });
                updateInstalledVersions();
            },
            onError: (err) => {
                throttled.flush();
                updateNotification({
                    id: notificationID,
                    title: `Error installing ${version.name}`,
                    message: `${err}`,
                    autoClose: true,
                    disallowClose: false,
                    loading: false,
                    color: "red"
                });
                updateInstalledVersions();
            },
        });
    };

    const showVersionSelector = async () => {
        setVersionSelectorShown(true);
        setVersionsSelectorVersions(await VersionSelectorVersions());
    };

    const uninstallVersion = (ver) => {
        modals.openConfirmModal({
            title: "Are you sure you want to uninstall this version?",
            labels: { confirm: "Uninstall", cancel: "No, go back" },
            onConfirm: async () => {
                try {
                    showNotification({
                        id: `uninstalling-${ver.tag}`,
                        title: `Uninstalled ${ver.name}`,
                        autoClose: false,
                        disallowClose: true,
                        loading: true,
                    });
                    await UninstallVersion(ver.tag);
                    updateInstalledVersions();
                    updateNotification({
                        id: `uninstalling-${ver.tag}`,
                        title: `Uninstalled ${ver.name}`,
                        autoClose: true,
                        disallowClose: false,
                        loading: false,
                    });
                } catch (ex) {
                    updateNotification({
                        id: `uninstalling-${ver.tag}`,
                        title: `Failed to uninstall ${ver.name}\n${ex}`,
                        autoClose: true,
                        disallowClose: false,
                        loading: false,
                    });
                }
            },
            confirmProps: {
                color: "red",
            },
            centered: true,
            zIndex: 999,
        });
    };

    const openVersionSelector = () => {
        setActiveTab(1);
        showVersionSelector();
    }

    return (
        <Container>
            <Tabs
                active={activeTab}
                onTabChange={setActiveTab}
                style={{
                    height: "100%",
                }}
            >
                <Tabs.Tab label="Home">
                    <HomePage openVersionSelector={openVersionSelector} versions={versions} playButtonText={playButtonText} />
                </Tabs.Tab>
                <Tabs.Tab label="Versions">
                    <div className={styles.versionsContainer}>
                        {installedVersions.map((version) => <InstalledVersion key={version.tag} version={version} uninstallVersion={uninstallVersion} />).reverse()}
                    </div>
                    <VersionSelector
                        onCancel={() => {
                            setVersionSelectorShown(false);
                        }}
                        onInstall={onInstall}
                        shown={versionSelectorShown}
                        versions={versionsSelectorVersions}
                    />
                    <button onClick={showVersionSelector} className={styles.addButton} />
                </Tabs.Tab>
                <Tabs.Tab label="Launcher">
                    <div
                        style={{
                            paddingTop: "40px",
                            margin: "0 10px 10px",
                            overflowY: "auto",
                            overflowX: "hidden",
                            width: "calc(100% - 20px)",
                            height: "calc(100% - 50px)",
                        }}
                    >
                        <ReactMarkdown className="markdown-body" children={launcherText} remarkPlugins={[remarkGfm]} />
                    </div>
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}
