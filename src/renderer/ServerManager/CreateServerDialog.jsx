import { ActionIcon, Button, Group, Modal, Select, Space, Text, TextInput } from "@mantine/core";
import { IconFolder, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import ServerConfig from "./CreateServerDialog/ServerConfig";
import { SelectDirectory } from "../SE3Api/dialog";

const generatePassword = (length = 20, wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') =>
    Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => wishlist[x % wishlist.length])
        .join('')

export function CreateServerDialog({ onCreateServer, visible, serverVersions, onCancel }) {
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [adminPassword, setAdminPassword] = useState("");
    const [serverDirectory, setServerDirectory] = useState("");
    const [currentConfig, setCurrentConfig] = useState({});
    const [serverName, setServerName] = useState("My Great Server!");

    function setRandomPassword() {
        setAdminPassword(generatePassword(20));
    }

    function selectServerDirectory() {
        const directory = SelectDirectory();
        if (directory[0]) {
            setServerDirectory(directory[0]);
        }
    }

    function canCreateServer() {
        const server = serverVersions.find(version => version.version === selectedVersion);
        if (server) {
            if (server.supportedFeatures.includes("admin_access")) {
                if (!adminPassword) return false;
            }
        }

        return selectedVersion && serverDirectory && serverName;
    }

    function createServer() {
        const data = {
            version: selectedVersion,
            adminPassword,
            serverDirectory,
            config: currentConfig,
        }

        if (!canCreateServer()) return;
        onCreateServer(data);
    }

    return <Modal size="lg" opened={visible} onClose={onCancel} centered title="Create server">
        <Group grow position="center">
            <TextInput
                placeholder="My Great Server!"
                label="Server name"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
            />
            <Select
                label="Server version"
                placeholder="Pick one"
                value={selectedVersion}
                onChange={setSelectedVersion}
                nothingFound="No options"
                data={serverVersions.map(version => ({
                    label: version.name,
                    value: version.version,
                })
                )}
            />
        </Group>
        <Space h="sm" />
        <TextInput
            disabled={!(serverVersions.find(version => version.version === selectedVersion))?.supportedFeatures?.includes("admin_access")}
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            error={(adminPassword.length < 8 && adminPassword.length > 0) ? "It is recommended to use a password with at least 8 characters." : null}
            placeholder="Enter a password..."
            label="Admin password"
            rightSection={<ActionIcon title="Generate random password..." onClick={setRandomPassword}>
                <IconRefresh size="1.125rem" />
            </ActionIcon>}
        />
        <Space h="xs" />
        <ServerConfig configChange={setCurrentConfig} configValues={(serverVersions.find(version => version.version === selectedVersion))?.configValues} />

        {/* TODO: validation etc. */}
        <TextInput
            value={serverDirectory}
            onChange={e => setServerDirectory(e.target.value)}
            placeholder="Pick a directory..."
            label="Server directory"
            description={<Text color="red">The server directory will be wiped!</Text>}
            rightSection={<ActionIcon title="Select directory" onClick={selectServerDirectory}>
                <IconFolder size="1.125rem" />
            </ActionIcon>}
        />

        <Space h="sm" />
        <Group position="apart">
            <Button disabled={!canCreateServer()} onClick={createServer} color="green">Create</Button>
        </Group>

    </Modal>
};
