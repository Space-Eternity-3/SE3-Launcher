import { IsVersionInstalled, RunVersion } from "./SE3Api/versionsApi";
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
                        if (IsVersionInstalled(versions.latest)) RunVersion(versions.latest);
                        else openVersionSelector();
                    }}
                    className={styles.playButton}
                >{`${playButtonText}`}</button>
            </div>
        </div>
    );
}
