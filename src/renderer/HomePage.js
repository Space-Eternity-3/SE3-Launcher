import { IsVersionInstalled, RunVersion } from "./SE3Api/versionsApi";
import styles from "./styles/HomePage.module.css";

export default function HomePage({ playButtonText, versions, openVersionSelector }) {
    return (
        <div style={{
            position: "absolute",
            top: "0",
            left: "0",
            bottom: "0",
            right: "0"
        }}>
            <div className={styles.background}></div>
            <div className={styles.contentContainer}>
                <div className={styles.content}>Space Eternity 3</div>
            </div>
            <div className={styles.playContainer}>
                <button onClick={async() => {
                    if (IsVersionInstalled(versions.latest)) RunVersion(versions.latest);
                    else openVersionSelector();
                }} className={styles.playButton}>{`${playButtonText}`}</button>
            </div>
        </div>
    );
}
