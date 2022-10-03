import { existsSync, readFileSync } from "fs";
import path from "path";
import electron, { app } from "electron";

const BASE_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice</title>
    <style>
      body {
        font-size: 10pt;
      }

      h1 {
        padding: 0;
        margin: 0;
      }

      h3 {
        padding: 0;
        margin: 0;
      }

      .logo {
        width: 100px;
        height: 100px;
      }

      .header {
        display: flex;
        margin: 0 50px;
      }

      .company-header {
        flex-grow: 1;
        width: 100%;
        margin: 10px 0;
        justify-content: center;
      }

      .company-name {
        color: #000080;
        font-weight: bold;
        text-align: center;
        font-size: 38px;
      }

      .invoice-title {
        font-weight: bold;
        font-size: larger;
        text-align: center;
        border-top: 2px solid;
        margin: 0 30px;
        padding: 10px;
      }

      .customer-address {
        margin-left: 130px;
        margin-right: 55px;
      }

      .table-invoice {
        width: 100%;
        text-align: center;
        border-collapse: collapse;
      }

      .table-invoice td {
        padding: 4px 6px;
        border: 1px solid;
      }

      .box {
        display: inherit;
        border: 1px solid;
        padding: 4px;
      }

      .footer {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
      }

      @page {
        size: 21cm 29.7cm;
      }
    </style>
  </head>

  <body>
    <div class="header">
      <table style="width: 100%">
        <tr>
          <td style="width: 100px">
            <!-- Logo Di sini -->
          </td>
          <td>
            <div class="company-header">
              <h1 class="company-name">{COMPANY_NAME}</h1>
              <h3 class="invoice-title">I N V O I C E</h3>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div class="customer-address">
      Kepada :<br />
      <div style="margin-left: 3rem">
        {CLIENT_NAME}<br />
        di-<br />
        <strong>{CLIENT_ADDRESS}</strong>
      </div>
      <br />
      <table class="table-invoice" style="border: 1px solid">
        <tr style="font-weight: bold">
          <td>NO INVOICE</td>
          <td>TANGGAL</td>
          <td colspan="2">ORDER PEMBELIAN</td>
        </tr>
        <tr>
          <td>SRT/{INVOICE_NUMBER}/{INVOICE_MONTH}-{INVOICE_YEAR}</td>
          <td>{INVOICE_DATE}</td>
          <td colspan="2">-</td>
        </tr>
        <tr style="font-weight: bold">
          <td>NAMA PRODUK</td>
          <td>JUMLAH</td>
          <td>HARGA SATUAN<br />(Rp)</td>
          <td>TOTAL HARGA<br />(Rp)</td>
        </tr>
        {ITEMS}
        <tr>
          <td style="text-align: left; border-bottom: unset" colspan="3">
            Jumlah Pembayaran
          </td>
          <td style="text-align: right; border-bottom: unset">
            {TOTAL_PAYMENT}
          </td>
        </tr>
        <tr>
          <td style="text-align: left; border: unset" colspan="3">
            Dasar Pengenaan Pajak
          </td>
          <td
            style="text-align: right; border-top: unset; border-bottom: unset"
          >
            {TOTAL_TAX_BASIS}
          </td>
        </tr>
        <tr>
          <td style="text-align: left; border: unset" colspan="3">
            PPN {TAX_TARIFF}% x Dasar Pengenaan Pajak
          </td>
          <td style="text-align: right; border-top: unset">{TOTAL_VAT}</td>
        </tr>
        <tr>
          <td style="border-top: unset" colspan="3"></td>
          <td style="text-align: right; border-top: 1px solid">
            {TOTAL_PAYMENT}
          </td>
        </tr>
        <tr>
          <td style="text-align: left" colspan="4">{TOTAL_PAYMENT_WORD}</td>
        </tr>
        <tr>
          <td style="text-align: left" colspan="4">
            {COMPANY_NAME}
            <br /><br /><br /><br /><br />
            {COMPANY_DIRECTOR}
          </td>
        </tr>
        <tr>
          <td style="text-align: center; border-bottom: unset" colspan="4">
            {COMPANY_ADDRESS}
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`;

const BASE_HTML_ROW = `
<tr style="text-align: right">
  <td style="text-align: left">{PRODUCT_NAME}</td>
  <td>{PRODUCT_QTY}</td>
  <td>{PRODUCT_PRICE}</td>
  <td>{PAYMENT}</td>
</tr>
`;

const isExists = () => {
  if (!app) return false;
  if (
    !existsSync(path.join(app.getAppPath(), "resources/templates/invoice.html"))
  )
    return false;
  if (!existsSync(path.join(app.getAppPath(), "resources/templates/item.html")))
    return false;
  return true;
};

const get = () => {
  let baseHtml = "";
  let baseHtmlRow = "";
  if (isExists()) {
    baseHtml = readFileSync(
      path.join(app.getAppPath(), "resources/templates/invoice.html")
    );
    baseHtmlRow = readFileSync(
      path.join(app.getAppPath(), "resources/templates/invoice.html")
    );
  } else {
    (baseHtml = BASE_HTML), (baseHtmlRow = BASE_HTML_ROW);
  }

  return {
    baseHtml: baseHtml,
    baseHtmlRow: baseHtmlRow,
  };
};

class Placement {
  constructor() {
    this.COMPANY_NAME = "";
    this.COMPANY_DIRECTOR = "";
    this.COMPANY_ADDRESS = "";
    this.BANK_ACCOUNT = "";
    this.BANK_NAME = "";
    this.TAX_TARIFF = "";
    this.INVOICE_NUMBER = "";
    this.INVOICE_MONTH = "";
    this.INVOICE_YEAR = "";
    this.INVOICE_DATE = "";
    this.CLIENT_NAME = "";
    this.CLIENT_ADDRESS = "";
    this.ITEMS = "";
    this.TOTAL_PAYMENT = "";
    this.TOTAL_PAYMENT_WORD = "";
    this.TOTAL_TAX_BASIS = "";
    this.TOTAL_VAT = "";
  }
}

class PlacementItem {
  constructor() {
    this.PRODUCT_NAME = "";
    this.PRODUCT_QTY = "";
    this.PRODUCT_PRICE = "";
    this.PAYMENT = "";
  }
}

export { isExists, get, Placement, PlacementItem };
