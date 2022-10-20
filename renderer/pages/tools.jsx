import React, { Fragment, useRef, useEffect } from "react";
import electron from "electron";
import Head from "next/head";
import Navbar from "../components/layouts/navbar";
import Content from "../components/layouts/content";
import FormDegenerate from "../components/forms/formDegenerator";
import ProgressDialog from "../components/dialogs/progressDialog";
import MessageDialog from "../components/dialogs/messageDialog";
import Footer from "../components/footer/footer";
import {
  isValidProperties as DegenerateIsValid,
  useDegenerateProperties as DegenerateProp,
} from "../context/globalDegenerate";

const ipcRenderer = electron.ipcRenderer || false;

function Tools() {
  const propData = DegenerateProp();
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

  const onDegenerateClicked = (evt) => {
    const validator = DegenerateIsValid();
    if (validator === true) {
      progressDialogRef.current.updateProgress(
        "Persiapan",
        "Mempersiapkan aplikasi"
      );
      progressDialogRef.current.openDialog();
      ipcRenderer.invoke("degenerateProcess", propData);
    } else {
      messageDialogRef.current.updateTitle("Kesalahan");
      messageDialogRef.current.updateMessage(validator.message);
      messageDialogRef.current.openDialog();
    }
  };

  return (
    <Fragment>
      <Head>
        <title>Fakturi</title>
      </Head>
      <Navbar currentPage="Tools"></Navbar>
      <Content>
        <FormDegenerate onDegenerateClicked={onDegenerateClicked} />
        <ProgressDialog title="Mengkonversi file" ref={progressDialogRef} />
        <MessageDialog ref={messageDialogRef} />
      </Content>
      <Footer />
    </Fragment>
  );
}

export default Tools;
