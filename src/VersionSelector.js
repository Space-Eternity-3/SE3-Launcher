import { RadioGroup, Radio, Switch, Tooltip, Text, Button, Header, Footer } from "@mantine/core";
import { useState } from "react";
import { useModals } from "@mantine/modals";

export default function VersionSelector({ versions, shown, onCancel, onInstall }) {
    const [showHidden, setShowHidden] = useState(false);
    const [versionSelectValue, setVersionSelectValue] = useState();
    const modals = useModals();

    // TODO: do something with this
    const Version = (e) => {
        return (
            <Radio
                key={e.value}
                value={e.value}
                label={
                    e.hidden ? (
                        <Tooltip
                            wrapLines
                            withArrow
                            transition="fade"
                            transitionDuration={200}
                            label="Hidden version, may cause issues!"
                        >
                            <span
                                style={{
                                    color: "#ff3020",
                                }}
                            >
                                {e.label}
                            </span>
                        </Tooltip>
                    ) : (
                        e.label
                    )
                }
            />
        );
    };

    const onInstallPre = () => {
        let version = versions.find((e) => {
            return e.value === versionSelectValue;
        });
        if (version.hidden) {
            modals.openConfirmModal({
                title: "Hidden Version",
                centered: true,
                children: (
                    <Text size="sm">
                        This version is hidden, it may cause issues, like corrupting worlds.
                        <br />
                        Do you want to continue?
                    </Text>
                ),
                labels: { confirm: "Continue", cancel: "Cancel" },
                confirmProps: { color: "red" },
                onConfirm: () => onInstall(versionSelectValue),
            });
        } else onInstall(versionSelectValue);
    };

    const installButtonDisabled = () => {
        if (!versionSelectValue) return true;
        let version = versions.find((e) => {
            return e.value === versionSelectValue;
        });
        if (!showHidden && version.hidden) return true;
        return false;
    };

    return (
        <div
            style={{
                visibility: shown ? "visible" : "hidden",
                opacity: shown ? "1" : "0",
            }}
            className="VersionSelectorContainer"
        >
            <div className="VersionSelector">
                <Header style={{
                    padding: "10px 13px"
                }}>
                    <span style={{
                        color: "white",
                        fontFamily: "Quicksand",
                        fontSize: "26px"
                    }}>Select version to install</span>
                    <button
                        onClick={() => {
                            onCancel?.();
                        }}
                        className="CloseButton"
                    ></button>
                </Header>

                <div
                    style={{
                        margin: "0 0 0 20px",
                        flex: "1 1 auto",
                        overflowY: "scroll",
                    }}
                    className="versions"
                >
                    <RadioGroup value={versionSelectValue} onChange={setVersionSelectValue} orientation="vertical">
                        {versions.map((e) => {
                            if (e.hidden && !showHidden) return null;
                            return Version(e);
                        })}
                    </RadioGroup>
                </div>
                <Footer className="VersionAcceptContainer">
                    <Switch
                        style={{ float: "left", marginTop: "5px" }}
                        checked={showHidden}
                        onChange={(event) => setShowHidden(event.currentTarget.checked)}
                        label={<span style={{ color: "#ffffff" }}>Show hidden</span>}
                        color="orange"
                        size="md"
                    />
                    <Button 
                        onClick={() => {
                            onInstall && onInstallPre();
                        }}
                        color="green"
                        disabled={installButtonDisabled()}
                        uppercase
                    >
                        install
                    </Button>
                </Footer>
            </div>
        </div>
    );
}
