import electron from "electron";
import React, { useState, useRef, useEffect } from "react";
import StaticCard from "../cards/staticCard";

const {
  setFile,
  getFile,
  setInvoice,
  getInvoice,
  setFakturCode,
  getFakturCode,
} = require("../../context/globalGenerate");

const ipcRenderer = electron.ipcRenderer || false;

const initFakturCode = () => {
  return [
    { code: "01", desc: "01 - Kepada Pihak yang Bukan Pemungut PPN" },
    { code: "02", desc: "02 - Kepada Pihak pemungut Bendaharawan" },
    { code: "03", desc: "03 - Kepada Pihak pemungut Selain Bendaharawan" },
    { code: "04", desc: "04 - DPP Nilai Lain" },
    { code: "05", desc: "05 - Besaran Tertentu (Pasal 9A ayat (1) UU PPN) " },
    { code: "06", desc: "06 - Penyerahan yang" },
    { code: "07", desc: "07 - Penyerahan yang PPn-nya Tidak Dipungut" },
    { code: "08", desc: "08 - Penyerahan yang PPn-nya Dibebaskan" },
    { code: "09", desc: "09 - Penyerahan Aktiva (Pasal 16D UU PPN)" },
  ];
};

const FormFile = () => {
  const [bffStatus, setBffStatus] = useState(false);
  const inputFile = useRef();
  const invoiceRef = useRef();
  const fakturCodeRef = useRef();

  useEffect(() => {
    inputFile.current.value = getFile();
    invoiceRef.current.value = getInvoice();
  }, []);

  const browseButtonClicked = async () => {
    if (!bffStatus) {
      setBffStatus(true);
      const file = await ipcRenderer.invoke("browseForFile", []);
      if (file.status && inputFile) {
        inputFile.current.value = file.data.filePaths[0];
        onFileChanged(inputFile.current.value);
      }
      setBffStatus(false);
    }
  };
  const onFileChanged = (path) => {
    setFile(path);
  };

  const onInvoiceChanged = (invoice) => {
    if (invoice.length > 0) {
      setInvoice(Number(invoice));
    }
  };

  const onFakturCodeChanged = (fakturCode) => {
    setFakturCode(fakturCode);
  };

  return (
    <StaticCard title="File Excel">
      <form id="form-generator-company">
        <table className="w-full border-separate space-y-6">
          <tbody>
            <tr>
              <td className="w-0">File</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="file"
                  id="file"
                  ref={inputFile}
                  onChange={(e) => onFileChanged(e.target.value)}
                  placeholder="Masukkan alamat file excel yang dipilih"
                />
              </td>
              <td className="pl-3">
                <button
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                  type="button"
                  id="btnBrowse"
                  onClick={browseButtonClicked}
                >
                  Browse
                </button>
              </td>
            </tr>
            <tr>
              <td className="w-auto">Nomor Invoice</td>
              <td className="px-3">:</td>
              <td>
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="invoice"
                  id="invoice"
                  ref={invoiceRef}
                  onInput={(e) => {
                    const element = e.target;
                    element.value = element.value
                      .replace(/[^0-9.]/g, "")
                      .replace(/(\..*?)\..*/g, "$1");
                  }}
                  onChange={(e) => onInvoiceChanged(e.target.value)}
                  placeholder="Masukkan nomor invoice"
                />
              </td>
            </tr>
            <tr>
              <td className="w-auto">Kode Faktur</td>
              <td className="px-3">:</td>
              <td>
                <select
                  className="w-full"
                  id="fakturCode"
                  name="fakturCode"
                  ref={fakturCodeRef}
                  defaultValue={getFakturCode()}
                  onChange={(e) => onFakturCodeChanged(e.target.value)}
                >
                  {initFakturCode().map((fakturCode, index) => {
                    return (
                      <option key={index} value={fakturCode.code}>
                        {fakturCode.desc}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </StaticCard>
  );
};

export default FormFile;
