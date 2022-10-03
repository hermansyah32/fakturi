import React, { useEffect } from "react";
import electron from "electron";
import "../styles/globals.css";

const ipcRenderer = electron.ipcRenderer || false;

const messageHandler = (evt, data) => {
  // console.log("data", data);
};

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    ipcRenderer.on("messenger", messageHandler);
    return () => {
      ipcRenderer.removeListener("messenger", messageHandler);
    };
  }, []);

  return (
    <React.Fragment>
      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
