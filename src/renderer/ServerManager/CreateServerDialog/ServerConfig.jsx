import { NumberInput, Space, Switch } from "@mantine/core";
import { useState } from "react";

function ConfigNumber({ configValue, onChange }) {
    const [value, setValue] = useState(configValue.default_value);

    function updateValue(e) {
        onChange?.(configValue.id, e);
        setValue(e);
    }

    return <NumberInput
        label={configValue.name}
        min={configValue.min}
        max={configValue.max}
        description={configValue.notes}
        value={value}
        onChange={updateValue}
    />
};

function ConfigBoolean({ configValue, onChange  }) {
    const [value, setValue] = useState(configValue.default_value);

    function updateValue(e) {
        onChange?.(configValue.id, e.currentTarget.checked);
        setValue(e.currentTarget.checked);
    }

    return <Switch
        label={configValue.name}
        labelPosition="left"
        checked={value}
        onChange={updateValue}
    />
};

export default function ServerConfig({ configValues }) {
    return <>
        {/* eslint-disable-next-line */}
        {configValues?.map(configValue => {
            switch (configValue.type) {
                case "number":
                    return <div key={configValue.id}>
                        <ConfigNumber configValue={configValue} />
                        <Space h="sm" />
                    </div>
                case "boolean":
                    return <div key={configValue.id}>
                        <ConfigBoolean configValue={configValue} />
                        <Space h="sm" />
                    </div>
                default:
                    break;
            }
        })}
    </>
};
