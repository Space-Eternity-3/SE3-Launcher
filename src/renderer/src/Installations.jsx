import { ActionIcon, Drawer, Progress, Text } from "@mantine/core";
import styles from "./styles/Installations.module.css";
import { IconTrash } from "@tabler/icons-react";
import { cancelInstall } from "./preload/versionManager";
import Installer from "./Installer";
import { useEffect, useState } from "react";
import { throttle } from "lodash";

export default function Installations({ opened, setOpened }) {
    const [installations, setInstallations] = useState([]);

    useEffect(() => {
        const installer = new Installer();

        const updateInstallations = throttle(() => {
            setInstallations(
                Object.entries(new Installer().getInstallations()).map(([id, value]) => ({
                    ...value,
                    id,
                })),
            );
        }, 100);

        installer.getEmitter().on("update", updateInstallations);
        return () => {
            installer.getEmitter().removeListener("update", updateInstallations);
        };
    }, []);

    function Installation(props) {
        return (
            <div className={styles.installation}>
                <div>
                    {props.displayText}
                    <ActionIcon
                        style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginLeft: "10px",
                            filter: props.progress === null ? "brightness(50%)" : "none",
                        }}
                        variant="transparent"
                        color="red"
                        onMouseDown={() => {
                            cancelInstall(props.id);
                        }}
                        size="lg"
                    >
                        <IconTrash size={20} />
                    </ActionIcon>
                </div>
                <Text size="sm" color="#bbbbbb">
                    {props.children}
                </Text>
                <Progress animated={props.progress === null} color="green" size="sm" value={props.progress === null ? 100 : props.progress} />
            </div>
        );
    }

    return (
        <>
            <Drawer size="40%" zIndex={1001} opened={opened} onClose={() => setOpened(false)} title="Current installations" padding="xl">
                {installations.map((installation) => (
                    <Installation key={installation.id} id={installation.id} displayText={installation.displayText} progress={installation.progress}>
                        {installation.detailsText}
                    </Installation>
                ))}
            </Drawer>
        </>
    );
}
