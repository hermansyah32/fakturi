import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import React, { forwardRef, useImperativeHandle } from "react";

const ExcludeCustDialog = forwardRef(
  (
    {
      state,
      excludeCust,
      onExcludeCustAdd,
      onExcludeCustUpdate,
      title,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [excludeCustValue, setExcludeCustValue] = useState(excludeCust ?? '');
    const [currentIndex, setCurrentIndex] = useState(0);
    const excludeCustRef = useRef();

    const openDialog = () => {
      setOpen(true);
    };

    const closeDialog = () => {
      setOpen(false);
      onDialogClose();
    };

    const updateCurrent = (excludeCust, index = 0) => {
      setExcludeCustValue(excludeCust);
      setCurrentIndex(index);
    };

    useImperativeHandle(ref, () => {
      return {
        openDialog: openDialog,
        closeDialog: closeDialog,
        updateCurrent: updateCurrent,
      };
    });

    const onSubmit = (e) => {
      e.preventDefault();
      if (excludeCustValue != "") {
        switch (state) {
          case "add":
            onExcludeCustAdd(excludeCustValue);
            closeDialog();
            break;
          case "update":
            onExcludeCustUpdate(excludeCustValue, currentIndex);
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

    const excludeCustEvent = {
      onEventChange: (evt) => {
        if (evt.target.value === "") {
          excludeCustRef.current.innerHTML = "Nama pelanggan harus di isi";
        } else {
          excludeCustRef.current.innerHTML = "";
          setExcludeCustValue(evt.target.value);
        }
      },
    };

    const onDialogClose = () => {
      setExcludeCustValue("");
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
                    <form id="form-exclude" onSubmit={onSubmit}>
                      <label className="block text-sm font-medium text-gray-700">
                        Alias Pelanggan
                      </label>
                      <input
                        type="text"
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="Masukkan alias pelanggan yang akan diabaikan"
                        onBlur={excludeCustEvent.onEventChange}
                        onChange={excludeCustEvent.onEventChange}
                        id="excludeCust"
                        defaultValue={excludeCustValue}
                      ></input>
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={excludeCustRef}
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
                        form="form-exclude"
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

export default ExcludeCustDialog;
