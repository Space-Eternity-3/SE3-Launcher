import { Badge, Button, Highlight } from "@mantine/core";
import { runVersion } from "./preload/versionManager";
import styles from "./styles/InstalledVersion.module.css";
import SE3ApiSettings from "../../common/SE3ApiSettings";
import noVersionImage from "./assets/img/no-version-image.png";

export default function InstalledVersion({ version, uninstallVersionConfirm, versionFilter }) {
    return (
        <div
            style={{
                backgroundImage: `url("${version.image ? new URL("./" + version.image, SE3ApiSettings.GetImagesDir()).toString() : noVersionImage}")`,
            }}
            className={styles.installedVersionContainer}
        >
            <div className={styles.installedVersion}>
                <span
                    style={{
                        color: version.hidden ? "red" : "white",
                    }}
                    className={styles.title}
                >
                    <Highlight
                        style={{
                            display: "inline",
                            fontSize: "25px"
                        }}
                        highlight={versionFilter}
                    >
                        {version.name}
                    </Highlight>
                    {version.hidden && (
                        <Badge color="red" size="lg" style={{ float: "right", marginTop: "7px" }}>
                            Hidden
                        </Badge>
                    )}
                </span>
                <div className={styles.buttons}>
                    <Button
                        onClick={() => {
                            uninstallVersionConfirm(version);
                        }}
                        color="red"
                    >
                        Uninstall
                    </Button>
                    <Button
                        onClick={() => {
                            runVersion(version.tag);
                        }}
                    >
                        Play
                    </Button>
                </div>
            </div>
        </div>
    );
}
