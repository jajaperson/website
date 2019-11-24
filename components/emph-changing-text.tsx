import React from "react";
import styled from "styled-components";
import ChangingText from "./changing-text";
import { primaryColor, secondaryColor } from "../utils/theme";

export const Emph = styled.span<{ secondary?: boolean }>`
  color: ${({ secondary }): string =>
    secondary ? secondaryColor : primaryColor};
`;

const EmphChangingText = ({
  alt,
  children,
}: {
  alt: string | React.ReactNode;
  children: React.ReactNode;
}): JSX.Element => (
  <ChangingText alt={<Emph secondary>{alt}</Emph>}>
    <Emph>{children}</Emph>
  </ChangingText>
);

export default EmphChangingText;
