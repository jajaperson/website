import React from "react";
import Error from "next/error";
import Head from "next/head";
import Hero, { HeroContent, HeroText } from "../components/hero";
import Emph from "../components/emph";

export default class CustomError extends Error {
  render(): JSX.Element {
    const { statusCode } = this.props;

    return (
      <div>
        <Head>
          <title>{statusCode ? statusCode : "Error"}</title>
        </Head>
        <Hero>
          <HeroContent>
            <HeroText>
              <Emph>
                {statusCode ? `${statusCode}. That's an error.` : "Oh no."}
              </Emph>{" "}
              Looks like something went wrong on {statusCode ? "our" : "your"}{" "}
              end.
            </HeroText>
          </HeroContent>
        </Hero>
      </div>
    );
  }
}
