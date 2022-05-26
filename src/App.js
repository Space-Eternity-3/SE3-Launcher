import "./App.css";
import "github-markdown-css/github-markdown-dark.css";
import { useEffect, useState } from "react";
import VersionSelector from "./VersionSelector";
import { GetVersions } from "./se3Api/versionsApi";
import { GetLauncherInfo } from "./se3Api/launcherApi";
import HomePage from "./HomePage";
import { showNotification } from "@mantine/notifications";
import { Container, Tabs } from "@mantine/core";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { humanFileSize } from "./utils";

export default function App() {
    const [activeTab, setActiveTab] = useState(0);
    const [versionsSelectorVersions, setVersionsSelectorVersions] = useState([]);
    const [versionSelectorShown, setVersionSelectorShown] = useState(false);
    const [launcherText, setLauncherText] = useState("Failed to load launcher info");

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
            });
        });
        return outVersions;
    };

    const onInstall = (tag) => {
        setVersionSelectorShown(false);
        showNotification({
            title: "TODO",
            message: "installing",
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
                    <button onClick={showVersionSelector} id="add-button" />
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
