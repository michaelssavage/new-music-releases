import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { Spinner, SpinnerStyled } from "./Icons/Spinner.tsx";

const Content = styled.div``;
const Text = styled.span``;

const ButtonStyled = styled.button<{ variant?: string; isLoading?: boolean }>`
	margin: 0.5rem 0;
	padding: 0.5rem 0.75rem;
	border-radius: 4px;
	transition: all 0.2s ease-in-out;

	${({ variant }) => {
		if (variant === "remove") {
			return css`
        color: #f5faf7;
        background-color: #e63946;

        &:hover:not(:disabled) {
          color: #f5faf7;
          background-color: #7f0f18;
        }
        `;
		}

		if (variant === "secondary") {
			return css`
				color: #ebedf5;
				background-color: #1a6e63;

				&:hover:not(:disabled) {
					color: #d2d4db;
					background-color: #08433b;
				}
				`;
		}

		if (variant === "ghost") {
			return css`
        color: #1e1e1e;
				border: 1px solid transparent;
        background-color: transparent;
				margin: 0;

				${Text} {
					visibility: hidden;
				}

				&:hover:not(:disabled) {
					${Text} {
						visibility: visible;
					}
				}
        `;
		}

		return css`
      background-color: #0cb57c;

      &:hover:not(:disabled) {
        color: #f5faf7;
        background-color: #055a3e;
      }
      `;
	}};

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;  

  ${Content} {
    grid-column: 1;
    grid-row: 1;
		opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
    transition: opacity 0.2s;

		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
  }

  ${SpinnerStyled} {
    grid-column: 1;
    grid-row: 1;
		opacity: ${({ isLoading }) => (isLoading ? 1 : 0)};
    transition: opacity 0.2s;
    height: 24px;
    width: 24px;
  }

`;

interface Props {
	onClick: () => void;
	variant?: string;
	type?: "button" | "submit" | "reset";
	text?: string;
	icon?: ReactNode;
	loading?: boolean;
	disabled?: boolean;
}

export const Button = ({
	onClick,
	variant,
	type = "button",
	text,
	icon,
	loading,
	disabled,
}: Props) => {
	return (
		<ButtonStyled
			onClick={onClick}
			variant={variant}
			type={type}
			isLoading={loading}
			disabled={disabled}
		>
			<Content>
				{text && <Text>{text}</Text>}
				{icon ? icon : null}
			</Content>
			<Spinner />
		</ButtonStyled>
	);
};
