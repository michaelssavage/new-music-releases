import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Spinner } from "./Icons/Spinner.tsx";

const ButtonStyled = styled.button<{ variant?: string; loading?: boolean }>`
	margin: 0.5rem 0;
	padding: 0.5rem 0.75rem;
	border-radius: 4px;
	${({ variant }) => {
		if (variant === "remove")
			return css`
        color: #f5faf7;
        background-color: #e63946;

        &:hover:not(:disabled) {
          color: #f5faf7;
          background-color: #7f0f18;
        }
        `;

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

  span {
    grid-column: 1;
    grid-row: 1;
    opacity: ${({ loading }) => (loading ? 0 : 1)};
    transition: opacity 0.2s;
  }

  svg {
    grid-column: 1;
    grid-row: 1;
    opacity: ${({ loading }) => (loading ? 1 : 0)};
    transition: opacity 0.2s;
    height: 24px;
    width: 24px;
  }

`;

interface Props {
	onClick: () => void;
	variant?: string;
	type?: "button" | "submit" | "reset";
	text: string;
	loading?: boolean;
	disabled?: boolean;
}

export const Button = ({
	onClick,
	variant,
	type = "button",
	text,
	loading,
	disabled,
}: Props) => {
	return (
		<ButtonStyled
			onClick={onClick}
			variant={variant}
			type={type}
			loading={loading}
			disabled={disabled}
		>
			<span>{text}</span>
			<Spinner />
		</ButtonStyled>
	);
};
