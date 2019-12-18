import React from "react";
import App from "next/app";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import GlobalStyle from "../components/global-style";

config.autoAddCss = false;

export default class CustomApp extends App {
  render(): JSX.Element {
    const { Component, pageProps } = this.props;

    // Do not use this file for anything layout-related, put those in the page
    // files. Load global styles here.
    return (
      <div>
        <GlobalStyle />
        <Component {...pageProps} />
      </div>
    );
  }
}
