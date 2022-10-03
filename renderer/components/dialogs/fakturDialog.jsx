import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useRef } from "react";
import Cleave from "cleave.js/react";
import React, { forwardRef, useImperativeHandle } from "react";
const { getYear } = require("../../context/globalGenerate");

const validateFaktur = (values, refs) => {
  let result = true;
  refs.forEach((ref, index) => {
    if (ref) ref.current.innerHTML = "";
    else return;
    const pattern = `\\d{3}-${getYear().toString().slice(-2)}-\\d{8}`;
    const regex = new RegExp(pattern, "g");
    if (!regex.test(values[index])) {
      ref.current.innerHTML = "Faktur yang Anda input tidak sesuai";
      result = false;
    }
  });
  return result;
};

const FakturDialog = forwardRef(
  ({ state, faktur, onFakturAdd, onFakturUpdate, title }, ref) => {
    const [open, setOpen] = useState(false);
    const [fakturValue, setFakturValue] = useState(faktur ?? []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const fakturFirstSpanRef = useRef();
    const fakturLastSpanRef = useRef();

    const fakturOptions = {
      delimiters: ["-", "-"],
      blocks: [3, 2, 8],
      numericOnly: true,
    };

    const openDialog = () => {
      setOpen(true);
    };

    const closeDialog = () => {
      setOpen(false);
      onDialogClose();
    };

    const updateCurrent = (newFaktur, index = 0) => {
      setFakturValue(newFaktur);
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
      if (
        validateFaktur(fakturValue, [fakturFirstSpanRef, fakturLastSpanRef])
      ) {
        switch (state) {
          case "add":
            onFakturAdd(fakturValue[0], fakturValue[1]);
            closeDialog();
            break;
          case "update":
            onFakturUpdate(fakturValue[0], fakturValue[1], currentIndex);
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

    const fakturFirstEvent = {
      onEventChanged: (evt) => {
        const result = validateFaktur(
          [evt.target.value, null],
          [fakturFirstSpanRef, null]
        );
        if (result) fakturValue[0] = evt.target.value;
      },
    };

    const fakturLastEvent = {
      onEventChanged: (evt) => {
        const result = validateFaktur(
          [null, evt.target.value],
          [null, fakturLastSpanRef]
        );
        if (result) fakturValue[1] = evt.target.value;
      },
    };

    const onDialogClose = () => {
      setFakturValue(["", ""]);
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
                      className="text-lg font-medium leading-6 text-gray-900 mb-3"
                    >
                      {title}
                    </Dialog.Title>
                    <form id="form-faktur" onSubmit={onSubmit}>
                      <label className="block text-sm font-medium text-gray-700">
                        Faktur Awal
                      </label>
                      <Cleave
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 mt-1 form-input"
                        placeholder="000-00-00000000"
                        options={fakturOptions}
                        value={fakturValue[0]}
                        onBlur={fakturFirstEvent.onEventChanged}
                        onChange={fakturFirstEvent.onEventChanged}
                        id="fakturFirst"
                      />
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={fakturFirstSpanRef}
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        Faktur Awal
                      </label>
                      <Cleave
                        className="focus:ring-gray-600 focus:border-gray-600 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 mt-1 form-input"
                        placeholder="000-00-00000000"
                        options={fakturOptions}
                        value={fakturValue[1]}
                        onBlur={fakturLastEvent.onEventChanged}
                        onChange={fakturLastEvent.onEventChanged}
                        id="fakturLast"
                      />
                      <p
                        className="mt-1 text-sm text-red-600 italic"
                        ref={fakturLastSpanRef}
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
                        form="form-faktur"
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

export default FakturDialog;
