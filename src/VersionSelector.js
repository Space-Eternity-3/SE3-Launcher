import { RadioGroup, Radio, Switch, Tooltip } from "@mantine/core";
import { MDBBtn, MDBFooter, MDBNavbar, MDBNavbarBrand } from "mdb-react-ui-kit";
import Notiflix from "notiflix";
import { useState } from "react";

export default function VersionSelector({ versions, shown, onCancel, onInstall }) {
    const [showHidden, setShowHidden] = useState(false);
    const [versionSelectValue, setVersionSelectValue] = useState();

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
            Notiflix.Confirm.show(
                "Hidden Version",
                "This version is hidden, it may cause issues, like corrupting worlds.<br />Do you want to continue?",
                "Yes",
                "No",
                () => {
                    onInstall(versionSelectValue);
                },
                () => {},
                { plainText: false, width: "400px" }
            );
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
                <MDBNavbar
                    className="vs-nav px-3"
                    style={{
                        flex: "0 1 auto",
                    }}
                >
                    <MDBNavbarBrand>Select version to install</MDBNavbarBrand>
                    <button
                        onClick={() => {
                            onCancel?.();
                        }}
                        className="CloseButton"
                    ></button>
                </MDBNavbar>

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
                <MDBFooter className="VersionAcceptContainer">
                    <Switch
                        style={{ float: "left", marginTop: "5px" }}
                        checked={showHidden}
                        onChange={(event) => setShowHidden(event.currentTarget.checked)}
                        label={<span style={{ color: "#ffffff" }}>Show hidden</span>}
                        color="orange"
                        size="md"
                    />
                    <MDBBtn
                        onClick={() => {
                            onInstall && onInstallPre();
                        }}
                        color="success"
                        disabled={installButtonDisabled()}
                    >
                        install
                    </MDBBtn>
                </MDBFooter>
            </div>
        </div>
    );
}
