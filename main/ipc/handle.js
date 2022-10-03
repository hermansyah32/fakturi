// import { LocalConfig } from "../helpers/configuration-common";
import { LocalConfig } from "../helpers/configuration-common";
import * as Generator from "../controller/generate";

let generatePromise = null;
let mainWindow = null;

export const GenerateProcess = (promise) => {
  generatePromise = promise;
};

export const MainWindow = (window) => {
  mainWindow = window;
};

export const IPCMainHandler = (ipcMain, dialog) => {
  const localConfiguration = LocalConfig();
  ipcMain.handle("getAllConfig", async (event, data) => {
    return localConfiguration.get("all");
  });

  ipcMain.handle("setConfig", async (event, data) => {
    localConfiguration.set(data.name, data.value);
  });

  ipcMain.handle("resetConfig", async (event, data) => {
    localConfiguration.setToDefault();
  });

  /**
   * Browse For File
   */
  ipcMain.handle("browseForFile", async (event, data) => {
    const filters = [{ name: "Microsoft Excel", extensions: ["xls", "xlsx"] }];
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: filters,
    });
    return result.canceled ? { status: false } : { status: true, data: result };
  });

  /**
   * Browse For Folder
   */
  ipcMain.handle("browseForFolder", async (event, data) => {
    const result = await dialog.showOpenDialog({
      properties: ["createDirectory", "openDirectory"],
      defaultPath: localConfiguration.get("configOutput"),
    });
    return result.canceled ? { status: false } : { status: true, data: result };
  });

  /**
   * Generate Import Invoice
   */
  ipcMain.handle("generateProcess", async (event, data) => {
    const generateProp = data;

    try {
      const generate = await Generator.preparationData(generateProp);
      const processData = await Generator.processDataBook(
        generate.sheetRow,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      const processCounted = await Generator.processCounted(
        processData.dataBook,
        generate.company,
        generate.properties,
        generate.outputFolder,
        processData.PREV_PROGRESS
      );
      const processOrdered = await Generator.processOrdered(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder,
        processCounted.PREV_PROGRESS
      );
      const processTransaction = await Generator.processTransaction(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder,
        processOrdered.PREV_PROGRESS
      );
      const processImport = await Generator.processImport(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder,
        processTransaction.PREV_PROGRESS
      );
      const processInvoice = await Generator.processInvoice(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder,
        processImport.PREV_PROGRESS
      );
      IPCRendererHandler().sendProgress(100, 100, `Selesai`);
    } catch (error) {
      console.log("error :>> ", error);
      // TODO: log here
      IPCRendererHandler().sendProgress(
        100,
        100,
        `Terjadi kesalahan: ${error.message}`
      );
    }
  });

  /**
   * Generate Cancel
   */
  ipcMain.handle("generateCancel", async (event, data) => {
    generatePromise.cancel();
  });
};

export const IPCRendererHandler = () => {
  return {
    /**
     * Send generate progress to renderer
     *
     * @param {Number} progress
     * @param {String} message
     * @param {any} data
     */
    sendProgress: async (progress, maxProgress, message, data = []) => {
      if (!mainWindow) return;
      mainWindow.webContents.send("generateProgress", {
        progress: progress,
        maxProgress: maxProgress,
        message: message,
        data: data,
      });
    },
    /**
     * Send message to renderer
     *
     * @param {String} message
     * @param {any} data
     */
    sendMessage: async (message, data = []) => {
      if (!mainWindow) return;
      mainWindow.webContents.send("messenger", {
        message: message,
        data: data,
      });
    },
    /**
     * send alert message to current page
     */
    sendAlert: async (message, data = []) => {
      if (!mainWindow) return;
      mainWindow.webContents.send("alertMessenger", {
        message: message,
        data: data,
      });
    },
  };
};
