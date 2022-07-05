import { Button } from "@mantine/core";
import { RunVersion } from "./se3Api/versionsApi";
import styles from "./styles/InstalledVersion.module.css";

export default function InstalledVersion({ version, uninstallVersion }) {
    return (
        <div
            style={{
                backgroundImage: `url("${version.image ? new URL("./" + version.image, window.versionsApiSettings.GetImagesDir()).toString() : "no-version-image.png"}")`,
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
                    {version.name}
                </span>
                <div className={styles.buttons}>
                    <Button
                        onClick={() => {
                            uninstallVersion(version);
                        }}
                        color="red"
                    >
                        Uninstall
                    </Button>
                    <Button onClick={() => {
                        RunVersion(version.tag);
                    }}>Play</Button>
                </div>
            </div>
        </div>
    );
}
