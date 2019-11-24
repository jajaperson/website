import React from "react";
import App, { Container, AppContext } from "next/app";
import GlobalStyle from "../components/global-style";

export default class CustomApp extends App {
  static async getInitialProps({ Component, ctx }: AppContext) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
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
