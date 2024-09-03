import { isVersionInstalled, runVersion } from "./preload/versionManager";
import styles from "./styles/HomePage.module.css";
import se3Logo from "./assets/img/logo.png";

export default function HomePage({ playButtonText, versions, openVersionSelector }) {
    return (
        <div className={styles.homePage}>
            <div className={styles.background}></div>
            <div className={styles.contentContainer}>
                <img 
                    src={se3Logo} 
                    alt="Space Eternity 3 - official logo" 
                    style={{ width: '65%', height: 'auto', display: 'block', margin: '0 auto', userSelect: `none` }} 
                />
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
