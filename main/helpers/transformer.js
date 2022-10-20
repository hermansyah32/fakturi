import { app } from "electron";
import * as xPath from "path";
const isProd = process.env.NODE_ENV === "production";

let sheet = {
  cell: (value) => {
    if (typeof value === undefined) {
      value = "";
    }
    return value;
  },
  /** @return {Number|null} */
  cellNumber: (value) => {
    if (typeof value === undefined) {
      value = null;
    }
    return Number(value);
  },
  safeValue: (value) => {
    if (typeof value !== "string") {
      value = value.toString();
    }
    if (value.length > 28) {
      value = value.substring(0, 28);
    }
    value = value.replace("/", "|");
    value = value.replace("\\", "-");
    return value;
  },
  originValue: (value) => {
    if (value.length > 28) {
      value = value.substring(0, 28);
    }
    value = value.replace("|", "/");
    value = value.replace("-", "\\");
    return value;
  },
};

let number = {
  zpad: (n, len) => {
    return (0).toFixed(len).slice(2, -n.toString().length) + n.toString();
  },
  zpadNumber: (n, len) => {
    return parseFloat(
      (0).toFixed(len).slice(2, -n.toString().length) + n.toString()
    );
  },
  zpadrange: (n, min, max) => {
    n = parseFloat(n);
    if (Math.abs(n) % 1 > 0) return n.toFixed(max);
    return n.toFixed(min);
  },
  thousand: (value) => {
    return String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1,");
  },
};

let currency = {
  ToWords: (value) => {
    if (value === 0) return "nol";
    if (value < 0) return "minus " + currency.ToWords(Math.abs(value));

    let words = "";

    if (Math.floor(value / 1000000000000) > 0) {
      words += currency.ToWords(Math.floor(value / 1000000000000)) + " trilun ";
      value = value % 1000000000000;
    }

    if (Math.floor(value / 1000000000) > 0) {
      words += currency.ToWords(Math.floor(value / 1000000000)) + " miliar ";
      value = value % 1000000000;
    }

    if (Math.floor(value / 1000000) > 0) {
      words += currency.ToWords(Math.floor(value / 1000000)) + " juta ";
      value = value % 1000000;
    }

    if (Math.floor(value / 1000) >= 2) {
      words += currency.ToWords(Math.floor(value / 1000)) + " ribu ";
      value = value % 1000;
    } else if (value / 1000 == 1) {
      words += "seribu";
      value = value % 1000;
    }

    if (Math.floor(value / 100) >= 2) {
      words += currency.ToWords(Math.floor(value / 100)) + " ratus ";
      value = value % 100;
    } else if (Math.floor(value / 100) == 1) {
      words += "seratus";
      value = value % 100;
    }

    if (value > 0) {
      let unitsMap = [
        "nol",
        "satu",
        "dua",
        "tiga",
        "empat",
        "lima",
        "enam",
        "tujuh",
        "delapan",
        "sembilan",
        "sepuluh",
        "sebelias",
        "dua belas",
        "tiga belas",
        "empat belas",
        "lima belas",
        "enam belas",
        "tujuh belas",
        "delapan belas",
        "sembilan belas",
      ];

      if (value < 20) words += unitsMap[value];
      else {
        if (Math.floor(value / 10) > 1)
          words += unitsMap[Math.floor(value / 10)] + " puluh ";

        if (value % 10 > 0) words += unitsMap[value % 10];
      }
    }

    return words;
  },
  ToRoman: (value) => {
    let numberRoman = {
      1000: "M",
      900: "CM",
      500: "D",
      400: "CD",
      100: "C",
      90: "XC",
      50: "L",
      40: "XL",
      10: "X",
      9: "IX",
      5: "V",
      4: "IV",
      1: "I",
    };

    let result = "";
    Object.keys(numberRoman)
      .reverse()
      .forEach((key) => {
        while (value >= key) {
          result = result + numberRoman[key];
          value = value - key;
        }
      });
    return result;
  },
  FromRoman: (roman) => {
    let romanNumber = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };

    let total = 0;
    let current = 0,
      previous = 0;
    let currentRoman,
      previousRoman = "\0";

    for (let index = 0; index < roman.length; index++) {
      currentRoman = roman[index];
      previous = previousRoman != "\0" ? romanNumber[previousRoman] : "\0";
      current = romanNumber[currentRoman];

      if (previous != 0 && current > previous) {
        total = total - 2 * previous + current;
      } else {
        total += current;
      }

      previousRoman = currentRoman;
    }

    return total;
  },
};

let faktur = {
  format: (value) => {
    return number.zpad(value, 13);
  },
};

let path = {
  getParent: (path, upCount = 1) => {
    if (upCount < 1) return path;
    let pathData = xPath.resolve(path).split(xPath.sep);
    if (upCount >= pathData.length) return path;
    pathData = pathData.filter(
      (val, index) => index < pathData.length - upCount
    );
    return xPath.resolve(pathData.join(xPath.sep));
  },
  getAppPath: () => {
    if (isProd) return xPath.dirname(app.getAppPath());
    return xPath.join(process.cwd(), "/app");
  },
};

export const Transform = {
  sheet: sheet,
  number: number,
  currency: currency,
  faktur: faktur,
  path: path,
};
