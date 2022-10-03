import { Transform } from "../../helpers/transformer";
import { DataBook } from "../../entity/databook";
import { Constants } from "../../helpers/constants";
import { IPCRendererHandler } from "../../ipc/handle";
import { Company } from "../../entity/company";
import { GenerateProperties } from "../../entity/generateProperties";

let PREV_PROGRESS = 0;
export let MAX_PROGRESS = 20;

/**
 * Convert data book to counted excel
 * @param {DataBook} dataBook Data book customer
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
  let index = 0;
  let sheetJson = [];
  PREV_PROGRESS = previousProgress;
  dataBook.data.forEach((dataCustomer) => {
    sheetJson[index] = dataCustomer.items.map((item, num) => {
      return {
        A: num + 1,
        B: item.productName,
        C: item.productCode,
        D: item.date,
        E: item.productPrice,
        F: item.priceTaxBasis,
        G: item.productQty,
        H: item.productDiscount,
        I: item.payment,
        J: item.taxBasis,
        K: item.VAT,
      };
    });
    sheetJson[index].unshift(Constants.excelHeader.counted);
    // add excel description
    sheetJson[index].unshift(
      ...[
        { A: "Nama", B: dataCustomer.name },
        { A: "NIk", B: dataCustomer.nationalIdentity },
        { A: "NPWP", B: dataCustomer.taxIdentity },
        { A: "Referensi", B: dataCustomer.reference },
        { A: "Total Permbayaran", B: dataCustomer.totalPayment },
        { A: "Total Penjualan", B: dataCustomer.totalProductQty },
        { A: "Total Dasar Pengenaan Pajak", B: dataCustomer.totalTaxBasis },
        { A: "Total Pajak Pertambahan Nilai", B: dataCustomer.totalVAT },
      ]
    );
    index++;
  });
  
  return writeToExcel(sheetJson, outputFolder);
};

/**
 * Write sheet json to excel file
 * @param {object[]} sheetJson Sheet json
 * @param {string} outputFolder Output folder 
 */
const writeToExcel = async (sheetJson, outputFolder) => {
  const XLSX = require("xlsx");
  const multiDataWb = XLSX.utils.book_new();

  sheetJson.forEach((dataCustomer, index) => {
    const currentProgress = Math.floor(
      ((index + 1) / sheetJson.length / MAX_PROGRESS) * 100
    );
    IPCRendererHandler().sendProgress(
      currentProgress + PREV_PROGRESS,
      100,
      `Menulis data pelanggan ke ${index + 1} dari ${sheetJson.length}`
    );

    // console.log('dataCustomer[0] :>> ', dataCustomer);
    const safeCustName = Transform.sheet.safeValue(dataCustomer[0].B);
    multiDataWb.SheetNames.push(safeCustName);
    multiDataWb.Sheets[safeCustName] = XLSX.utils.json_to_sheet(dataCustomer, {
      skipHeader: true,
    });

    const singleDataWb = XLSX.utils.book_new();
    singleDataWb.SheetNames.push(safeCustName);
    singleDataWb.Sheets[safeCustName] = XLSX.utils.json_to_sheet(dataCustomer, {
      skipHeader: true,
    });

    XLSX.writeFile(
      singleDataWb,
      outputFolder + "/counted/" + safeCustName + ".xlsx"
    );
  });
  XLSX.writeFile(multiDataWb, outputFolder + "/counted.xlsx");
  return { status: true, PREV_PROGRESS: MAX_PROGRESS + PREV_PROGRESS };
};

export { convert, writeToExcel };
