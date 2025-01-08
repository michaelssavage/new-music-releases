import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const animation1 = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`;

const animation2 = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
`;

const animation3 = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
`;

const Ellipsis = styled.div`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;

  div {
    box-sizing: border-box;
  position: absolute;
  top: 33.33333px;
  width: 13.33333px;
  height: 13.33333px;
  border-radius: 50%;
  background: currentColor;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }

  div:nth-of-type(1) {
    left: 8px;
    animation: ${animation1} 0.6s infinite;
  }
  div:nth-of-type(2) {
    left: 8px;
    animation: ${animation2} 0.6s infinite;
  }
  div:nth-of-type(3) {
    left: 32px;
    animation: ${animation2} 0.6s infinite;
  }
  div:nth-of-type(4) {
    left: 56px;
    animation: ${animation3} 0.6s infinite;
  }
`;

export const Loader = () => (
	<Ellipsis>
		{Array.from({ length: 4 }).map((_, index) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
			<div key={index} />
		))}
	</Ellipsis>
);
