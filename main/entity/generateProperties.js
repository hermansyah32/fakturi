import dayjs from "dayjs";
export class GenerateProperties {
  constructor() {
    this.file = "";
    this.invoice = 1;
    this.fakturCode = "01";
    this.month = dayjs().month(); // tax month period start from 0 as January
    this.year = dayjs().year(); // tax year period
    this.date = dayjs().format("YYYY/MM/DD"); // tax report day
    this.faktur = [];
    this.excludeCustomers = [];
    this.specialCustomers = [];
  }
}
