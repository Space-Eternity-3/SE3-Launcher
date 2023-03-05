import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: "dark" }}>
            <ModalsProvider>
                <Notifications zIndex={998} position="bottom-left" />
                <App />
            </ModalsProvider>
        </MantineProvider>
    </React.StrictMode>
);
