import { DataBook } from "../../entity/databook";
import { Transform } from "../../helpers/transformer";
import { writeFileSync } from "fs";
import * as Template from "../../../constants/template";
import dayjs from "dayjs";
import { LocalConfig } from "../../helpers/configuration-common";
import { BrowserWindow } from "electron";
import { IPCRendererHandler } from "../../ipc/handle";
import { Company } from "../../entity/company";
import { GenerateProperties } from "../../entity/generateProperties";

let PREV_PROGRESS = 0;
export let MAX_PROGRESS = 10;

/**
 * Convert data book to invoice html and pdf
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {GenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} previousProgress Previous progress
 */
const convert = async (
  dataBook,
  company,
  properties,
  outputFolder,
  previousProgress
) => {
  const localConfiguration = LocalConfig();
  let pdfMaker = {}; // puppeteer or browser window
  PREV_PROGRESS = previousProgress;
  if (BrowserWindow === undefined) {
    const puppeteer = require("puppeteer");
    pdfMaker.browser = await puppeteer.launch({ headless: true });
    pdfMaker.page = await pdfMaker.browser.newPage();
  } else {
    pdfMaker = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: true },
    });
  }

  let baseTemplate = Template.get();
  const placement = new Template.Placement();
  // set placement
  placement.COMPANY_NAME = localConfiguration.get("companyName");
  placement.COMPANY_ADDRESS = localConfiguration.get("companyAddress");
  placement.COMPANY_DIRECTOR = localConfiguration.get("companyDirector");
  placement.BANK_ACCOUNT = localConfiguration.get("bankAccount");
  placement.BANK_NAME = localConfiguration.get("bankName");
  placement.TAX_TARIFF = localConfiguration.get("taxTariff");
  placement.INVOICE_MONTH = properties.month;
  placement.INVOICE_YEAR = properties.year;
  placement.INVOICE_DATE = dayjs(properties.date, "YYYY/MM/DD").format(
    "DD-MM-YYYY"
  );

  let invoiceNumber = properties.invoice;
  try {
    for (const [custName, dataCustomer] of dataBook.data) {
      const tempPlaceMent = { ...placement };
      let baseHtml = baseTemplate.baseHtml.slice();

      tempPlaceMent.INVOICE_NUMBER = invoiceNumber;
      tempPlaceMent.CLIENT_NAME = dataCustomer.name;
      tempPlaceMent.CLIENT_ADDRESS = dataCustomer.address;
      tempPlaceMent.TOTAL_PAYMENT = Transform.number.thousand(
        dataCustomer.totalPayment
      );
      tempPlaceMent.TOTAL_PAYMENT_WORD = Transform.currency
        .ToWords(dataCustomer.totalPayment)
        .toUpperCase();
      tempPlaceMent.TOTAL_TAX_BASIS = Transform.number.thousand(
        dataCustomer.totalTaxBasis
      );
      tempPlaceMent.TOTAL_VAT = Transform.number.thousand(
        dataCustomer.totalVAT
      );

      dataCustomer.items.forEach((customerItem) => {
        const placementItem = new Template.PlacementItem();
        let baseHtmlRow = baseTemplate.baseHtmlRow.slice();
        placementItem.PRODUCT_NAME = `${customerItem.productName}`;
        placementItem.PRODUCT_QTY = Transform.number.thousand(
          customerItem.productQty
        );
        placementItem.PRODUCT_PRICE = Transform.number.thousand(
          customerItem.productPrice
        );
        placementItem.PAYMENT = Transform.number.thousand(customerItem.payment);

        Object.keys(placementItem).forEach((key) => {
          baseHtmlRow = baseHtmlRow.replace(
            new RegExp(`{${key}}`, "g"),
            placementItem[key]
          );
        });
        tempPlaceMent.ITEMS += baseHtmlRow + "\n";
      });
      Object.keys(tempPlaceMent).forEach((key) => {
        baseHtml = baseHtml.replace(
          new RegExp(`{${key}}`, "g"),
          tempPlaceMent[key]
        );
      });
      const currentProgress = Math.floor(
        (invoiceNumber / dataBook.data.size / MAX_PROGRESS) * 100
      );
      IPCRendererHandler().sendProgress(
        currentProgress + PREV_PROGRESS,
        100,
        `Menulis invoice pelanggan ke ${invoiceNumber} dari ${dataBook.data.size}`
      );

      writeToHtml(
        baseHtml,
        outputFolder + `/invoice-html/${tempPlaceMent.CLIENT_NAME}.html`
      );
      if (pdfMaker.browser !== undefined) {
        await writeToPdfPup(
          baseHtml,
          outputFolder + `/invoice-pdf/${tempPlaceMent.CLIENT_NAME}.pdf`,
          pdfMaker.page
        );
      } else {
        await writeToPdfBw(
          outputFolder + `/invoice-html/${tempPlaceMent.CLIENT_NAME}.html`,
          outputFolder + `/invoice-pdf/${tempPlaceMent.CLIENT_NAME}.pdf`,
          pdfMaker
        );
      }
      invoiceNumber++;
    }
  } catch (error) {
    //TODO: error log here
    if (pdfMaker?.browser !== undefined) {
      await pdfMaker.browser.close();
    } else {
      pdfMaker.close();
    }
    throw error;
  }

  if (pdfMaker?.browser !== undefined) {
    await pdfMaker.browser.close();
  } else {
    pdfMaker.close();
  }
  return { status: true, PREV_PROGRESS: MAX_PROGRESS + PREV_PROGRESS };
};

/**
 * Write HTML string file
 * @param {string} content Invoice HTML string
 * @param {string} outputFile Output pdf file
 */
const writeToHtml = (content, outputFile) => {
  try {
    writeFileSync(outputFile, content);
  } catch (error) {
    throw error;
  }
};

/**
 * Convert HTML string to PDF File using Browser Window
 * @param {string} htmlFile Invoice HTML file
 * @param {string} outputFile Output pdf file
 * @param {BrowserWindow} pdfWindow Browser Window
 */
const writeToPdfBw = async (htmlFile, outputFile, pdfWindow) => {
  const pdfOptions = {
    marginsType: 0,
    pageSize: "A4",
    printBackground: true,
    printSelectionOnly: false,
    landscape: false,
  };

  await pdfWindow.loadFile(htmlFile);
  const pdfData = await pdfWindow.webContents.printToPDF(pdfOptions);
  writeFileSync(outputFile, pdfData);
  return;
};

/**
 * Convert HTML string to PDF File using Puppeteer
 * @param {string} content Invoice HTML string
 * @param {string} outputFile Output pdf file
 * @param {*} page Puppeteer page
 */
const writeToPdfPup = async (content, outputFile, page) => {
  await page.setContent(content);
  return page.pdf({ path: outputFile, format: "a4" });
};

/**
 * Convert HTML string to PDF File
 * @param {string} content Invoice HTML string
 * @param {string} outputFile Output pdf file
 */
const writeToPdf = (content, outputFile) => {
  const pdf = require("html-pdf");
  const pdfOptions = {
    format: "A4",
    directory: "D:\\tmp",
    timeout: 540000,
  };
  const runtimeOpts = {
    timeoutSeconds: 300, // in seconds
    memory: "1GB",
  };
  const promise = new Promise((resolve, reject) => {
    pdf.create(content, pdfOptions).toFile(outputFile, (err, res) => {
      if (err) {
        // TODO: Log error generate pdf
        reject(err);
      }
      resolve(true);
    });
  });
  return promise;
};

export { convert };
