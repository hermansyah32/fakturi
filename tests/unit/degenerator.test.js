import dayjs from "dayjs";
import { resolve } from "path";
import { expect } from "chai";
import { DEFAULT_DEGENERATE_PROP } from "../../constants/degenerateProp";
import * as Degenerator from "../../main/controller/degenerate";
import { assert } from "chai";

let sourceFile = resolve("./tests/res/import.xlsx");
let degenerateProp = DEFAULT_DEGENERATE_PROP;
degenerateProp.file = sourceFile;
const month = null;
const year = 2022;

describe("degenerate testing", async () => {
  it.skip("can read file", async () => {
    try {
      const generate = await Degenerator.preparationData(degenerateProp);
      expect(generate.status).true;

      if (generate.status === false) throw new Error(generate.error);
      const processData = await Degenerator.processDataBook(
        generate.sheetRow,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      if (processData.status === false) throw new Error(processData.error);
      expect(processData.status).true;
    } catch (error) {
      console.error(error);
      assert.ok(false, "Some error happened");
    }
  });

  it("can degenerate excel", async () => {
    try {
      const degenerate = await Degenerator.preparationData(degenerateProp);
      if (degenerate.status === false) throw new Error(degenerate.error);

      const processData = await Degenerator.processDataBook(
        degenerate.sheetRow,
        degenerate.company,
        degenerate.properties,
        degenerate.outputFolder
      );
      if (processData.status === false) throw new Error(processData.error);

      const processCounted = await Degenerator.processCounted(
        processData.dataBook,
        degenerate.company,
        degenerate.properties,
        degenerate.outputFolder
      );
      if (processCounted.status === false)
        throw new Error(processCounted.error);

      const processOrdered = await Degenerator.processOrdered(
        processData.orderedDataBook,
        degenerate.company,
        degenerate.properties,
        degenerate.outputFolder
      );
      if (processOrdered.status === false)
        throw new Error(processOrdered.error);

      const processTransaction = await Degenerator.processTransaction(
        processData.orderedDataBook,
        degenerate.company,
        degenerate.properties,
        degenerate.outputFolder
      );
      if (processTransaction.status === false)
        throw new Error(processTransaction.error);

      const processInvoice = await Degenerator.processInvoice(
        processData.orderedDataBook,
        degenerate.company,
        degenerate.properties,
        degenerate.outputFolder
      );

      expect(processInvoice.status).true;
      if (processInvoice.status === false)
        throw new Error(processInvoice.error);
    } catch (error) {
      console.error(error);
      assert.ok(false, "Some error happened");
    }
  });
});
