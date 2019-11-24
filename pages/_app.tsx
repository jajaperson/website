import React from "react";
import App, { Container } from "next/app";
import GlobalStyle from "../components/global-style";
import {
  AppContextType,
  AppInitialProps,
} from "next/dist/next-server/lib/utils";
import { Router } from "next/dist/client/router";

export default class CustomApp extends App {
  static async getInitialProps({
    Component,
    ctx,
  }: AppContextType<Router>): Promise<AppInitialProps> {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render(): JSX.Element {
    const { Component, pageProps } = this.props;

    // Do not use this file for anything layout-related, put those in the page
    // files. Load global styles here.
    return (
      <Container>
        <GlobalStyle />
        <Component {...pageProps} />
      </Container>
    );
  }
}
