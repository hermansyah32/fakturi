import { about } from "./helpAction";
import { restart } from "./toolsAction";
const isMac = process.platform === "darwin";

export const template = [
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }],
  },
  // { role: 'viewMenu' }
  {
    label: "Tools",
    submenu: [
      {
        label: "Restart",
        click: () => {
          restart();
        },
      },
    ],
  },
  {
    label: "Tentang",
    submenu: [
      {
        label: "Tentang",
        click: () => {
          about();
        },
      },
    ],
  },
];
