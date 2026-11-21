import { type SerializedStyles, css } from "@emotion/react";

interface IBreak {
  breakpoint: number;
  styles: SerializedStyles | string;
}

const TABLET_MAX_WIDTH = 768;
const PHONE_MAX_WIDTH = 599;

export const TABLET_QUERY = `(max-width: ${TABLET_MAX_WIDTH}px)`;
export const PHONE_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`;

export const forBreakAt = ({ breakpoint, styles }: IBreak) => css`
  @media (max-width: ${breakpoint}px) {
    ${styles}
  }
`;

export const forTabletOnly = (styles: SerializedStyles | string) => css`
  @media ${TABLET_QUERY} {
    ${styles}
  }
`;

export const forPhoneOnly = (styles: SerializedStyles | string) => css`
  @media ${PHONE_QUERY} {
    ${styles}
  }
`;

export const forDesktopOnly = (styles: SerializedStyles | string) => css`
  @media (min-width: ${TABLET_MAX_WIDTH + 1}px) {
    ${styles}
  }
`;
