import type { SerializedStyles } from "@emotion/react";
import { type ReactElement, memo } from "react";
import { ExternalLinkIcon } from "./Icons/ExternalLink.tsx";

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
          transition: transform 0.25s, background-color 0.25s;
          &:hover {
            color: #d2d4db;
            background-color: #08433b;
            svg {
              transform: translate(5px, -5px);
              transition: transform 0.25s;
            }
          }
        `;
			case "button":
				return css`
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          gap: 0.5rem;
          color: #1e1e1e;
          background-color: #ebedf5;
          border: 1px solid #505050;
          transition: transform 0.25s, background-color 0.25s;
          &:hover {
            background-color: #c1cbec;
            svg {
              transform: translate(5px, -5px);
              transition: transform 0.25s;
            }
          }
        `;
			case "link":
				return css`
          color: blue;
          text-decoration: underline;
          text-decoration-color: blue;
          position: relative;
          transition: all 0.25s;
          z-index: 4;
          &:before {
            content: "";
            z-index: -1;
            width: 100%;
            height: 0%;
            background: #e1e1ed;
            bottom: 0;
            left: 0;
            position: absolute;
            transition: height 0.25s;
          }
          &:hover {
            border-color: transparent;
            text-decoration: none;
            &:before {
              height: 100%;
            }
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
