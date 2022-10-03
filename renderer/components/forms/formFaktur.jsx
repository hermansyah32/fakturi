import React, { useRef, useState, useEffect } from "react";
import ButtonEdit from "../buttons/buttonEdit";
import ButtonRemove from "../buttons/buttonRemove";
import CollapsibleCard from "../cards/collapsibleCard";
import FakturDialog from "../dialogs/fakturDialog";

const {
  addFaktur,
  setFaktur,
  getFaktur,
} = require("../../context/globalGenerate");

const FormFaktur = () => {
  const fakturAddDialog = useRef(null);
  const fakturUpdateDialog = useRef(null);
  const [fakturState, setFakturState] = useState(getFaktur());

  const showFakturAdd = () => {
    fakturAddDialog.current.openDialog();
  };

  const showFakturEdit = (index) => {
    fakturUpdateDialog.current.openDialog();
    fakturUpdateDialog.current.updateCurrent(fakturState[index], index);
  };

  useEffect(() => {
    // console.log("fakturStateEf", fakturState);
  }, [fakturState]);

  const onFakturAdd = (first, last) => {
    addFaktur(first, last);
    const tempArr = [...getFaktur()];
    setFakturState(tempArr);
  };

  const onFakturUpdate = (index, first, last) => {
    const tempArr = [...getFaktur()];
    tempArr[index] = [first, last];
    setFaktur(tempArr);
    setFakturState(tempArr);
  };

  const onFakturRemove = (index) => {
    const tempArr = [...getFaktur()].filter((value, idx) => idx !== index);
    setFaktur(tempArr);
    setFakturState(tempArr);
  };

  return (
    <CollapsibleCard title="Nomor Faktur">
      <div>
        <div className="flex flex-row-reverse">
          <button
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            type="button"
            id="btnAddFaktur"
            onClick={showFakturAdd}
          >
            Tambah Faktur
          </button>
        </div>
        <table className="w-full text-sm text-left text-gray-500 mt-3 table-auto border-collapse">
          <thead className="text-xs text-gray-700 uppercase font-bold border-2 rounded-t-lg">
            <tr>
              <td scope="col" className="px-6 py-3">
                No
              </td>
              <td scope="col" className="px-6 py-3">
                Faktur Awal
              </td>
              <td scope="col" className="px-6 py-3">
                Faktur Akhir
              </td>
              <td scope="col" className="px-6 py-3">
                Tindakan
              </td>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-700 font-bold border-2 rounded-t-lg">
            {fakturState.length > 0 ? (
              fakturState.map((faktur, index) => {
                return (
                  <tr key={index}>
                    <td scope="col" className="px-6 py-3">
                      {index + 1}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {faktur[0]}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      {faktur[1]}
                    </td>
                    <td scope="col" className="px-6 py-3">
                      <ButtonEdit onClick={(e) => showFakturEdit(index)}>
                        edit
                      </ButtonEdit>
                      <ButtonRemove onClick={(e) => onFakturRemove(index)}>
                        hapus
                      </ButtonRemove>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td scope="col" colSpan={4} className="px-6 py-3 text-center">
                  Data Kosong
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <FakturDialog
          title="Tambah Faktur"
          faktur={[]} // faktur has to be array
          state={"add"}
          onFakturAdd={onFakturAdd}
          ref={fakturAddDialog}
        ></FakturDialog>
        <FakturDialog
          title="Edit Faktur"
          faktur={[]} // faktur has to be array
          state={"update"}
          onFakturUpdate={onFakturUpdate}
          ref={fakturUpdateDialog}
        ></FakturDialog>
      </div>
    </CollapsibleCard>
  );
};

export default FormFaktur;
