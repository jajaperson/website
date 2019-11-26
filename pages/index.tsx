import React from "react";
import Head from "next/head";
import Hero, { HeroContent, HeroText } from "../components/hero";
import EmphChangingText from "../components/emph-changing-text";
import ChangingText from "../components/changing-text";
import Socials from "../components/socials";

const Home = (): JSX.Element => (
  <div>
    <Head>
      <title>jaj•a•person</title>
    </Head>
    <Hero>
      <HeroContent>
        <HeroText>
          <EmphChangingText alt={"/dʒædʒ•\u200Bə•\u200Bpəːs(ə)n/"}>
            jaj•{"\u200B"}a•{"\u200B"}person
          </EmphChangingText>{" "}
          is a <ChangingText alt="nerd">human being</ChangingText> with mediocre
          programming and design skills.
        </HeroText>
        <Socials />
      </HeroContent>
    </Hero>
  </div>
);

export default Home;
