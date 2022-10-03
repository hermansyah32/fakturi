import electron from "electron";
import React, { useEffect, useState, useRef } from "react";
import StaticCard from "../cards/staticCard";
import Cleave from "cleave.js/react";

const ipcRenderer = electron.ipcRenderer || false;

const setConfig = async (name, value) => {
  return await ipcRenderer.invoke("setConfig", { name: name, value: value });
};

const getAllConfig = async () => {
  return await ipcRenderer.invoke("getAllConfig", []);
};

const FormSettingFile = () => {
  const [setting, setSetting] = useState();
  const [bffStatus, setBffStatus] = useState(false);
  const outputFolderRef = useRef();
  const inputOutputFolderRef = useRef();
  const taxTariffRef = useRef();
  const companyNameRef = useRef();
  const companyTaxIdentityRef = useRef();
  const companyAddressRef = useRef();
  const companyDirectorRef = useRef();
  const taxIdentityOptions = {
    delimiters: [".", ".", ".", "-", "."],
    blocks: [2, 3, 3, 1, 3, 3],
    numericOnly: true,
  };

  useEffect(async () => {
    const _data = await getAllConfig();
    setSetting(_data);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    Object.keys(setting).forEach((key) => {
      if (setting[key]) {
        setConfig(key, setting[key]);
      }
    });
  };

  const browseButtonClicked = async () => {
    if (!bffStatus) {
      setBffStatus(true);
      const file = await ipcRenderer.invoke("browseForFolder", []);
      if (file.status && inputOutputFolderRef) {
        inputOutputFolderRef.current.value = file.data.filePaths[0];
        const newSetting = { ...setting };
        newSetting.configOutput = inputOutputFolderRef.current.value;
        setConfig("configOutput", newSetting.configOutput);
        setSetting(newSetting);
      }
      setBffStatus(false);
    }
  };

  const onOutputChange = {
    onEventChange: (evt) => {
      if (evt.target.value === "") {
        outputFolderRef.current.innerHTML = "Folder output tidak dapat diakses";
      } else {
        outputFolderRef.current.innerHTML = "";
        const newSetting = { ...setting };
        newSetting.configOutput = evt.target.value;
        setConfig("configOutput", newSetting.configOutput);
        setSetting(newSetting);
      }
    },
  };

  const onTaxTariffChange = {
    onEventChange: (evt) => {
      if (evt.target.value === "") {
        taxTariffRef.current.innerHTML =
          "Tarif PPN berkisar antara angka 1-100";
      } else {
        taxTariffRef.current.innerHTML = "";
        const newSetting = { ...setting };
        newSetting.taxTariff = Number(evt.target.value);
        setConfig("taxTariff", newSetting.taxTariff);
        setSetting(newSetting);
      }
    },
  };

  const onCompanyNameChanged = {
    onEventChange: (evt) => {
      if (evt.target.value === "") {
        companyNameRef.current.innerHTML = "Nama perusahaan harus diisi";
      } else {
        companyNameRef.current.innerHTML = "";
        const newSetting = { ...setting };
        newSetting.companyName = evt.target.value;
        setConfig("companyName", newSetting.companyName);
        setSetting(newSetting);
      }
    },
  };

  const onCompanyTaxIdentityChanged = {
    onEventChange: (evt) => {
      if (evt.target.value === "") {
        companyTaxIdentityRef.current.innerHTML = "NPWP harus diisi";
      } else {
        companyTaxIdentityRef.current.innerHTML = "";
        const newSetting = { ...setting };
        newSetting.companyTaxIdentity = evt.target.value;
        setConfig("companyTaxIdentity", newSetting.companyTaxIdentity);
        setSetting(newSetting);
      }
    },
  };

  const onCompanyAddressChanged = {
    onEventChange: (evt) => {
      if (evt.target.value === "") {
        companyAddressRef.current.innerHTML = "Alamat perusahaan harus diisi";
      } else {
        companyAddressRef.current.innerHTML = "";
        const newSetting = { ...setting };
        newSetting.companyAddress = evt.target.value;
        setConfig("companyAddress", newSetting.companyAddress);
        setSetting(newSetting);
      }
    },
  };

  const onCompanyDirectorChanged = {
    onEventChange: (evt) => {
      if (evt.target.value === "") {
        companyDirectorRef.current.innerHTML =
          "Nama direktur perusahaan harus diisi";
      } else {
        companyDirectorRef.current.innerHTML = "";
        const newSetting = { ...setting };
        newSetting.companyDirector = evt.target.value;
        setConfig("companyDirector", newSetting.companyDirector);
        setSetting(newSetting);
      }
    },
  };

  return (
    <StaticCard title="Pengaturan Aplikasi">
      <form id="form-setting" onSubmit={onSubmit}>
        <table className="w-full border-separate space-y-6">
          <tbody>
            <tr>
              <td className="w-0">Output Folder</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="file"
                  id="file"
                  ref={inputOutputFolderRef}
                  onBlur={onOutputChange.onEventChange}
                  onChange={onOutputChange.onEventChange}
                  defaultValue={setting?.configOutput ?? ""}
                  placeholder="Masukkan alamat folder output"
                />
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={outputFolderRef}
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
              <td className="w-0">Tarif PPN</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="taxRate"
                  id="taxRate"
                  onBlur={onTaxTariffChange.onEventChange}
                  onChange={onTaxTariffChange.onEventChange}
                  defaultValue={setting?.taxTariff ?? ""}
                  placeholder="Tarif PPN"
                />
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={taxTariffRef}
                />
              </td>
            </tr>
            <tr>
              <td className="w-0">Nama Perusahaan</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="companyName"
                  id="companyName"
                  onBlur={onCompanyNameChanged.onEventChange}
                  onChange={onCompanyNameChanged.onEventChange}
                  defaultValue={setting?.companyName ?? ""}
                  placeholder="Nama perusahaan"
                />
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={companyNameRef}
                />
              </td>
            </tr>
            <tr>
              <td className="w-0">NPWP Perusahaan</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <Cleave
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="companyTaxIdentity"
                  id="companyTaxIdentity"
                  options={taxIdentityOptions}
                  value={setting?.companyTaxIdentity ?? ""}
                  placeholder="NPWP perusahaan"
                />
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={companyTaxIdentityRef}
                />
              </td>
            </tr>
            <tr>
              <td className="w-0">Alamat Perusahaan</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <textarea
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="companyAddress"
                  id="companyAddress"
                  onBlur={onCompanyAddressChanged.onEventChange}
                  onChange={onCompanyAddressChanged.onEventChange}
                  defaultValue={setting?.companyAddress ?? ""}
                  placeholder="Alamat perusahaan"
                ></textarea>
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={companyAddressRef}
                />
              </td>
            </tr>
            <tr>
              <td className="w-0">Nama Direktur</td>
              <td className="px-3">:</td>
              <td className="w-full">
                <input
                  type="text"
                  className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  name="companyDirector"
                  id="companyDirector"
                  defaultValue={setting?.companyDirector ?? ""}
                  placeholder="Nama direktur"
                  onBlur={onCompanyDirectorChanged.onEventChange}
                  onChange={onCompanyDirectorChanged.onEventChange}
                />
                <p
                  className="mt-1 text-sm text-red-600 italic"
                  ref={companyDirectorRef}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {/* TODO: add save button */}
      </form>
    </StaticCard>
  );
};

export default FormSettingFile;
