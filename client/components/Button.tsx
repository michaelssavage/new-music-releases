import { type SerializedStyles, css } from "@emotion/react";
import styled from "@emotion/styled";
import type { ReactNode } from "react";
import { Spinner, SpinnerStyled } from "./Icons/Spinner";

interface StyledI {
  variant?: string;
  isLoading?: boolean;
  styles?: SerializedStyles;
}

export const Content = styled.div``;

const Text = styled.span``;

export const ButtonStyled = styled.button<StyledI>`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 4px;

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
        background-color: #ebedf5;

        &:hover:not(:disabled) {
          background-color: #a1b7b3;
        }
      `;
    }

    if (variant === "link") {
      return css`
        color: #2650f6;
        background-color: transparent;
        padding: 0;
        margin: 0;
        box-shadow: none;

        &:hover:not(:disabled) {
          color: #1945e3;
          text-decoration: underline;
        }
      `;
    }

    if (variant === "input") {
      return css`
        color: #040c2f91;
        background-color: #ffffff;
        border: 1px solid transparent;

        &:hover:not(:disabled) {
          color: #040c2fd0;
          border: 1px solid #040c2f;
        }
      `;
    }

    if (variant === "ghost") {
      return css`
        color: #1e1e1e;
        border: 1px solid transparent;
        background-color: transparent;
        margin: 0;
        box-shadow: none;

        ${Text} {
          display: none;
        }

        &:hover:not(:disabled) {
          ${Text} {
            display: block;
          }
        }
      `;
    }

    return css`
      background-color: #1ed4b6;

      &:hover:not(:disabled) {
        background-color: #1abda2;
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
    transition: opacity 0.2s;
    height: 24px;
    width: 24px;
  }

  ${({ styles }) => styles};
`;

interface Props {
  onClick: () => void;
  id?: string;
  variant?: "primary" | "secondary" | "remove" | "link" | "ghost" | "input";
  type?: "button" | "submit" | "reset";
  text?: string;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  styles?: SerializedStyles;
}

export const Button = ({
  id,
  onClick,
  variant,
  type = "button",
  text,
  icon,
  loading,
  disabled,
  styles,
}: Props) => {
  return (
    <ButtonStyled
      id={id}
      onClick={onClick}
      variant={variant}
      type={type}
      isLoading={loading}
      disabled={disabled}
      styles={styles}
    >
      <Content>
        {text && <Text>{text}</Text>}
        {icon ? icon : null}
      </Content>
      {loading && <Spinner />}
    </ButtonStyled>
  );
};
