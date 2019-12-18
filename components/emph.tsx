import styled from "styled-components";
import { primaryColor, secondaryColor } from "../utils/theme";

const Emph = styled.span<{ secondary?: boolean }>`
  color: ${({ secondary }): string =>
    secondary ? secondaryColor : primaryColor};
`;

export default Emph;
