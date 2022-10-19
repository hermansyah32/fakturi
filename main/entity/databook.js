class DataCustomer {
  constructor() {
    this.name = "";
    this.nationalIdentity = null;
    this.taxIdentity = null;
    this.totalTaxBasis = 0.0;
    this.totalVAT = 0.0;
    this.totalPayment = 0.0;
    this.totalProductQty = 0;
    this.totalProductDiscount = 0;
    this.reference = "";
    /** @type{CustomerItem[]} */
    this.items = [];
    this.faktur = "";
    this.address = "-";
  }
}

class CustomerItem {
  constructor() {
    this.date = "";
    this.productCode = "";
    this.productName = "";
    this.productPrice = 0.0;
    this.productQty = 0;
    this.productDiscount = 0.0;
    this.payment = 0.0;
    this.taxBasis = 0.0;
    this.VAT = 0.0;
    this.priceTaxBasis = 0.0;
  }
}

class DataBook {
  constructor() {
    /** @type{Map<String, DataCustomer>} this.data */
    this.data = new Map();
  }

  /**
   * Check if customer name exists in data map
   * @param {string} custName Customer string
   * @returns {bool} Return true if exists else false
   */
  isCustomerExist(custName) {
    if (!this.data.get(custName)) {
      return false;
    }
    return true;
  }

  reset() {
    this.data.clear();
  }

  /**
   * Add new data customer
   * @param {DataCustomer} dataCust Data customer
   */
  addCustomer(dataCust) {
    this.data.set(dataCust.name, dataCust);
  }

  /**
   * Get data customer by name
   * @param {string} custName Customer name
   */
  getCustomer(custName) {
    return this.data.get(custName);
  }

  /**
   * Add data customer to data book
   * @param {string} custName Customer name. Customer name is not case sensitive
   * @param {CustomerItem} custItem Customer item
   */
  addData(custName, custItem) {
    if (!this.data.get(custName)) return;
    this.data.get(custName).items.push(custItem);

    this.data.get(custName).totalPayment += custItem.payment;
    this.data.get(custName).totalProductQty += custItem.productQty;
    this.data.get(custName).totalTaxBasis += custItem.taxBasis;
    this.data.get(custName).totalVAT += custItem.VAT;
  }

  /**
   * Merge customer item to data customer
   * @param {string} custName Customer name. Customer name is not case sensitive
   * @param {number} index Customer item index
   * @param {CustomerItem} newCustItem New customer item.
   */
  mergeData(custName, index, newCustItem) {
    if (!this.data.get(custName)) return;
    const currentCustItem = { ...this.data.get(custName).items[index] };

    currentCustItem.productQty += newCustItem.productQty;
    currentCustItem.productDiscount += newCustItem.productDiscount;
    currentCustItem.payment += newCustItem.payment;
    currentCustItem.taxBasis += newCustItem.taxBasis;
    currentCustItem.VAT += newCustItem.VAT;
    currentCustItem.priceTaxBasis =
      currentCustItem.taxBasis / currentCustItem.productQty;

    this.data.get(custName).items[index] = { ...currentCustItem };
    this.data.get(custName).totalPayment += newCustItem.payment;
    this.data.get(custName).totalProductQty += newCustItem.productQty;
    this.data.get(custName).totalTaxBasis += newCustItem.taxBasis;
    this.data.get(custName).totalVAT += newCustItem.VAT;
  }

  /**
   * Sorting data book map
   * @param {bool} asc Sort by ascending or descending
   * @param {array} withExclusionCust Excluded customer list. It will be skipped
   * @param {array} withSpecialCust Special customer list. it will be changed customer data
   */
  orderData(asc = true, withExclusionCust = [], withSpecialCust = []) {
    let tempDataBook = { ...this };
    if (withExclusionCust.length > 0) {
      withExclusionCust.forEach((cust) => {
        tempDataBook.data.delete(cust);
      });
    }

    if (withSpecialCust.length > 0) {
      withSpecialCust.forEach((cust) => {
        const tempCust = { ...tempDataBook.data.get(cust.name) };
        delete tempDataBook.data.delete(cust.name);
        tempCust.taxIdentity = cust.taxIdentity;
        tempCust.nationalIdentity = cust.nationalIdentity;
        tempCust.name = cust.alias;
        tempDataBook.data.set(alias, { ...tempCust });
      });
    }

    // map to array turn in two dimensional array, first element is key, second element is value
    tempDataBook.data = new Map(
      [...tempDataBook.data.entries()].sort((objA, objB) => {
        if (asc) return objA[1].totalVAT - objB[1].totalVAT;
        else return (objA[1].totalVAT - objB[1].totalVAT) * -1;
      })
    );
    return tempDataBook;
  }
}

export { DataCustomer, CustomerItem, DataBook };
