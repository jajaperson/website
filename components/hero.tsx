import styled from "styled-components";
import { darkBackgroundRadial } from "../utils/theme";

const Hero = styled.header`
  width: 100vw;
  height: 100vh;
  background-image: ${darkBackgroundRadial};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HeroContent = styled.div`
  max-width: 600px;
  margin: 50px;
`;

export const HeroText = styled.h1`
  font-size: 2.5em;
`;

export default Hero;
