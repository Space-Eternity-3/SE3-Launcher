import { Button } from "@mantine/core";
import styles from "./styles/InstalledVersion.module.css";

export default function InstalledVersion({ version }) {
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
                    <Button color="red">Uninstall</Button>
                    <Button>Play</Button>
                </div>
            </div>
        </div>
    );
}
