import electron from "electron";
import React, { useState, useRef, useEffect } from "react";
import Cleave from "cleave.js/react";
import StaticCard from "../cards/staticCard";
import dayjs from "dayjs";

const {
  setFile,
  getFile,
  getMonth,
  setMonth,
  getYear,
  setYear,
  getInvoice,
  setInvoice,
} = require("../../context/globalDegenerate");

const months = [
  "Semua",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const ipcRenderer = electron.ipcRenderer || false;

const FormDegenerate = (props) => {
  const [bffStatus, setBffStatus] = useState(false);
  const inputFile = useRef();
  const inputInvoice = useRef();
  const inputMonth = useRef();
  const inputYear = useRef();
  const inputFileRef = useRef();
  const inputPeriodRef = useRef();
  const inputInvoiceRef = useRef();

  useEffect(() => {
    inputFile.current.value = getFile();
  }, []);

  const validateFile = () => {
    inputFileRef.current.innerHTML = "";
    if (inputFile.current.value === "") {
      inputFileRef.current.innerHTML = "File tidak valid";
      return false;
    }
    return true;
  };

  const validatePeriod = () => {
    const year = Number(inputYear.current.value);
    inputPeriodRef.current.innerHTML = "";

    if (year < 1980 && year > 2099) {
      inputPeriodRef.current.innerHTML = "Tahun berkisar antara 1980 dan 2099";
      return false;
    }
    return true;
  };

  const validateInvoice = () => {
    inputInvoiceRef.current.innerHTML = "";
    if (inputInvoice.current.value === "") {
      inputInvoiceRef.current.innerHTML = "Nomor invoice tidak valid";
      return false;
    }
    return true;
  };

  const browseButtonClicked = async () => {
    if (!bffStatus) {
      setBffStatus(true);
      const file = await ipcRenderer.invoke("browseForFile", []);
      if (file.status && inputFile) {
        inputFile.current.value = file.data.filePaths[0];
        onFileChangeListener(inputFile.current.value);
      }
      setBffStatus(false);
    }
  };
  const onFileChangeListener = (path) => {
    setFile(path);
  };

  const onMonthChangeListener = (evt) => {
    const month = Number(evt) - 1;
    if (isNaN(month) || month < 0) {
      setMonth(null);
      return;
    }
    setMonth(month);
  };

  const onYearChangeListener = (evt) => {
    const year = Number(evt.target.value);
    if (isNaN(year)) {
      setYear(null);
      return;
    }
    if (year < 1980 && year > 2099) {
      inputPeriodRef.current.innerHTML = "Tahun berkisar antara 1980 dan 2099";
      return;
    }

    setYear(year);
  };

  const onInvoiceChangeListener = (evt) => {
    if (validateInvoice()) setInvoice(Number(inputInvoice.current.value));
  };

  return (
    <StaticCard title="File Degenerator">
      <form id="form-generator-company">
        <table className="w-full border-separate space-y-6">
          <tbody>
            <tr>
              <td>File</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <div className="flex space-x-6">
                  <input
                    type="text"
                    className="focus:ring-gray-600 focus:border-gray-600 flex-1 block flex-grow rounded-none rounded-r-md sm:text-sm border-gray-300 w-full"
                    name="file"
                    id="file"
                    value={getFile()}
                    ref={inputFile}
                    onChange={(e) => onFileChangeListener(e.target.value)}
                    placeholder="Masukkan alamat file import excel"
                  />
                  <button
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                    type="button"
                    id="btnBrowse"
                    onClick={browseButtonClicked}
                  >
                    Browse
                  </button>
                </div>
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={inputFileRef}
                />
              </td>
            </tr>
            <tr>
              <td>Masa Pajak</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <div className="flex space-x-6 align-middle">
                  <select
                    className="w-full"
                    defaultValue={getMonth() ?? 0}
                    onChange={(e) =>
                      onMonthChangeListener(e.target.selectedIndex)
                    }
                  >
                    {months.map((month, index) => {
                      return (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                  <Cleave
                    className="focus:ring-gray-600 focus:border-gray-600  rounded-none rounded-r-md sm:text-sm border-gray-300 mt-1 form-input w-full"
                    placeholder="0000"
                    options={{ numericOnly: true, blocks: [4] }}
                    value={getYear() ?? ""}
                    onBlur={onYearChangeListener}
                    onChange={onYearChangeListener}
                    id="yearEvent"
                  />
                </div>
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={inputPeriodRef}
                />
              </td>
            </tr>
            <tr>
              <td>Nomor Invoice</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="invoice"
                  id="invoice"
                  ref={inputInvoice}
                  value={getInvoice()}
                  onInput={(e) => {
                    const element = e.target;
                    element.value = element.value
                      .replace(/[^0-9.]/g, "")
                      .replace(/(\..*?)\..*/g, "$1");
                  }}
                  onChange={onInvoiceChangeListener}
                  placeholder="Masukkan nomor invoice"
                />
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={inputInvoiceRef}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-200 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            onClick={props.onDegenerateClicked}
          >
            Degenerate
          </button>
        </div>
      </form>
    </StaticCard>
  );
};

export default FormDegenerate;
