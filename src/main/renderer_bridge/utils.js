import { ipcMain, shell } from "electron";
import IpcMessages from "../../common/IpcMessages";

ipcMain.handle(IpcMessages.UTILS.OPEN_EXTERNAL, async(e, href) => {
    if (!["https:", "http:"].includes(new URL(href).protocol)) return;
    shell.openExternal(href);
});