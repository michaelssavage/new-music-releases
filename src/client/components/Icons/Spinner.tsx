import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Dash animation
const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

export const SpinnerStyled = styled.svg`
  display: block;
  margin: 0 auto;
  transform-origin: center;
  animation: ${rotate} 2s linear infinite;
  
  circle {
    stroke: currentColor;
    stroke-width: 4;
    stroke-linecap: round;
    fill: none;
    animation: ${dash} 1.5s ease-in-out infinite;
  }
`;

export const Spinner = ({ size = 24, color = "currentColor" }) => {
	return (
		<SpinnerStyled
			role="img"
			aria-label="Loading spinner"
			width={size}
			height={size}
			viewBox="0 0 50 50"
			xmlns="http://www.w3.org/2000/svg"
			color={color}
		>
			<circle cx="25" cy="25" r="20" />
		</SpinnerStyled>
	);
};
