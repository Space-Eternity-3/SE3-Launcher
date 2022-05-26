import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

ReactDOM.render(
    <React.StrictMode>
        <MantineProvider theme={{ colorScheme: "dark" }}>
            <ModalsProvider>
                <NotificationsProvider zIndex={999} position="bottom-left">
                    <App />
                </NotificationsProvider>
            </ModalsProvider>
        </MantineProvider>
    </React.StrictMode>,
    document.getElementById("root")
);
