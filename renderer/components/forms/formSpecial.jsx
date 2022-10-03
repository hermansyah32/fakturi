import React, { useRef, useState, useEffect } from "react";
import ButtonEdit from "../buttons/buttonEdit";
import ButtonRemove from "../buttons/buttonRemove";
import CollapsibleCard from "../cards/collapsibleCard";
import SpecialCustDialog from "../dialogs/specialCustDialog";

const {
  addSpecialCustomers,
  setSpecialCustomers,
  getSpecialCustomers,
} = require("../../context/globalGenerate");

const FormSpecial = () => {
  const spcCustAddDialog = useRef(null);
  const spcCustUpdateDialog = useRef(null);
  const [spcCustState, setSpcCustState] = useState(getSpecialCustomers());

  const showSpcCustAdd = () => {
    spcCustAddDialog.current.openDialog();
  };

  const showSpcCustEdit = (index) => {
    spcCustUpdateDialog.current.openDialog();
    spcCustUpdateDialog.current.updateCurrent(spcCustState[index], index);
  };

  // useEffect(() => {
  //   console.log("spcCustState", spcCustState);
  // }, [spcCustState]);

  const onSpecialCustAdd = (cust) => {
    addSpecialCustomers(cust);
    const tempArr = [...getSpecialCustomers()];
    setSpcCustState(tempArr);
  };

  const onSpecialCustUpdate = (name, index) => {
    const tempArr = [...getSpecialCustomers()];
    tempArr[index] = name;
    setSpecialCustomers(tempArr);
    setSpcCustState(tempArr);
  };

  const onSpcCustRemove = (index) => {
    const tempArr = [...getSpecialCustomers()].filter(
      (value, idx) => idx !== index
    );
    setSpecialCustomers(tempArr);
    setSpcCustState(tempArr);
  };

  return (
    <CollapsibleCard title="Pelanggan Khusus">
      <div>
        <div className="flex flex-row-reverse">
          <button
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            type="button"
            id="btnAddSpcCust"
            onClick={showSpcCustAdd}
          >
            Tambah Pelanggan
          </button>
        </div>
        <table className="w-full text-sm text-left text-gray-500 mt-3 table-auto border-collapse">
          <thead className="text-xs text-gray-700 uppercase font-bold border-2 rounded-t-lg">
            <tr>
              <td scope="col" className="px-6 py-3">
                No
              </td>
              <td scope="col" className="px-6 py-3">
                Nama Pelanggan
              </td>
              <td scope="col" className="px-6 py-3">
                NPWP Pelanggan
              </td>
              <td scope="col" className="px-6 py-3">
                NIK Pelanggan
              </td>
              <td scope="col" className="px-6 py-3">
                Alias Pelanggan
              </td>
              <td scope="col" className="px-6 py-3">
                Tindakan
              </td>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-700 font-bold border-2 rounded-t-lg">
            {spcCustState.length > 0 ? (
              spcCustState.map((cust, index) => {
                return (
                  <tr key={index}>
                    <td scope="col" className="px-6 py-3">
                      {index + 1}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {cust.name}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {cust.taxIdentity}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {cust.nationalIdentity}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {cust.alias}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      <ButtonEdit onClick={(e) => showSpcCustEdit(index)}>
                        edit
                      </ButtonEdit>
                      <ButtonRemove onClick={(e) => onSpcCustRemove(index)}>
                        hapus
                      </ButtonRemove>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td scope="col" colSpan={6} className="px-6 py-3 text-center">
                  Data Kosong
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <SpecialCustDialog
          title="Tambah Pelanggan Khusus"
          specialCust=""
          state={"add"}
          onSpecialCustAdd={onSpecialCustAdd}
          ref={spcCustAddDialog}
        ></SpecialCustDialog>
        <SpecialCustDialog
          title="Edit Pelanggan Khusus"
          specialCust=""
          state={"update"}
          onSpecialCustUpdate={onSpecialCustUpdate}
          ref={spcCustUpdateDialog}
        ></SpecialCustDialog>
      </div>
    </CollapsibleCard>
  );
};

export default FormSpecial;
