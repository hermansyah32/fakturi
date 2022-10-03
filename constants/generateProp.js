import dayjs from "dayjs";

export const DEFAULT_GENERATE_PROP = {
  file: "",
  invoice: 1,
  fakturCode: "01",
  month: dayjs().month(), // masa pajak dimulai dari 0 sebagai januari
  year: dayjs().year(), // tahun pajak
  date: dayjs().format("YYYY/MM/DD"), // tanggal pelaporan
  faktur: [],
  excludeCustomers: [],
  specialCustomers: [],
};
