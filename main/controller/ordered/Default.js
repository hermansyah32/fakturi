import { Company } from "../../entity/company";
import { DataBook } from "../../entity/databook";
import { Constants } from "../../helpers/constants";
import { GenerateProperties } from "../../entity/generateProperties";
import { IPCRendererHandler } from "../../ipc/handle";

let PREV_PROGRESS = 0;
export let MAX_PROGRESS = 20;

/**
 * Convert data book to ordered excel
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {GenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} previousProgress Previous progress
 */
export const convert = (
  dataBook,
  company,
  properties,
  outputFolder,
  previousProgress
) => {
  let num = 1;
  let sheetJson = [];
  PREV_PROGRESS = previousProgress;
  dataBook.data.forEach((dataCustomer) => {
    const currentProgress = Math.floor(
      (num / dataBook.data.size / MAX_PROGRESS) * 100
    );
    IPCRendererHandler().sendProgress(
      currentProgress + PREV_PROGRESS,
      100,
      `Menulis file pengurutan pelanggan ke ${num + 1} dari ${
        dataBook.data.size
      }`
    );

    sheetJson.push(
      ...dataCustomer.items.map((item) => {
        return {
          A: num,
          B: dataCustomer.name,
          C: item.productName,
          D: item.productCode,
          E: item.date,
          F: item.productPrice,
          G: item.priceTaxBasis,
          H: item.productQty,
          I: item.productDiscount,
          J: item.payment,
          K: item.taxBasis,
          L: item.VAT,
          M: item.faktur,
        };
      })
    );
    num++;
  });
  sheetJson.unshift(Constants.excelHeader.ordered);

  return writeToExcel(sheetJson, outputFolder);
};

/**
 * Write sheet json to excel file
 * @param {object[]} sheetJson Sheet json
 * @param {string} outputFolder Output folder
 */
export const writeToExcel = async (sheetJson, outputFolder) => {
  const XLSX = require("xlsx");

  const multiDataWb = XLSX.utils.book_new();

  const sheetName = "ordered data";
  multiDataWb.SheetNames.push(sheetName);
  multiDataWb.Sheets[sheetName] = XLSX.utils.json_to_sheet(sheetJson, {
    skipHeader: true,
  });

  XLSX.writeFile(multiDataWb, outputFolder + "/ordered.xlsx");
  return { status: true, PREV_PROGRESS: MAX_PROGRESS + PREV_PROGRESS };
};
