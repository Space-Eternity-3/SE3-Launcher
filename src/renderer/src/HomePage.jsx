import { isVersionInstalled, runVersion } from "./preload/versionManager";
import styles from "./styles/HomePage.module.css";

export default function HomePage({ playButtonText, versions, openVersionSelector }) {
    return (
        <div className={styles.homePage}>
            <div className={styles.background}></div>
            <div className={styles.contentContainer}>
                <div className={styles.content}>Space Eternity 3</div>
            </div>
            <div className={styles.playContainer}>
                <button
                    onClick={async () => {
                        if (await isVersionInstalled(versions.latest)) runVersion(versions.latest);
                        else openVersionSelector();
                    }}
                    className={styles.playButton}
                >{`${playButtonText}`}</button>
            </div>
        </div>
    );
}
