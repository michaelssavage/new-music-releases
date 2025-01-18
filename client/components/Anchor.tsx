import type { SerializedStyles } from "@emotion/react";
import { type ReactElement, memo } from "react";
import { ExternalLinkIcon } from "./Icons/ExternalLink";

import { css } from "@emotion/react";
import styled from "@emotion/styled";

interface IStyle {
	variant?: AnchorVariants;
	isExternal?: boolean;
}

const LinkStyle = styled.a<IStyle>`
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 4px;
  max-height: 40px;

  svg {
    flex-shrink: 0;
  }

  ${({ variant }) => {
		switch (variant) {
			case "secondary":
				return css`
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          gap: 0.5rem;
          color: #ebedf5;
          background-color: #1a6e63;
          transition: background-color 0.25s;
          &:hover {
            color: #d2d4db;
            background-color: #08433b;
          }
        `;
			case "button":
				return css`
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 4px;
          cursor: pointer;
          gap: 0.5rem;
          color: #eff3f2;
          background: #4e6db0;
          border: 1px solid #4e6db0;
          transition: background-color 0.25s;

          &:hover, &:active {
            background-color: initial;
            background-position: 0 0;
            color: #4e6db0;
          }
        `;
			case "link":
				return css`
          color: blue;
          text-decoration-color: blue;
          position: relative;
          transition: all 0.25s;
          z-index: 4;
          &:hover {
            text-decoration: underline;
          }
        `;
			default:
				return null;
		}
	}}
`;

type AnchorVariants = "button" | "link" | "text" | "secondary";

interface Props {
	link: string;
	text?: string;
	isExternal?: boolean;
	variant?: AnchorVariants;
	icon?: ReactElement;
	style?: SerializedStyles;
}

export const Anchor = memo(
	({ link, text, icon, isExternal = false, variant = "button" }: Props) => {
		return (
			<LinkStyle
				href={link}
				variant={variant}
				isExternal={isExternal}
				rel={isExternal ? "noopener noreferrer" : undefined}
				target={isExternal ? "_blank" : undefined}
			>
				{text ? text : link} {isExternal && !icon ? <ExternalLinkIcon /> : icon}
			</LinkStyle>
		);
	},
);
