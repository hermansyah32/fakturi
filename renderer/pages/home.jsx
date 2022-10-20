import React from "react";
import electron from "electron";
import { Fragment, useEffect, useRef } from "react";
import Head from "next/head";
import Navbar from "../components/layouts/navbar";
import Footer from "../components/footer/footer";
import FormFile from "../components/forms/formFile";
import FormExclude from "../components/forms/formExclude";
import FormPeriod from "../components/forms/formPeriod";
import FormFaktur from "../components/forms/formFaktur";
import FormSpecial from "../components/forms/formSpecial";
import Content from "../components/layouts/content";
import ProgressDialog from "../components/dialogs/progressDialog";
import MessageDialog from "../components/dialogs/messageDialog";

const {
  useGenerateProperties,
  isValidProperties,
} = require("../context/globalGenerate");

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const propData = useGenerateProperties();
  const progressDialogRef = useRef();
  const messageDialogRef = useRef();

  const progressHandler = (evt, data) => {
    if (data.progress == 100) {
      setTimeout(() => {
        progressDialogRef.current.closeDialog();
      }, 3000);
      return;
    }
    progressDialogRef.current.openDialog();
    progressDialogRef.current.updateProgress(data.progress, data.message);
  };

  useEffect(() => {
    ipcRenderer.on("generateProgress", progressHandler);
    return () => {
      ipcRenderer.removeListener("generateProgress", progressHandler);
    };
  }, []);

  return (
    <Fragment>
      <Head>
        <title>Fakturi</title>
      </Head>
      <Navbar
        onGenerateClick={(e) => {
          const validator = isValidProperties();
          if (validator === true) {
            progressDialogRef.current.updateProgress(
              "Persiapan",
              "Mempersiapkan aplikasi"
            );
            progressDialogRef.current.openDialog();
            ipcRenderer.invoke("generateProcess", propData);
          } else {
            messageDialogRef.current.updateTitle("Kesalahan");
            messageDialogRef.current.updateMessage(validator.message);
            messageDialogRef.current.openDialog();
          }
        }}
        currentPage="home"
      ></Navbar>
      <Content>
        <FormFile />
        <FormPeriod />
        <FormFaktur />
        <FormExclude />
        <FormSpecial />
        <ProgressDialog title="Mengkonversi file" ref={progressDialogRef} />
        <MessageDialog ref={messageDialogRef} />
      </Content>
      <Footer/>
    </Fragment>
  );
}

export default Home;
