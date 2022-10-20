export class DegenerateProperties {
  constructor() {
    this.file = "";
    this.invoice = 1;
    this.month = null; // tax month period start from 0 as January. if null then select all.
    this.year = null; // tax year period. if null then select all
  }
}
