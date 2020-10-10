import React from "react";
import Head from "next/head";
import Hero, { HeroContent, HeroText } from "../components/hero";
import Emph from "../components/emph";

const Custom404 = (): JSX.Element => (
  <div>
    <Head>
      <title>404</title>
    </Head>
    <Hero>
      <HeroContent>
        <HeroText>
          <Emph>404. That&apos;s an error.</Emph> Looks like that page
          doesn&apos;t exist.
        </HeroText>
      </HeroContent>
    </Hero>
  </div>
);

export default Custom404;
