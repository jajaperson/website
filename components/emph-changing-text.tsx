import React from "react";
import ChangingText from "./changing-text";
import Emph from "./emph";

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
