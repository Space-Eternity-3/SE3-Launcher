import styles from "./styles/App.module.css";
import "github-markdown-css/github-markdown-dark.css";
import { useEffect, useState } from "react";
import VersionSelector from "./VersionSelector";
import { GetVersions, InstallVersion } from "./SE3Api/versionsApi";
import { GetLauncherInfo } from "./SE3Api/launcherApi";
import HomePage from "./HomePage";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Button, Container, Tabs, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { humanFileSize } from "./utils";
import { throttle } from "lodash";

export default function App() {
    const [activeTab, setActiveTab] = useState(0);
    const [versionsSelectorVersions, setVersionsSelectorVersions] = useState([]);
    const [versionSelectorShown, setVersionSelectorShown] = useState(false);
    const [launcherText, setLauncherText] = useState("Failed to load launcher info");
    const modals = useModals();

    useEffect(() => {
        (async () => {
            setLauncherText(await GetLauncherInfo());
        })();
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
            },
            onError: (err) => {
                throttled.flush();
                updateNotification({
                    id: notificationID,
                    title: `Error installing ${version.name}`,
                    message: err,
                    autoClose: true,
                    disallowClose: false,
                    loading: false,
                });
            }
        });
    };

    const showVersionSelector = async () => {
        setVersionSelectorShown(true);
        setVersionsSelectorVersions(await VersionSelectorVersions());
    };

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
                    <HomePage />
                </Tabs.Tab>
                <Tabs.Tab label="Versions">
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
