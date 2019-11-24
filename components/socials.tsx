import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKeybase,
  faGithub,
  faMastodon,
  faStackOverflow,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { secondaryColor } from "../utils/theme";

const IconsRow = styled.ul`
  font-size: 2em;
  list-style-type: none;
  padding-left: 0;

  li {
    display: inline;
    padding-right: 40px;
    line-height: 55px;

    :hover {
      color: ${secondaryColor};
    }
  }
`;

const Socials = (): JSX.Element => (
  <IconsRow>
    <li onClick={() => window.open("https://keybase.io/jajaperson")}>
      <FontAwesomeIcon icon={faKeybase} />
    </li>
    <li onClick={() => window.open("https://github.com/jajaperson")}>
      <FontAwesomeIcon icon={faGithub} />
    </li>
    <li onClick={() => window.open("https://mastodon.social/@jajaperson")}>
      <FontAwesomeIcon icon={faMastodon} />
    </li>
    <li
      onClick={() =>
        window.open("https://stackoverflow.com/users/8230473/james-jensen")
      }
    >
      <FontAwesomeIcon icon={faStackOverflow} />
    </li>
    <li onClick={() => window.open("https://twitter.com/jajaperson")}>
      <FontAwesomeIcon icon={faTwitter} />
    </li>
    <li onClick={() => window.open("https://www.instagram.com/jajaperson/")}>
      <FontAwesomeIcon icon={faInstagram} />
    </li>
  </IconsRow>
);

export default Socials;
