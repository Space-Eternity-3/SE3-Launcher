import { RadioGroup, Radio, Switch, Tooltip, Text, Button, Modal } from "@mantine/core";
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
                        <Tooltip wrapLines withArrow transition="fade" transitionDuration={200} label="Hidden version, may cause issues!">
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
            <RadioGroup
                style={{
                    maxHeight: "230px",
                    overflowY: "scroll",
                    flex: "1 1 auto",
                    margin: "0",
                }}
                value={versionSelectValue}
                onChange={setVersionSelectValue}
                orientation="vertical"
            >
                {versions.map((e) => {
                    if (e.hidden && !showHidden) return null;
                    return Version(e);
                })}
            </RadioGroup>
            <div
                style={{
                    marginTop: "20px",
                }}
            >
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
                    style={{
                        float: "right",
                    }}
                >
                    install
                </Button>
            </div>
        </Modal>
    );
}
