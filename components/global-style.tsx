import { createGlobalStyle } from "styled-components";
import styledNormalize from "styled-normalize";
import { bodyFont } from "../utils/theme";

const globalStyle = createGlobalStyle`
  ${styledNormalize}

  body {
    font-family: ${bodyFont}
  }
`;

export default globalStyle;
