import { Company } from "../../entity/company";
import { GenerateProperties } from "../../entity/generateProperties";
import { DataBook, DataCustomer, CustomerItem } from "../../entity/databook";
import { IPCRendererHandler } from "../../ipc/handle";
import { Transform } from "../../helpers/transformer";
import { LocalConfig } from "../../helpers/configuration-common";
import dayjs from "dayjs";

export let MAX_PROGRESS = 20;

/**
 * Check if excel row is data
 * @param {object} sheetRow Excel row
 * @returns
 */
const isValidCustItem = (sheetRow) => {
  if (
    sheetRow.A !== undefined &&
    sheetRow.E !== undefined &&
    sheetRow.E !== 0 &&
    sheetRow.F !== undefined &&
    sheetRow.F !== 0
  ) {
    return true;
  }
  return false;
};

/**
 * Get current index of from current customer item to merge
 * @param {CustomerItem} currentCustItem Current customer item from current excel row
 * @param {CustomerItem[]} custItems Customer item array from Data Customer
 * @returns
 */
const getCurrentItemIndex = (currentCustItem, custItems) => {
  let result = -1;
  if (!custItems) return result;
  custItems.items.every((item, index) => {
    if (item.productName === currentCustItem.productName) {
      result = index;
      return false;
    }
    return true;
  });
  return result;
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
 * @param {GenerateProperties} properties Generate properties
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

  sheetRows.forEach((row, index) => {
    const currentProgress = Math.floor(
      ((index + 1) / sheetRows.length / MAX_PROGRESS) * 100
    );
    IPCRendererHandler().sendProgress(
      currentProgress,
      100,
      `Membaca file baris ke ${index + 1} dari ${sheetRows.length}`
    );

    if (!index) return; // skip first row
    if (!isValidCustItem(row)) return; // skip invalid item
    if (!countedDataBook.isCustomerExist(row.A)) {
      const newCustData = new DataCustomer();
      newCustData.name = Transform.sheet.cell(row.A);
      newCustData.nationalIdentity = Transform.sheet.cell(row.J);
      newCustData.taxIdentity = Transform.sheet.cell(row.K);
      newCustData.address = Transform.sheet.cell(row.L);
      countedDataBook.addCustomer(newCustData);
    }

    const newCustItem = new CustomerItem();
    newCustItem.productCode = row.C;
    newCustItem.productName = row.B;
    newCustItem.productQty = Number(row.F);
    newCustItem.productPrice = parseFloat(row.E);
    newCustItem.date = dayjs(Transform.sheet.cell(row.D)).format("YYYY/MM/DD");
    newCustItem.address = Transform.sheet.cell(row.L);

    const totalPrice = newCustItem.productQty * newCustItem.productPrice;
    newCustItem.productDiscount = parseFloat(row.H);
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

    const currentItemIndex = getCurrentItemIndex(
      newCustItem,
      countedDataBook.getCustomer(row.A)
    );
    if (currentItemIndex < 0) countedDataBook.addData(row.A, newCustItem);
    else countedDataBook.mergeData(row.A, currentItemIndex, newCustItem);
  });
  if (countedDataBook.data.size < 1) throw new Error("Data book kosong");

  const orderedDataBook = countedDataBook.orderData(
    false,
    properties.excludeCustomers,
    properties.specialCustomers
  );

  // add faktur to ordered DataBook
  let usedFakturIndex = 0;
  orderedDataBook.data = new Map(
    [...orderedDataBook.data.entries()].map((dataBook) => {
      let currentFaktur = "";
      if (properties.faktur[usedFakturIndex] !== undefined) {
        currentFaktur = properties.faktur[usedFakturIndex];
        usedFakturIndex++;
      }
      dataBook[1].faktur = currentFaktur;
      return dataBook;
    })
  );

  return {
    status: true,
    dataBook: countedDataBook,
    orderedDataBook: orderedDataBook,
    PREV_PROGRESS: MAX_PROGRESS,
  };
};
