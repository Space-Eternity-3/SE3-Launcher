import { Accordion, ActionIcon, Button, Card, Group, Modal, NumberInput, Select, Space, Tabs, Text, TextInput, Title } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const generatePassword = (length = 20, wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') =>
    Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => wishlist[x % wishlist.length])
        .join('')

export function CreateServerDialog({ visible, serverVersions, onCancel }) {
    const [adminPassword, setAdminPassword] = useState("");
    const [serverPort, setServerPort] = useState(27683);

    function setRandomPassword() {
        setAdminPassword(generatePassword(20));
    }

    return <Modal size="lg" opened={visible} onClose={onCancel} centered title="Create server">
        <Group grow position="center">
            <TextInput
                placeholder="My Great Server!"
                label="Server name"
                withAsterisk
            />
            <Select
                label="Server version"
                placeholder="Pick one"
                searchable
                withAsterisk
                nothingFound="No options"
                data={serverVersions.map(version => {
                    return {
                        label: version.name,
                        value: version.tag
                    };
                })}
            />
        </Group>
        <Space h="sm" />
        <TextInput
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            placeholder="Enter a password..."
            label="Admin password"
            withAsterisk
            rightSection={<ActionIcon title="Generate random password..." onClick={setRandomPassword}>
                <IconRefresh size="1.125rem" />
            </ActionIcon>}
        />
        <Space h="sm" />
        <NumberInput
            min={0}
            max={65353}
            placeholder="27683"
            label="Server port"
            withAsterisk
        />


        <Space h="xl" />
        <Group position="apart">
            <Button color="green">Create</Button>
        </Group>
    </Modal>
};