import { app, dialog } from "electron";

const about = () => {
  const options = {
    type: "info",
    buttons: [],
    title: "Tentang Fakturi",
    message: `Fakturi - E-Faktur import file generator | Versi: ${app.getVersion()}`,
    detail:
      "Mudah input data ke aplikasi E-Faktur\nInfo lebih lanjut hubungi\nHermansyah\nEmail: me@hermansyah.dev",
  };

  dialog.showMessageBox(null, options);
};

export { about };
