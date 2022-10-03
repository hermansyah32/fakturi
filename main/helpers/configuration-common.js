import path from "path";
import { app } from "electron";
import {
  readFileSync,
  writeFileSync,
  accessSync,
  constants,
  existsSync,
} from "fs";
import { getDesktopFolder } from "platform-folders";
import { DEFAULT_CONFIG } from "../../constants/appConfig";
import { Transform } from "./transformer";
const isProd = process.env.NODE_ENV === "production";

export const LocalConfig = () => {
  let _configFile;
  let _writeableConfigFile;
  let _data = DEFAULT_CONFIG;

  let _jsonData = "";
  _writeableConfigFile = true;

  const writeFile = () => {
    if (_writeableConfigFile) {
      try {
        writeFileSync(_configFile, JSON.stringify(_data));
      } catch (error) {
        console.log("Write file error :>> ", error);
      }
    }
  };

  try {
    if (!app) throw new Error("app is not available");
    _configFile = Transform.path.getAppPath() + "/configuration.json";
    if (isProd)
      _configFile = Transform.path.getAppPath() + "/configuration.json";
    else _configFile = Transform.path.getAppPath() + "/configuration.json";
    if (!existsSync(_configFile)) {
      DEFAULT_CONFIG.configOutput = path.resolve(
        getDesktopFolder() + "/" + DEFAULT_CONFIG.companyName
      );
      _jsonData = DEFAULT_CONFIG;
      writeFile();
    }
    accessSync(_configFile, constants.R_OK | constants.W_OK);
    _jsonData = JSON.parse(readFileSync(_configFile));
    accessSync(_jsonData.configOutput, constants.R_OK | constants.W_OK);
  } catch (error) {
    // TODO: Log error here
    DEFAULT_CONFIG.configOutput = path.resolve(
      getDesktopFolder() + "/" + DEFAULT_CONFIG.companyName
    );
    _jsonData = DEFAULT_CONFIG;
    _writeableConfigFile = false;
  } finally {
    _data = _jsonData;
  }

  return {
    setToDefault() {
      DEFAULT_CONFIG.configOutput =
        getDesktopFolder() + "/" + _data.companyName;
      _data = DEFAULT_CONFIG;
    },
    set(name, value) {
      if (DEFAULT_CONFIG[name] !== undefined) {
        _data[name] = value;
        writeFile();
      }
    },
    get(name) {
      if (name === "all") return _data;
      return _data[name] ?? null;
    },
  };
};
