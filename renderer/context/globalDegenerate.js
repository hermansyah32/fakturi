import { useState, useEffect } from "react";
import EventEmiter from "events";
const { DEFAULT_DEGENERATE_PROP } = require("../../constants/degenerateProp");

const DEGENERATE_EVENT = "DEGENERATE_CHANGED";
const emitter = new EventEmiter();

const degenerateProperties = DEFAULT_DEGENERATE_PROP;

export const setFile = (file) => {
  degenerateProperties.file = file;
  emitter.emit(DEGENERATE_EVENT, degenerateProperties);
};

export const getFile = () => {
  return degenerateProperties.file;
};

export const setMonth = (month) => {
  degenerateProperties.month = month;
  emitter.emit(DEGENERATE_EVENT, degenerateProperties);
};

export const getMonth = () => {
  return degenerateProperties.month;
};

export const setYear = (year) => {
  degenerateProperties.year = year;
  emitter.emit(DEGENERATE_EVENT, degenerateProperties);
};

export const getYear = () => {
  return degenerateProperties.year;
};

export const setInvoice = (invoice) => {
  degenerateProperties.invoice = invoice;
  emitter.emit(DEGENERATE_EVENT, degenerateProperties);
};

export const getInvoice = () => {
  return degenerateProperties.invoice;
};

export const resetProperties = () => {
  degenerateProperties = {
    file: "",
    invoice: 0,
    month: null,
    year: null,
  };
  emitter.emit(DEGENERATE_EVENT, degenerateProperties);
};
export const isValidProperties = () => {
  if (degenerateProperties.file === "")
    return { form: "file", message: "File tidak valid" };

  if (degenerateProperties.invoice < 1 || isNaN(degenerateProperties.invoice))
    return { form: "invoice", message: "Nomor invoice tidak valid" };

  if (!degenerateProperties.year) return true;
  
  if (degenerateProperties.year < 1980 || degenerateProperties.year > 2099)
    return {
      form: "period",
      message: "Tahun pajak berkisar antara tahun 1980 sampai 2099",
    };

  return true;
};

export const useDegenerateProperties = () => {
  const [value, setValue] = useState(degenerateProperties);

  useEffect(() => {
    const listener = (properties) => {
      const newProp = { ...properties };
      setValue(newProp);
    };
    emitter.on(DEGENERATE_EVENT, listener);
    return () => emitter.removeListener(DEGENERATE_EVENT, listener);
  }, []);
  return value;
};
