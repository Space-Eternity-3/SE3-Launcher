import { Badge, Button, Card, Code, Divider, Group, Space, Text, Title } from "@mantine/core";
import styles from "./styles/ServerManager.module.css";
import { useEffect, useState } from "react";

export default function ServerManager() {
    const [serverVersions, setServerVersions] = useState([]);

    useEffect(() => {
        async function fetchServerVersions() {
            setServerVersions(await window.se3Api.GetServerVersions());
            console.log(await window.se3Api.GetServerVersions());
        }
        fetchServerVersions();
    }, []);

    return (
        <div className={styles.container}>
            <Title order={1}>Server Manager</Title>
            <Button>Create server</Button>
            <div>
{/* //                     return <Card key={version.version}>
//                         <Title order={3}>{version.name}</Title>
//                         <Group spacing="sm">
//                             <Badge color="blue">Installed</Badge><Badge color="green">Node.js v18.16.0</Badge><Badge color="yellow">Port 27683</Badge>
//                         </Group>
//                         <Divider my="sm" />
//                         <Group spacing="sm">
//                             <Button color="blue" disabled>Start</Button>
//                             <Button color="orange">Stop</Button>
//                             <Button color="red">Kill</Button>
//                             <Button color="green">Configure</Button>
//                         </Group>
//                         <Space h="sm" />
//                         <Code block>
//                             {`-------------------------------
// Datapack imported: [DEFAULT]
// New seed generated: [5247297]
// Server started on version: [Beta 1.15]
// Max players: [25]
// Port: [27683]
// -------------------------------

// `}
//                         </Code>
//                         <Space h="xs" />
//                         <Text fz="xs" c="dimmed">Server running for 00:02:43</Text>

//                     </Card> */}
            </div>
        </div>
    );
}