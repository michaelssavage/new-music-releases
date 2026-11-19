import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 200px));
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #a4b4c7;
  border-radius: 4px;
  position: relative;

  img {
    width: 100%;
    border-radius: inherit;
  }

  h2 {
    margin: 0.5rem 0 0 0;
    padding: 0 4px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 4px 8px;
`;

export const ImageLink = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #ffffff;

  svg {
    width: 16px;
    height: 16px;
  }

  a {
    color: #000000;
  }
`;

export const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;

  button {
    width: 100%;
  }
`;

export const Fact = styled.p`
  font-size: 1rem;
  margin: 0.25rem 0;
`;

export const Genres = styled.p`
  font-size: 0.8rem;
  display: flex;
  flex-wrap: wrap;
`;

export const Artists = styled.p`
  font-size: 0.8rem;
  padding: 0 4px;
  display: flex;
  flex-wrap: wrap;
`;

// TODO: REMOVE WHEN BUTTON COMPONENT IS IMPLEMENTED
export const Button = styled.button<{ variant?: string }>`
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  ${({ variant }) => {
    if (variant === "remove")
      return css`
        color: #f5faf7;
        background-color: #e63946;

        &:hover {
          color: #f5faf7;
          background-color: #7f0f18;
        }
      `;

    return css`
      background-color: #0cb57c;

      &:hover {
        color: #f5faf7;
        background-color: #055a3e;
      }
    `;
  }};
`;
