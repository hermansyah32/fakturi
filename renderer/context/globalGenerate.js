import { useState, useEffect } from "react";
import EventEmiter from "events";
const { DEFAULT_GENERATE_PROP } = require("../../constants/generateProp");
const dayjs = require("dayjs");

const GENERATE_EVENT = "GENERATE_CHANGED";
const emitter = new EventEmiter();

const generateProperties = DEFAULT_GENERATE_PROP;

const isValidFormFile = () => {
  if (generateProperties.file === "") return "File tidak valid";
  if (!isNaN(generateProperties.invoice) && generateProperties.invoice < 1)
    return "Nomor invoice tidak valid";
  if (
    !["01", "02", "03", "04", "05", "06", "07", "08", "09"].includes(
      generateProperties.fakturCode
    )
  )
    return "Kode faktur tidak valid";
  return true;
};

const isValidFormPeriod = () => {
  const firstDate = dayjs()
    .set("month", generateProperties.month)
    .set("year", generateProperties.year)
    .set("date", 1);
  const reportDate = dayjs(generateProperties.tanggal, "YYYY/MM/DD");
  if (reportDate.diff(firstDate, "day") < 0) {
    return "Tanggal pelaporan tidak boleh lebih dahulu dari masa pajak";
  }
  return true;
};

const isValidFormFaktur = () => {
  let result = true;
  let regex = new RegExp(
    `\\d{3}-${dayjs()
      .set("year", generateProperties.year)
      .format("YY")}-\\d{8}`,
    "g"
  );
  if (generateProperties.faktur.length < 1) {
    return "Faktur harus diisi";
  }
  for (const faktur of generateProperties.faktur) {
    const firstFaktur = faktur[0];
    const lastFaktur = faktur[1];
    if (!regex.test(firstFaktur))
      result = `Faktur awal dari "${firstFaktur}" tidak valid`;
    regex = new RegExp(
      `\\d{3}-${dayjs()
        .set("year", generateProperties.year)
        .format("YY")}-\\d{8}`,
      "g"
    );
    if (!regex.test(lastFaktur))
      result = `Faktur akhir dari "${lastFaktur}" tidak valid`;
    if (result !== true) break;
  }
  return result;
};

export const setFile = (file) => {
  generateProperties.file = file;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getFile = () => {
  return generateProperties.file;
};

export const setInvoice = (invoice) => {
  generateProperties.invoice = invoice;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getInvoice = () => {
  return generateProperties.invoice;
};

export const setFakturCode = (fakturCode) => {
  generateProperties.fakturCode = fakturCode;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getFakturCode = () => {
  return generateProperties.fakturCode;
};

export const setMonth = (month) => {
  generateProperties.month = month;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getMonth = () => {
  return generateProperties.month;
};

export const setYear = (year) => {
  generateProperties.year = year;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getYear = () => {
  return generateProperties.year;
};

export const setDate = (date) => {
  const dayjsDate = dayjs(date);
  if (dayjsDate.isValid())
    generateProperties.tanggal = dayjsDate.format("YYYY/MM/DD");
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getDate = () => {
  return generateProperties.tanggal;
};

export const addFaktur = (first, last) => {
  generateProperties.faktur.push([first, last]);
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getFaktur = () => {
  return generateProperties.faktur;
};

export const setFaktur = (fakturs) => {
  generateProperties.faktur = fakturs;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const addExcludeCustomers = (excludeCustomer) => {
  generateProperties.excludeCustomers.push(excludeCustomer);
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const setExcludeCustomers = (excludeCustomers) => {
  generateProperties.excludeCustomers = excludeCustomers;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getExcludeCustomers = () => {
  return generateProperties.excludeCustomers;
};

export const addSpecialCustomers = (specialCustomer) => {
  generateProperties.specialCustomers.push(specialCustomer);
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const setSpecialCustomers = (specialCustomers) => {
  generateProperties.specialCustomers = specialCustomers;
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const getSpecialCustomers = () => {
  return generateProperties.specialCustomers;
};

export const resetProperties = () => {
  generateProperties = {
    file: "",
    invoice: 0,
    fakturCode: "01",
    month: dayjs().month(),
    year: dayjs().year(),
    date: dayjs().format("YYYY/MM/DD"),
    faktur: [],
    excludeCustomers: [],
    specialCustomers: [],
  };
  emitter.emit(GENERATE_EVENT, generateProperties);
};

export const isValidProperties = () => {
  // section form file
  const fileValidator = isValidFormFile();
  if (fileValidator !== true) {
    return {
      form: "file",
      message: fileValidator,
    };
  }
  const periodValidator = isValidFormPeriod();
  if (periodValidator !== true) {
    return {
      form: "period",
      message: periodValidator,
    };
  }
  const fakturValidator = isValidFormFaktur();
  if (fakturValidator !== true) {
    return {
      form: "faktur",
      message: fakturValidator,
    };
  }
  return true;
};

export const useGenerateProperties = () => {
  const [value, setValue] = useState(generateProperties);

  useEffect(() => {
    const listener = (properties) => {
      const newProp = { ...properties };
      setValue(newProp);
    };
    emitter.on(GENERATE_EVENT, listener);
    return () => emitter.removeListener(GENERATE_EVENT, listener);
  }, []);
  return value;
};
