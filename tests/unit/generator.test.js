import dayjs from "dayjs";
import { resolve } from "path";
import { expect } from "chai";
import { DEFAULT_GENERATE_PROP } from "../../constants/generateProp";
import * as Generator from "../../main/controller/generate";
import { assert } from "chai";

let sourceFile = resolve("./tests/res/source.xlsx");
let generateProp = DEFAULT_GENERATE_PROP;
generateProp.file = sourceFile;
const shortYear = dayjs(generateProp.tanggal, "YYYY/MM/DD").format("YY");
generateProp.faktur = [[`123-${shortYear}-00000000`, `123-${shortYear}-00000100`]];

describe("generate testing", async () => {
  it.skip("can read file", async () => {
    try {
      const generate = await Generator.preparationData(generateProp);
      console.log('generate :>> ', generate);
      expect(generate.status).true;

      if (generate.status === false) throw new Error(generate.error);
      const processData = await Generator.processDataBook(
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

  it("can generate excel", async () => {
    try {
      const generate = await Generator.preparationData(generateProp);
      if (generate.status === false) throw new Error(generate.error);

      const processData = await Generator.processDataBook(
        generate.sheetRow,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      if (processData.status === false) throw new Error(processData.error);

      const processCounted = await Generator.processCounted(
        processData.dataBook,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      if (processCounted.status === false)
        throw new Error(processCounted.error);

      const processOrdered = await Generator.processOrdered(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      if (processOrdered.status === false)
        throw new Error(processOrdered.error);

      const processTransaction = await Generator.processTransaction(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      if (processTransaction.status === false)
        throw new Error(processTransaction.error);

      const processImport = await Generator.processImport(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder
      );
      if (processImport.status === false)
        throw new Error(processImport.error);

      const processInvoice = await Generator.processInvoice(
        processData.orderedDataBook,
        generate.company,
        generate.properties,
        generate.outputFolder
      );

      expect(processInvoice.status).true;
      if (processInvoice.status === false) throw new Error(processInvoice.error);
    } catch (error) {
      console.error(error);
      assert.ok(false, "Some error happened");
    }
  });
});
