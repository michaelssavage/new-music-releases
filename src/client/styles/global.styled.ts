import { css } from "@emotion/react";
import { resetStyles } from "./abstracts/reset.styled.ts";

export const globalStyles = () => css`
  ${resetStyles}

  body {
    margin: 0;
    padding: 0;
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    overflow-x: hidden;
    min-height: 100vh;
    transition:
      color 0.5s,
      background-color 0.5s;
    font-size: 16px;
    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    text-wrap: balance;
  }

`;
