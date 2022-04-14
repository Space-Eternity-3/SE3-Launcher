import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <MantineProvider theme={{ colorScheme: "dark" }}>
            <NotificationsProvider position="bottom-left">
                <App />
            </NotificationsProvider>
        </MantineProvider>
    </React.StrictMode>
);
