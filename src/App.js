import "./App.css";
import "mdb-ui-kit/css/mdb.dark.min.css";
import { MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane } from "mdb-react-ui-kit";
import { useState, useEffect } from "react";
import VersionSelector from "./VersionSelector";
import { GetVersions } from "./versionsApi/versionsApi";
import HomePage from "./HomePage";
import { showNotification } from "@mantine/notifications";

function humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + " " + units[u];
}

export default function App() {
    const [basicActive, setBasicActive] = useState("homeTab");
    const [versionsSelectorVersions, setVersionsSelectorVersions] = useState([]);
    const [versionSelectorShown, setVersionSelectorShown] = useState(false);

    const handleBasicClick = (value) => {
        if (value === basicActive) return;
        setBasicActive(value);
    };

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

    useEffect(() => {
        (async () => {
            setVersionsSelectorVersions(await VersionSelectorVersions());
        })();
    }, []);

    return (
        <div className="h-100">
            <MDBTabs
                style={{
                    backgroundColor: "#363636",
                    height: "47px",
                }}
            >
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleBasicClick("homeTab")} active={basicActive === "homeTab"}>
                        Home
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleBasicClick("versionsTab")} active={basicActive === "versionsTab"}>
                        Versions
                    </MDBTabsLink>
                </MDBTabsItem>
            </MDBTabs>

            <MDBTabsContent
                style={{
                    height: "calc(100% - 47px)",
                    position: "relative",
                }}
            >
                <MDBTabsPane className="h-100" show={basicActive === "homeTab"}>
                    <HomePage />
                </MDBTabsPane>
                <MDBTabsPane show={basicActive === "versionsTab"}>
                    <VersionSelector
                        onCancel={() => {
                            setVersionSelectorShown(false);
                        }}
                        onInstall={onInstall}
                        shown={versionSelectorShown}
                        versions={versionsSelectorVersions}
                    />
                    <button
                        onClick={() => {
                            setVersionSelectorShown(true);
                        }}
                        id="add-button"
                    />
                </MDBTabsPane>
            </MDBTabsContent>
        </div>
    );
}
