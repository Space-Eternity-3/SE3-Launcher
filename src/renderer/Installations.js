import { ActionIcon, Drawer, Progress, Text } from "@mantine/core";
import styles from "./styles/Installations.module.css";
import { IconTrash } from "@tabler/icons-react";
import { CancelInstall } from "./SE3Api/versionsApi";

export default function Installations({ installations, opened, setOpened }) {
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
                            filter: (props.progress === null) ? "brightness(50%)" : "none",
                        }}
                        onMouseDown={() => {
                            CancelInstall(props.version);
                        }}
                        size="lg"
                    >
                        <IconTrash size={20} />
                    </ActionIcon>
                </div>
                <Text size="sm" color="#bbbbbb">
                    {props.children}
                </Text>
                <Progress animate={props.progress === null} color="green" size="sm" value={(props.progress === null) ? 100 : props.progress} />
            </div>
        );
    }

    return (
        <>
            <Drawer size="40%" zIndex={1001} opened={opened} onClose={() => setOpened(false)} title="Current installations" padding="xl">
                {installations.map((installation) => (
                    <Installation key={installation.version} version={installation.version} displayText={installation.displayText} progress={installation.progress}>
                        {installation.detailsText}
                    </Installation>
                ))}
            </Drawer>
        </>
    );
}
