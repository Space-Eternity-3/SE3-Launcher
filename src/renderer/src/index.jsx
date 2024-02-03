import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="dark">
            <Notifications zIndex={998} position="bottom-left" />
            <ModalsProvider>
                <App />
            </ModalsProvider>
        </MantineProvider>
    </React.StrictMode>,
);
