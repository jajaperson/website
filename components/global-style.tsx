import { createGlobalStyle } from "styled-components";
import styledNormalize from "styled-normalize";
import { bodyFont, darkBackgroundColor, textColor } from "../utils/theme";

const globalStyle = createGlobalStyle`
  ${styledNormalize}

  body {
    background-color: ${darkBackgroundColor};
    font-family: ${bodyFont};
    color: ${textColor};
  }
`;

export default globalStyle;
