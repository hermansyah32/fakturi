import { app } from "electron";

export const restart = () => {
  app.relaunch();
  app.exit();
};
