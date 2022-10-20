import { Company } from "../../entity/company";
import { DegenerateProperties } from "../../entity/degenerateProperties";
import { DataBook, DataCustomer, CustomerItem } from "../../entity/databook";
import { IPCRendererHandler } from "../../ipc/handle";
import { Transform } from "../../helpers/transformer";
import { LocalConfig } from "../../helpers/configuration-common";
import dayjs from "dayjs";

export let MAX_PROGRESS = 30;

/**
 * Check if month valid
 * @param {Number|null} month Month in sheet row.
 * @param {Number|null} monthProp Month in properties.
 * @returns {bool}
 */
const isValidMonth = (month, monthProp) => {
  if (!month) return false; // month in sheet row can't be null
  if (!monthProp) return true;
  if (month === monthProp) return true;
  return false;
};

/**
 * Check if year valid
 * @param {Number|null} year Year in sheet row.
 * @param {Number|null} yearProp Year in properties.
 * @returns {bool}
 */
const isValidYear = (year, yearProp) => {
  if (!year) return false; // year in sheet row can't be null
  if (!yearProp) return true;
  if (year === yearProp) return true;
  return false;
};

/**
 * Check if excel row is data
 * @param {object} sheetRow Excel row
 * @returns
 */
const isValidCustItem = (sheetRow, month, year) => {
  if (sheetRow.A === "OF") return true;
  if (sheetRow.A !== "FK") return false;
  if (
    isValidMonth(Transform.sheet.cellNumber(sheetRow.E), month) &&
    isValidYear(Transform.sheet.cellNumber(sheetRow.F), year)
  ) {
    return true;
  }

  return false;
};

/**
 * Verify number property from customer item
 * @param {CustomerItem} custItem Current customer item
 * @returns {true|string} Return true if everything valid. Return string of invalid property name
 */
const verifyDataNumber = (custItem) => {
  let result = true;
  const tempCustItem = {
    productQty: custItem.productQty,
    productPrice: custItem.productPrice,
    productDiscount: custItem.productDiscount,
    priceTaxBasis: custItem.priceTaxBasis,
    payment: custItem.payment,
    taxBasis: custItem.taxBasis,
    VAT: custItem.VAT,
  };
  Object.keys(tempCustItem).forEach((key) => {
    if (isNaN(tempCustItem[key]) && result === true) {
      result = key;
    }
  });
  return result;
};

/**
 * Generate DataBook and ordered DataBook
 *
 * @param {object[]} sheetRows Excel sheet rows
 * @param {Company} company Current company
 * @param {DegenerateProperties} properties Generate properties
 */
export const calculate = async (
  sheetRows,
  company,
  properties,
  outputFolder
) => {
  const path = require("path");
  const { mkdirSync } = require("fs");
  try {
    mkdirSync(outputFolder, { recursive: true });
    // create subfolder counted, invoice-html, invoice-pdf
    mkdirSync(path.join(outputFolder, "counted"), { recursive: true });
    mkdirSync(path.join(outputFolder, "invoice-html"), { recursive: true });
    mkdirSync(path.join(outputFolder, "invoice-pdf"), { recursive: true });
  } catch (error) {
    throw new Error("Inaccessible output directory in " + outputFolder);
  }

  const countedDataBook = new DataBook();
  const localConfiguration = LocalConfig();
  const isPriceIncludeTaxed = true; // if price item already taxed, then set true else false.
  let lastCustomer = "";
  let lastDate = "";
  let lastAddress = "";

  sheetRows.forEach((row, index) => {
    const currentProgress = Math.floor(
      ((index + 1) / sheetRows.length / MAX_PROGRESS) * 100
    );
    IPCRendererHandler().sendProgress(
      currentProgress,
      100,
      `Membaca file baris ke ${index + 1} dari ${sheetRows.length}`
    );

    if (index < 3) return; // skip three first row
    if (!isValidCustItem(row, properties.month, properties.year)) return; // skip invalid item

    const tempCust = Transform.sheet.cell(row.I).split("#");
    let customerNationalIdentity;
    let customerName;
    if (tempCust.length > 1) {
      customerNationalIdentity = tempCust[0];
      customerName = tempCust[tempCust.length - 1];
    } else {
      customerName = tempCust[0];
    }

    if (row.A === "FK") {
      // New customer
      const newCustData = new DataCustomer();
      newCustData.name = customerName;
      newCustData.nationalIdentity = customerNationalIdentity;
      newCustData.taxIdentity = Transform.sheet.cell(row.H);
      newCustData.address = Transform.sheet.cell(row.J);
      newCustData.faktur = Transform.sheet.cell(row.D);
      countedDataBook.addCustomer(newCustData);
      lastCustomer = customerName;
      lastDate = Transform.sheet.cell(row.G);
      lastAddress = Transform.sheet.cell(row.J);
      return; // skip the rest, go to nex row
    }

    const price = parseFloat(row.D);
    const newCustItem = new CustomerItem();
    newCustItem.productCode = row.B;
    newCustItem.productName = row.C;
    newCustItem.productQty = Number(row.E);
    newCustItem.productPrice = isPriceIncludeTaxed
      ? price
      : Math.round(price * 1 + localConfiguration.get("taxTariff") / 100);
    newCustItem.date = dayjs(lastDate, "DD/MM/YYYY").format("YYYY/MM/DD");
    newCustItem.address = lastAddress;

    const totalPrice = newCustItem.productQty * newCustItem.productPrice;
    newCustItem.productDiscount = parseFloat(row.G);
    newCustItem.payment = Math.round(totalPrice - newCustItem.productDiscount);
    newCustItem.taxBasis = Math.round(
      totalPrice * (100 / (localConfiguration.get("taxTariff") + 100))
    );
    newCustItem.VAT = Math.round(
      newCustItem.taxBasis * (localConfiguration.get("taxTariff") / 100)
    );
    newCustItem.priceTaxBasis = Math.round(
      newCustItem.taxBasis / newCustItem.productQty
    );

    const verifyCustItem = verifyDataNumber(newCustItem);
    if (verifyCustItem !== true) {
      throw new Error(
        `Data of ${verifyCustItem} is not valid number in row ${index + 1}`
      );
    }

    countedDataBook.addData(lastCustomer, newCustItem);
  });
  if (countedDataBook.data.size < 1) throw new Error("Data book kosong");

  const orderedDataBook = countedDataBook.orderData(
    false,
    properties.excludeCustomers,
    properties.specialCustomers
  );

  return {
    status: true,
    dataBook: countedDataBook,
    orderedDataBook: orderedDataBook,
    PREV_PROGRESS: MAX_PROGRESS,
  };
};
