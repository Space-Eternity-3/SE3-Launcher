import styles from "./styles/App.module.css";
import "github-markdown-css/github-markdown-dark.css";
import { useEffect, useState } from "react";
import VersionSelector from "./VersionSelector";
import { GetInstalledVersions, GetVersions, IsVersionInstalled, UninstallVersion } from "./SE3Api/versionsApi";
import { GetLauncherInfo } from "./SE3Api/launcherApi";
import HomePage from "./HomePage";
import { showNotification, updateNotification } from "@mantine/notifications";
import { Container, Tabs, Text, Autocomplete, Burger, Indicator, Group } from "@mantine/core";
import { useModals } from "@mantine/modals";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import InstalledVersion from "./InstalledVersion";
import Installations from "./Installations";
import ServerManager from "./ServerManager/ServerManager";
import Installer from "./Installer";

let versions = {};

export default function App() {
    const [activeTab, setActiveTab] = useState("home");
    const [versionsSelectorVersions, setVersionsSelectorVersions] = useState([]);
    const [versionSelectorShown, setVersionSelectorShown] = useState(false);
    const [launcherText, setLauncherText] = useState("Failed to load launcher info");
    const [installedVersions, setInstalledVersions] = useState([]);
    const [playButtonText, setPlayButtonText] = useState("Play");
    const [versionFilter, setVersionFilter] = useState("");
    const [installationsOpened, setInstallationsOpened] = useState(false);
    const [areInstallationsRunning, setAreInstallationsRunning] = useState(false);
    const modals = useModals();

    const updateInstalledVersions = async () => {
        const installedVersions = await GetInstalledVersions();
        setInstalledVersions(installedVersions);

        if (IsVersionInstalled(versions.latest)) setPlayButtonText("Play");
        else if (installedVersions.length > 0) setPlayButtonText("Update");
        else setPlayButtonText("Install");
    };

    useEffect(() => {
        (async () => {
            try {
                setLauncherText(await GetLauncherInfo());
            } catch (ex) {}

            versions = await GetVersions();
            if (!versions) {
                showNotification({
                    title: "Failed to get versions. Check your internet connection.",
                    color: "red",
                    autoClose: true,
                    withCloseButton: true,
                });
            }
            updateInstalledVersions();
        })();
    }, []);

    useEffect(() => {
        window.preloadBridge.set("uncaught_exception", (err) => {
            showNotification({
                color: "red",
                title: "Error occurred in the main process.",
                message: (
                    <div>
                        <code>{`${err}`}</code>
                        <br />
                        <br />
                        If the error keeps appearing, please report it on{" "}
                        <Text variant="link" component="a" href="https://github.com/Space-Eternity-3/SE3-Launcher/issues">
                            GitHub
                        </Text>{" "}
                        or{" "}
                        <Text variant="link" component="a" href="https://discord.gg/e4ppBTRKhg">
                            our Discord server
                        </Text>
                        .
                    </div>
                ),
                withCloseButton: true,
                autoClose: true,
            });
        });

        return () => {
            window.preloadBridge.delete("uncaught_exception");
        };
    }, []);
    
    function checkIfInstallationsAreRunning() {
        setAreInstallationsRunning(Object.entries(new Installer().getInstallations()).length > 0);
    }

    useEffect(() => {
        const installer = new Installer();

        installer.getEmitter().on("update", checkIfInstallationsAreRunning);
        return () => {
            installer.getEmitter().removeListener("update", checkIfInstallationsAreRunning);
        };
    }, []);

    const VersionSelectorVersions = async () => {
        const versions = await GetVersions();
        let outVersions = [];
        versions.Versions.reverse().forEach((e) => {
            outVersions.push({
                label: e.name,
                size: e.size,
                value: e.tag,
                hidden: e.hidden,
                name: e.name,
                isLinuxSupported: !!e.linuxFile,
            });
        });
        return outVersions;
    };

    const showVersionSelector = async () => {
        setVersionSelectorShown(true);
        setVersionsSelectorVersions(await VersionSelectorVersions());
    };

    const openVersionSelector = () => {
        setActiveTab("versions");
        showVersionSelector();
    };

    const onInstall = async(version) => {
        showNotification({
            title: `Started installing ${version.label}`,
            autoClose: true,
            withCloseButton: true,
            loading: false,
        });

        setVersionSelectorShown(false);

        await (new Installer().install({
            type: "version",
            version: version.value,
        }));

        showNotification({
            title: `Finished installing ${version.label}`,
            autoClose: true,
            withCloseButton: true,
            loading: false,
        });

        updateInstalledVersions();
    };

    const uninstallVersion = (ver) => {
        modals.openConfirmModal({
            title: "Are you sure you want to uninstall this version?",
            labels: { confirm: "Uninstall", cancel: "No, go back" },
            onConfirm: async () => {
                try {
                    showNotification({
                        id: `uninstalling-${ver.tag}`,
                        title: `Uninstalling... ${ver.name}`,
                        autoClose: false,
                        withCloseButton: false,
                        loading: true,
                    });
                    await UninstallVersion(ver.tag);
                    updateInstalledVersions();
                    updateNotification({
                        id: `uninstalling-${ver.tag}`,
                        title: `Uninstalled ${ver.name}`,
                        autoClose: true,
                        withCloseButton: true,
                        loading: false,
                    });
                } catch (ex) {
                    updateNotification({
                        id: `uninstalling-${ver.tag}`,
                        title: `Failed to uninstall ${ver.name}\n${ex}`,
                        autoClose: false,
                        withCloseButton: true,
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

    return (
        <Container>
            <Installations opened={installationsOpened} setOpened={setInstallationsOpened} />
            <Tabs value={activeTab} onTabChange={setActiveTab}>
                <Tabs.List>
                    <Container
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <Group spacing={0}>
                            <Tabs.Tab value="home">Home</Tabs.Tab>
                            <Tabs.Tab value="versions">Versions</Tabs.Tab>
                            <Tabs.Tab value="server">Server</Tabs.Tab>
                            <Tabs.Tab value="launcher">Launcher</Tabs.Tab>
                        </Group>

                        <Indicator
                            disabled={!areInstallationsRunning}
                            style={{
                                display: "block",
                                verticalAlign: "middle",
                            }}
                            position="middle-start"
                            size={15}
                            withBorder
                        >
                            <Burger opened={installationsOpened} onClick={() => setInstallationsOpened((o) => !o)} />
                        </Indicator>
                    </Container>
                </Tabs.List>

                <Tabs.Panel value="home">
                    <HomePage openVersionSelector={openVersionSelector} versions={versions} playButtonText={playButtonText} />
                </Tabs.Panel>

                <Tabs.Panel value="versions">
                    <div className={styles.versionsTab}>
                        <Autocomplete
                            style={{
                                margin: "5px 10px 10px",
                                display: "block",
                            }}
                            value={versionFilter}
                            onChange={setVersionFilter}
                            placeholder="Version filter"
                            data={["Alpha", "Beta", "Gamma", "Release", "DEV"]}
                            dropdownPosition="bottom"
                        />
                        <div className={styles.versionsContainer}>
                            {installedVersions
                                .filter((version) => version.name.toLowerCase().includes(versionFilter.toLowerCase()))
                                .map((version) => <InstalledVersion versionFilter={versionFilter} key={version.tag} version={version} uninstallVersion={uninstallVersion} />)
                                .reverse()}
                            {installedVersions.filter((version) => version.name.toLowerCase().includes(versionFilter.toLowerCase())).length === 0 && (
                                <div style={{ height: "calc(100% - 60px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <div>
                                        Empty here...
                                        <br />
                                        <Text style={{ cursor: "pointer" }} size="lg" onClick={showVersionSelector} color="blue" underline>
                                            Install a version.
                                        </Text>
                                    </div>
                                </div>
                            )}
                        </div>
                        <VersionSelector
                            onCancel={() => {
                                setVersionSelectorShown(false);
                            }}
                            onInstall={onInstall}
                            shown={versionSelectorShown}
                            versions={versionsSelectorVersions}
                        />
                    </div>
                    <button onClick={showVersionSelector} className={styles.addButton} />
                </Tabs.Panel>

                <Tabs.Panel value="server">
                    <ServerManager />
                </Tabs.Panel>

                <Tabs.Panel value="launcher">
                    <div className={styles.launcherTabContainer}>
                        <ReactMarkdown className="markdown-body" children={launcherText} remarkPlugins={[remarkGfm]} />
                    </div>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
