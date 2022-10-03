import { Company } from "../../entity/company";
import { DataBook } from "../../entity/databook";
import { Constants } from "../../helpers/constants";
import { GenerateProperties } from "../../entity/generateProperties";
import { IPCRendererHandler } from "../../ipc/handle";

let PREV_PROGRESS = 0;
export let MAX_PROGRESS = 20;

/**
 * Convert data book to total transaction excel
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
  let counterObj = {
    totalProductQty: 0,
    totalProductDiscount: 0,
    totalPayment: 0,
    totalTaxBasis: 0,
    totalVAT: 0,
  };
  PREV_PROGRESS = previousProgress;

  let sheetJson = [...dataBook.data.entries()].map((data, index) => {
    const currentProgress = Math.floor(
      ((index + 1) / dataBook.data.size / MAX_PROGRESS) * 100
    );
    IPCRendererHandler().sendProgress(
      currentProgress + PREV_PROGRESS,
      100,
      `Menulis file transaksi pelanggan ke ${index + 1} dari ${
        dataBook.data.size
      }`
    );

    counterObj.totalProductQty += data[1].totalProductQty;
    counterObj.totalProductDiscount += data[1].totalProductDiscount;
    counterObj.totalPayment += data[1].totalPayment;
    counterObj.totalTaxBasis += data[1].totalTaxBasis;
    counterObj.totalVAT += data[1].totalVAT;
    return {
      A: index + 1,
      B: data[1].name,
      C: data[1].totalProductQty,
      D: data[1].totalProductDiscount,
      E: data[1].totalPayment,
      F: data[1].totalTaxBasis,
      G: data[1].totalVAT,
      H: data[1].faktur,
    };
  });
  sheetJson.unshift(Constants.excelHeader.totalTransaction);
  sheetJson.unshift(
    ...[
      { A: "Total Produk Pembelian", B: counterObj.totalProductQty0 },
      { A: "Total Produk Diskon", B: counterObj.totalProductDiscount },
      { A: "Total Pembayaran", B: counterObj.totalPayment },
      { A: "Total Dasar Pengenaan Pajak", B: counterObj.totalTaxBasis },
      { A: "Total Pajak Pertambahan Nilai", B: counterObj.totalVAT },
    ]
  );

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

  const sheetName = "total transaction data";
  multiDataWb.SheetNames.push(sheetName);
  multiDataWb.Sheets[sheetName] = XLSX.utils.json_to_sheet(sheetJson, {
    skipHeader: true,
  });

  XLSX.writeFile(multiDataWb, outputFolder + "/total transaction.xlsx");
  return { status: true, PREV_PROGRESS: MAX_PROGRESS + PREV_PROGRESS };
};
