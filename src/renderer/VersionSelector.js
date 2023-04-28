import { Code, Radio, Switch, Tooltip, Text, Button, Modal, Space } from "@mantine/core";
import { useEffect, useState } from "react";
import { useModals } from "@mantine/modals";
import { GetVersionState, Platform } from "./SE3Api/versionsApi";
import { humanFileSize } from "./utils";

export default function VersionSelector({ versions, shown, onCancel, onInstall }) {
    const [showHidden, setShowHidden] = useState(false);
    const [versionSelectValue, setVersionSelectValue] = useState();
    const modals = useModals();

    useEffect(() => {
        if (shown === false) setVersionSelectValue(null);
    }, [shown]);

    // TODO: do something with this
    const Version = (e) => {
        const versionState = GetVersionState(e.value);
        const isInstalledOrInstalling = versionState !== "not_installed";
        return (
            <>
                <Radio
                    key={e.value}
                    value={e.value}
                    disabled={isInstalledOrInstalling}
                    label={
                        e.hidden ? (
                            <Tooltip wrapLines withArrow transition="fade" transitionDuration={200} label="Hidden version, may cause issues!">
                                <span
                                    style={{
                                        color: isInstalledOrInstalling ? "#990502" : "#ff3020",
                                    }}
                                >
                                    {e.label} &nbsp; {e.size ? <Code>{humanFileSize(e.size, false, 3)}</Code> : <Code>unknown</Code>}
                                    {isInstalledOrInstalling && (
                                        <>
                                            {" -"} {versionState}
                                        </>
                                    )}
                                </span>
                            </Tooltip>
                        ) : (
                            <>
                                {e.label} &nbsp; {e.size ? <Code>{humanFileSize(e.size, false, 3)}</Code> : <Code>unknown</Code>}
                                {isInstalledOrInstalling && (
                                    <>
                                        {" -"} {versionState}
                                    </>
                                )}
                            </>
                        )
                    }
                />
                <Space h="sm" />
            </>

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
                        This version is hidden.
                        <br />
                        Hidden versions may cause issues like corrupting worlds.
                        <br />
                        <br />
                        Do you want to continue?
                    </Text>
                ),
                labels: { confirm: "Continue", cancel: "Cancel" },
                confirmProps: { color: "red" },
                zIndex: 999,
                onConfirm: () => onInstall(version),
            });
        } else onInstall(version);
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
        <Modal onClose={onCancel} size="60%" centered opened={shown} title="Select version to install">
            <Radio.Group
                style={{
                    maxHeight: "230px",
                    overflowY: "scroll",
                    flex: "1 1 auto",
                    margin: "0",
                }}
                value={versionSelectValue}
                onChange={setVersionSelectValue}
            >
                {versions.map((e) => {
                    if ((e.hidden && !showHidden) || (Platform() === "linux" && !e.isLinuxSupported)) return null;
                    return Version(e);
                })}
            </Radio.Group>
            <div
                style={{
                    marginTop: "20px",
                }}
            >
                <Switch style={{ float: "left", marginTop: "5px" }} checked={showHidden} onChange={(event) => setShowHidden(event.currentTarget.checked)} label={<span style={{ color: "#ffffff" }}>Show hidden</span>} color="orange" size="md" />
                <Button
                    onClick={() => {
                        onInstall && onInstallPre();
                    }}
                    color="green"
                    disabled={installButtonDisabled()}
                    uppercase
                    style={{
                        float: "right",
                        marginBottom: "5px",
                    }}
                >
                    install
                </Button>
            </div>
        </Modal>
    );
}
