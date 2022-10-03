import { app, ipcMain, dialog } from "electron";
import { createWindow } from "./helpers";
import { IPCMainHandler, MainWindow } from "./ipc/handle";
import serve from "electron-serve";
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", (evt) => {
    app.removeAllListeners();
    app.quit();
  });

  MainWindow(mainWindow);
})();

app.on("window-all-closed", () => {
  app.removeAllListeners();
  app.quit();
});

IPCMainHandler(ipcMain, dialog);
