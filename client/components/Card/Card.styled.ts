import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
	flex: 0 0 calc(25% - 1rem);
	flex-wrap: wrap;
	border: 1px solid #a4b4c7;
	border-radius: 4px;

  @media screen and (max-width: 768px) {
    flex: 0 0 calc(33% - 1rem);
  }
  

  @media screen and (max-width: 420px) {
    flex: 0 0 calc(50% - 1rem);
  }

	img {
		width: 100%;
		border-radius: inherit;
	}

  h2 {
		margin: 0.5rem 0 0 0;
    padding: 0 0.25rem;
		text-align: center;
  }
`;

export const Content = styled.div`
	padding: 0.5rem;
`;

export const Fact = styled.p`
  font-size: 1rem;
  padding: 0 0.5rem;
  margin: 0.25rem 0;
`;

export const Genres = styled.p`
  font-size: 0.8rem;
  display: flex;
  flex-wrap: wrap;
`;

export const Artists = styled.p`
  font-size: 0.8rem;
  padding: 0 0.25rem;
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
