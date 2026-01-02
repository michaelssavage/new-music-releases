import { css, keyframes } from "@emotion/react";

export const slideInAnimation = (
  from: string,
  direction = "vertical",
  duration = "0.25s",
  fillMode = "none"
) => {
  const transform = direction === "horizontal" ? "translateX" : "translateY";

  return css`
    animation: ${keyframes`
      from {
        opacity: 0;
        transform: ${transform}(${from});
      }
      to {
        opacity: 1;
        transform: ${transform}(0px);
      }
    `} ${duration} ${fillMode};
  `;
};
