import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKeybase,
  faGithub,
  faMastodon,
  faStackOverflow,
  faTwitter,
  faReddit,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import { textColor, secondaryColor } from "../utils/theme";

const IconsRow = styled.ul`
  font-size: 2em;
  list-style-type: none;
  padding-left: 0;

  li {
    display: inline;
    padding-right: 40px;
    line-height: 55px;

    a {
      text-decoration: none;
      color: ${textColor};

      :hover {
        color: ${secondaryColor};
      }
    }
  }
`;

const Socials = (): JSX.Element => (
  <IconsRow>
    <li>
      <a
        target="_blank"
        href="https://keybase.io/jajaperson"
        rel="noopener noreferrer"
        arial-label="@jajaperson on Keybase"
      >
        <FontAwesomeIcon icon={faKeybase} />
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://github.com/jajaperson"
        rel="noopener noreferrer"
        arial-label="@jajaperson on GitHub"
      >
        <FontAwesomeIcon icon={faGithub} />
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://mastodon.social/@jajaperson"
        rel="me noopener noreferrer"
        arial-label="@jajaperson on mastodon.social"
      >
        <FontAwesomeIcon icon={faMastodon} />
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://stackoverflow.com/users/8230473/james-jensen"
        rel="noopener noreferrer"
        arial-label="James Jensen on StackOverflow"
      >
        <FontAwesomeIcon icon={faStackOverflow} />
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://twitter.com/jajaperson"
        rel="noopener noreferrer"
        arial-label="@jajaperson on Twitter"
      >
        <FontAwesomeIcon icon={faTwitter} />
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://reddit.com/u/jajaperson"
        rel="noopener noreferrer"
        arial-label="u/jajaperson on reddit"
      >
        <FontAwesomeIcon icon={faReddit} />
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://www.instagram.com/jajaperson/"
        rel="noopener noreferrer"
        arial-label="@jajaperson in Instagram"
      >
        <FontAwesomeIcon icon={faInstagram} />
      </a>
    </li>
  </IconsRow>
);

export default Socials;
