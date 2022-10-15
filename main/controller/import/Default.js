import dayjs from "dayjs";
import { DataBook } from "../../entity/databook";
import { Constants } from "../../helpers/constants";
import { Transform } from "../../helpers/transformer";
import { IPCRendererHandler } from "../../ipc/handle";
import { Company } from "../../entity/company";
import { GenerateProperties } from "../../entity/generateProperties";

let PREV_PROGRESS = 0;
export let MAX_PROGRESS = 10;

/**
 * Convert data book to import excel
 * @param {DataBook} dataBook Ordered Data book customer
 * @param {Company} company Current company
 * @param {GenerateProperties} properties Generate properties
 * @param {string} outputFolder Output folder
 * @param {number} previousProgress Previous progress
 */
const convert = (
  dataBook,
  company,
  properties,
  outputFolder,
  previousProgress
) => {
  let sheetJson = [];
  let index = 0;
  PREV_PROGRESS = previousProgress;
  sheetJson.push(...Constants.excelHeader.import);

  //
  for (const [custName, dataCustomer] of dataBook.data) {
    if (dataCustomer.faktur === "") break;
    const currentProgress = Math.floor(
      ((index + 1) / properties.faktur.length / MAX_PROGRESS) * 100
    );
    IPCRendererHandler().sendProgress(
      currentProgress + PREV_PROGRESS,
      100,
      `Menulis file import pelanggan ke ${index + 1} dari ${
        properties.faktur.length
      }`
    );

    sheetJson.push({
      A: "FK",
      B: properties.fakturCode,
      C: "0",
      D: dataCustomer.faktur,
      E: properties.month,
      F: properties.year,
      G: dayjs(properties.date, "YYYY/MM/DD").format("DD/MM/YYYY"),
      H: dataCustomer.taxIdentity ?? "000000000000000",
      I: !dataCustomer.nationalIdentity
        ? dataCustomer.name
        : `${dataCustomer.nationalIdentity}#NIK#NAMA#${dataCustomer.name}`,
      J: dataCustomer.address ?? "-",
      K: Math.floor(dataCustomer.totalTaxBasis, 1, 2),
      L: Math.floor(dataCustomer.totalVAT, 1, 2),
      M: 0,
      N: 0,
      O: 0,
      P: 0,
      Q: 0,
      R: 0,
    });
    // TODO: company turn to object
    sheetJson.push({
      A: "FAPR",
      B: company.Name,
      C: company.Address,
    });
    sheetJson.push(
      ...dataCustomer.items.map((item) => {
        return {
          A: "OF",
          B: item.productCode,
          C: item.productName,
          D: Transform.number.zpadrange(item.productPrice, 1, 2),
          E: Transform.number.zpadrange(item.productQty, 1, 2),
          F: Transform.number.zpadrange(item.payment, 1, 2),
          G: Transform.number.zpadrange(item.productDiscount, 1, 2),
          H: Transform.number.zpadrange(item.taxBasis, 1, 2),
          I: Transform.number.zpadrange(item.VAT, 1, 2),
          J: 0,
          K: Transform.number.zpad(0, 1),
        };
      })
    );
    index++;
  }

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

  const sheetName = "import data";
  multiDataWb.SheetNames.push(sheetName);
  multiDataWb.Sheets[sheetName] = XLSX.utils.json_to_sheet(sheetJson, {
    skipHeader: true,
  });

  XLSX.writeFile(multiDataWb, outputFolder + "/import.xlsx");
  XLSX.writeFile(multiDataWb, outputFolder + "/import.csv", {
    bookType: "csv",
  });
  return { status: true, PREV_PROGRESS: MAX_PROGRESS + PREV_PROGRESS };
};

export { convert, writeToExcel };
