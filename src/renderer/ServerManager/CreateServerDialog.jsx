import { ActionIcon, Button, Group, Modal, Select, Space, Text, TextInput } from "@mantine/core";
import { IconFolder, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import ServerConfig from "./CreateServerDialog/ServerConfig";
import { SelectDirectory } from "../SE3Api/dialog";

const generatePassword = (length = 20, wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') =>
    Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => wishlist[x % wishlist.length])
        .join('')

export function CreateServerDialog({ visible, serverVersions, onCancel }) {
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [adminPassword, setAdminPassword] = useState("");
    const [serverDirectory, setServerDirectory] = useState("");
    const [currentConfig, setCurrentConfig] = useState({});

    function setRandomPassword() {
        setAdminPassword(generatePassword(20));
        console.log(currentConfig);
    }

    function selectServerDirectory() {
        const directory = SelectDirectory();
        if (directory) {
            setServerDirectory(directory);
        }
    }

    function installNodeJsInternal(runtimeVersion) {
        return new Promise((resolve, reject) => {
            window.se3Api.InstallNodeJs(runtimeVersion, {
                finish: () => {
                    resolve();
                },
                error: (err) => {
                    reject();
                },
            });
        });
    }

    async function createServer() {
        const server = serverVersions.find(version => version.version === selectedVersion);

        await installNodeJsInternal(server.runtimeVersion);
    }

    return <Modal size="lg" opened={visible} onClose={onCancel} centered title="Create server">
        <Group grow position="center">
            <TextInput
                placeholder="My Great Server!"
                label="Server name"
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
            <Button onClick={createServer} color="green">Create</Button>
        </Group>

    </Modal>
};
