import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import React, { forwardRef, useImperativeHandle } from "react";
import { Result } from "postcss";

const SpecialCustDialog = forwardRef(
  (
    { state, specialCust, onSpecialCustAdd, onSpecialCustUpdate, title },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [specialCustValue, setSpecialCustValue] = useState(specialCust ?? {});
    const [currentIndex, setCurrentIndex] = useState(0);
    const nameCustRef = useRef();
    const taxIdentityCustRef = useRef();
    const nationalIdentityCustRef = useRef();
    const aliasCustRef = useRef();

    const openDialog = () => {
      setOpen(true);
    };

    const closeDialog = () => {
      setOpen(false);
      onDialogClose();
    };

    const updateCurrent = (specialCust, index = 0) => {
      setSpecialCustValue({ ...specialCust });
      setCurrentIndex(index);
    };

    // useEffect(() => {
    //   console.log("specialCustValue", specialCustValue);
    // }, [specialCustValue]);

    useImperativeHandle(ref, () => {
      return {
        openDialog: openDialog,
        closeDialog: closeDialog,
        updateCurrent: updateCurrent,
      };
    });

    const custValidator = (cust) => {
      let result = [];
      if (cust.name) result.push("name");
      if (cust.taxIdentity) result.push("taxIdentity");
      if (cust.nationalIdentity) result.push("nationalIdentity");
      if (cust.alias) result.push("alias");

      if (result.length > 0) return result;
      else return true;
    };

    const onSubmit = (e) => {
      e.preventDefault();
      if (custValidator(specialCustValue)) {
        switch (state) {
          case "add":
            onSpecialCustAdd(specialCustValue);
            closeDialog();
            break;
          case "update":
            onSpecialCustUpdate(specialCustValue, currentIndex);
            closeDialog();
            break;
          default:
            break;
        }
      }
    };

    const setModalState = (state) => {
      setOpen(state);
    };

    const nameCustEvent = {
      onEventChange: (evt) => {
        if (evt.target.value === "") {
          nameCustRef.current.innerHTML = "Nama pelanggan harus di isi";
        } else {
          nameCustRef.current.innerHTML = "";
          const newCust = { ...specialCustValue };
          newCust.name = evt.target.value;
          setSpecialCustValue(newCust);
        }
      },
    };

    const taxIdentityCustEvent = {
      onEventChange: (evt) => {
        if (evt.target.value === "") {
          taxIdentityCustRef.current.innerHTML = "NPWP pelanggan harus di isi";
        } else {
          nameCustRef.current.innerHTML = "";
          const newCust = { ...specialCustValue };
          newCust.taxIdentity = evt.target.value;
          setSpecialCustValue(newCust);
        }
      },
    };

    const nationalIdentityCustEvent = {
      onEventChange: (evt) => {
        if (evt.target.value === "") {
          nationalIdentityCustRef.current.innerHTML = "NIK pelanggan harus di isi";
        } else {
          nationalIdentityCustRef.current.innerHTML = "";
          const newCust = { ...specialCustValue };
          newCust.nationalIdentity = evt.target.value;
          setSpecialCustValue(newCust);
        }
      },
    };

    const aliasCustEvent = {
      onEventChange: (evt) => {
        if (evt.target.value === "") {
          aliasCustRef.current.innerHTML = "Alias pelanggan harus di isi";
        } else {
          aliasCustRef.current.innerHTML = "";
          const newCust = { ...specialCustValue };
          newCust.alias = evt.target.value;
          setSpecialCustValue(newCust);
        }
      },
    };

    const onDialogClose = () => {
      setSpecialCustValue("");
    };

    return (
      <>
        <Transition appear show={open} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => onDialogClose()}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all text-black">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-2"
                    >
                      {title}
                    </Dialog.Title>
                    <form id="form-special" onSubmit={onSubmit}>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Pelanggan
                      </label>
                      <input
                        type="text"
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="Nama pelanggan adalah yang akan tampil di import file"
                        onBlur={nameCustEvent.onEventChange}
                        onChange={nameCustEvent.onEventChange}
                        id="nameCust"
                        defaultValue={specialCustValue.name}
                      ></input>
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={nameCustRef}
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        NPWP Pelanggan
                      </label>
                      <input
                        type="text"
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="Nama pelanggan adalah yang akan tampil di import file"
                        onBlur={taxIdentityCustEvent.onEventChange}
                        onChange={taxIdentityCustEvent.onEventChange}
                        id="nameCust"
                        defaultValue={specialCustValue.taxIdentity}
                      ></input>
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={taxIdentityCustRef}
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        NIK Pelanggan
                      </label>
                      <input
                        type="text"
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="Nama pelanggan adalah yang akan tampil di import file"
                        onBlur={nationalIdentityCustEvent.onEventChange}
                        onChange={nationalIdentityCustEvent.onEventChange}
                        id="nameCust"
                        defaultValue={specialCustValue.nationalIdentity}
                      ></input>
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={nationalIdentityCustRef}
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        Alias Pelanggan
                      </label>
                      <input
                        type="text"
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="Nama pelanggan adalah yang akan tampil di import file"
                        onBlur={aliasCustEvent.onEventChange}
                        onChange={aliasCustEvent.onEventChange}
                        id="nameCust"
                        defaultValue={specialCustValue.alias}
                      ></input>
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={aliasCustRef}
                      />
                    </form>
                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          setModalState(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        form="form-special"
                        type="submit"
                      >
                        Save
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  }
);

export default SpecialCustDialog;
