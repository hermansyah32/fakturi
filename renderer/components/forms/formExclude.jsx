import React, { useRef, useState, useEffect } from "react";
import ButtonEdit from "../buttons/buttonEdit";
import ButtonRemove from "../buttons/buttonRemove";
import CollapsibleCard from "../cards/collapsibleCard";
import ExcludeCustDialog from "../dialogs/excludeCustDialog";

const {
  addExcludeCustomers,
  setExcludeCustomers,
  getExcludeCustomers,
} = require("../../context/globalGenerate");

const FormExclude = () => {
  const excCustAddDialog = useRef(null);
  const excCustUpdateDialog = useRef(null);
  const [excCustState, setExcCustState] = useState(getExcludeCustomers());

  const showExcCustAdd = () => {
    excCustAddDialog.current.openDialog();
  };

  const showExcCustEdit = (index) => {
    excCustUpdateDialog.current.openDialog();
    excCustUpdateDialog.current.updateCurrent(excCustState[index], index);
  };

  useEffect(() => {
    // console.log("excCustState", excCustState);
  }, [excCustState]);

  const onExcludeCustAdd = (name) => {
    addExcludeCustomers(name);
    const tempArr = [...getExcludeCustomers()];
    setExcCustState(tempArr);
  };

  const onExcludeCustUpdate = (name, index) => {
    const tempArr = [...getExcludeCustomers()];
    tempArr[index] = name;
    setExcludeCustomers(tempArr);
    setExcCustState(tempArr);
  };

  const onExcCustRemove = (index) => {
    const tempArr = [...getExcludeCustomers()].filter(
      (value, idx) => idx !== index
    );
    setExcludeCustomers(tempArr);
    setExcCustState(tempArr);
  };

  return (
    <CollapsibleCard title="Pengecualian Pelanggan">
      <div>
        <div className="flex flex-row-reverse">
          <button
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            type="button"
            id="btnAddExcCust"
            onClick={showExcCustAdd}
          >
            Tambah Pengecualian
          </button>
        </div>
        <table className="w-full text-sm text-left text-gray-500 mt-3 table-auto border-collapse">
          <thead className="text-xs text-gray-700 uppercase font-bold border-2 rounded-t-lg">
            <tr>
              <td scope="col" className="px-6 py-3">
                No
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
            {excCustState.length > 0 ? (
              excCustState.map((cust, index) => {
                return (
                  <tr key={index}>
                    <td scope="col" className="px-6 py-3">
                      {index + 1}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {cust}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      <ButtonEdit onClick={(e) => showExcCustEdit(index)}>
                        edit
                      </ButtonEdit>
                      <ButtonRemove onClick={(e) => onExcCustRemove(index)}>
                        hapus
                      </ButtonRemove>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td scope="col" colSpan={3} className="px-6 py-3 text-center">
                  Data Kosong
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ExcludeCustDialog
          title="Tambah Pengecualian Pelanggan"
          excludeCust=""
          state={"add"}
          onExcludeCustAdd={onExcludeCustAdd}
          ref={excCustAddDialog}
        ></ExcludeCustDialog>
        <ExcludeCustDialog
          title="Edit Pengecualian Pelanggan"
          excludeCust=""
          state={"update"}
          onExcludeCustUpdate={onExcludeCustUpdate}
          ref={excCustUpdateDialog}
        ></ExcludeCustDialog>
      </div>
    </CollapsibleCard>
  );
};

export default FormExclude;
