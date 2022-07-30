import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <MantineProvider theme={{ colorScheme: "dark" }}>
            <ModalsProvider>
                <NotificationsProvider zIndex={998} position="bottom-left">
                    <App />
                </NotificationsProvider>
            </ModalsProvider>
        </MantineProvider>
    </React.StrictMode>
);
