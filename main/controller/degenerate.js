import { CPromise } from "c-promise2";
import { createReadStream, existsSync } from "fs";
import { GenerateProcess } from "../ipc/handle";
import { LocalConfig } from "../helpers/configuration-common";
import path from "path";
import { Company } from "../entity/company";
import { DegenerateProperties } from "../entity/degenerateProperties";
import { DataBook } from "../entity/databook";

export let isRunning = false;

/**
 * Read excel file and create preparation data
 * @param {DegenerateProperties} properties Generate properties
 */
export const preparationData = (properties) => {
  let buffers = [];
  const localConfiguration = LocalConfig();
  isRunning = true;

  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));
    const reader = createReadStream(properties.file, {
      flags: "r",
      autoClose: true,
      emitClose: true,
    });

    reader.on("data", (data) => {
      if (isRunning) {
        buffers.push(data);
      }
    });

    reader.on("end", () => {
      const buffer = Buffer.concat(buffers);
      const XLSX = require("xlsx-js-style");
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // set or get company
      const company = new Company();
      company.Name = localConfiguration.get("companyName");
      company.Code = "bdb";
      company.taxIdentity = localConfiguration.get("companyTaxIdentity");
      company.Location = localConfiguration.get("companyLocation");
      company.Address = localConfiguration.get("companyAddress");
      company.Alias = "";
      company.Suffix = "";
      company.Class = "CompanyA";
      company.Counted = "Default";
      company.Invoice = "Default";
      company.Ordered = "Default";
      company.Transaction = "Default";
      company.Degenerator = "Default";
      company.Import = "Default";

      let sheet = workbook.Sheets[workbook.SheetNames[0]]; // always read first worksheet
      if (sheet === undefined) throw new Error("Worksheet tidak ditemukan");
      const tempSheet = XLSX.utils.sheet_to_json(sheet, {
        header: "A",
        blankrows: true,
      });
      // output folder preparation
      const year = properties.year ?? "_allyear_";
      const month = properties.month ?? "_allmonth_";
      let baseOutput = path.join(
        localConfiguration.get("configOutput"),
        "degenerator",
        company.Location,
        year,
        month
      );
      try {
        if (existsSync(baseOutput)) {
          let index = 1;
          while (existsSync(baseOutput + " Copy of " + index)) {
            index++;
          }
          baseOutput = baseOutput + " Copy of " + index;
        }
        baseOutput = path.resolve(baseOutput);
      } catch (error) {
        reject(error);
      }
      resolve({
        status: true,
        sheetRow: tempSheet,
        properties: properties,
        outputFolder: baseOutput,
        company: company,
      });
    });

    reader.on("error", (err) => {
      // TODO: create log here
      reject({
        status: false,
        error: err.message,
      });
    });

    onCancel(() => {
      isRunning = false;
      reader.destroy();
    });
  });

  GenerateProcess(promise);
  return promise;
};

/**
 * Generate DataBook and ordered DataBook
 * @param {object[]} sheetRow Excel sheet rows
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 */
export const processDataBook = async (
  sheetRow,
  company,
  properties,
  outputFolder
) => {
  let classController;
  if (!isRunning) return;
  try {
    classController = await import(
      `../controller/degenerator/${company.Degenerator}`
    );
  } catch (error) {
    // TODO: create log here
    throw error;
  }

  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));

    resolve(
      classController.calculate(sheetRow, company, properties, outputFolder)
    );
  });
  GenerateProcess(promise);
  return promise;
};

/**
 * Convert data book to counted excel
 * @param {DataBook} dataBook Customer DataBook
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 * @param {String} outputFolder Output folder
 * @param {number} PREV_PROGRESS Previous progress
 */
export const processCounted = async (
  dataBook,
  company,
  properties,
  outputFolder,
  PREV_PROGRESS = 0
) => {
  let countedControllers;
  if (!isRunning) return;
  try {
    countedControllers = await import(
      `../controller/counted/${company.Counted}`
    );
  } catch (error) {
    // TODO: create log here
    throw error;
  }

  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));
    resolve(
      countedControllers.convert(
        dataBook,
        company,
        properties,
        outputFolder,
        PREV_PROGRESS
      )
    );
  });
  GenerateProcess(promise);
  return promise;
};

/**
 * Convert data book to ordered excel
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} PREV_PROGRESS Previous progress
 */
export const processOrdered = async (
  dataBook,
  company,
  properties,
  outputFolder,
  PREV_PROGRESS = 0
) => {
  let orderedController;
  if (!isRunning) return;
  try {
    orderedController = await import(
      `../controller/ordered/${company.Ordered}`
    );
  } catch (error) {
    // TODO: create log here
    throw error;
  }
  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));
    resolve(
      orderedController.convert(
        dataBook,
        company,
        properties,
        outputFolder,
        PREV_PROGRESS
      )
    );
  });
  GenerateProcess(promise);
  return promise;
};

/**
 * Convert data book to total transaction excel
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} PREV_PROGRESS Previous progress
 */
export const processTransaction = async (
  dataBook,
  company,
  properties,
  outputFolder,
  PREV_PROGRESS = 0
) => {
  let transactionController;
  if (!isRunning) return;
  try {
    transactionController = await import(
      `../controller/totaltransaction/${company.Transaction}`
    );
  } catch (error) {
    // TODO: create log here
    throw error;
  }
  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));
    resolve(
      transactionController.convert(
        dataBook,
        company,
        properties,
        outputFolder,
        PREV_PROGRESS
      )
    );
  });
  GenerateProcess(promise);
  return promise;
};

/**
 * Convert data book to import excel
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} PREV_PROGRESS Previous progress
 */
export const processImport = async (
  dataBook,
  company,
  properties,
  outputFolder,
  PREV_PROGRESS = 0
) => {
  let importController;
  if (!isRunning) return;
  try {
    importController = await import(`../controller/import/${company.Import}`);
  } catch (error) {
    // TODO: create log here
    throw error;
  }
  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));
    resolve(
      importController.convert(
        dataBook,
        company,
        properties,
        outputFolder,
        PREV_PROGRESS
      )
    );
  });
  GenerateProcess(promise);
  return promise;
};

/**
 * Convert data book to invoice
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} PREV_PROGRESS Previous progress
 */
export const processInvoice = async (
  dataBook,
  company,
  properties,
  outputFolder,
  PREV_PROGRESS = 0
) => {
  let invoiceController;
  if (!isRunning) return;
  try {
    invoiceController = await import(
      `../controller/invoice/${company.Invoice}`
    );
  } catch (error) {
    // TODO: create log here
    throw error;
  }
  const promise = new CPromise((resolve, reject, { onCancel }) => {
    onCancel(() => (isRunning = false));
    resolve(
      invoiceController.convert(
        dataBook,
        company,
        properties,
        outputFolder,
        PREV_PROGRESS
      )
    );
  });
  GenerateProcess(promise);
  return promise;
};
