import React from "react";
import Head from "next/head";
import Navbar from "../components/layouts/navbar";
import Content from "../components/layouts/content";
import FormSettingFile from "../components/forms/formSettingFile";
import { Fragment } from "react";
import Footer from "../components/footer/footer";

function Settings() {
  return (
    <Fragment>
      <Head>
        <title>Fakturi</title>
      </Head>
      <Navbar currentPage="settings"></Navbar>
      <Content>
        <FormSettingFile />
      </Content>
      <Footer/>
    </Fragment>
  );
}

export default Settings;
