import styled from "@emotion/styled";

interface GroupI {
	direction?: "row" | "column" | "row-reverse" | "column-reverse";
	justify?: "flex-start" | "center" | "flex-end";
	align?: "flex-start" | "center" | "flex-end";
	gap?: string;
	width?: string;
	wrap?: "wrap" | "nowrap";
}

export const Group = styled.div<GroupI>`
	display: flex;
	flex-direction: ${({ direction }) => direction || "row"};
	justify-content: ${({ justify }) => justify || "center"};
	align-items: ${({ align }) => align || "center"};
	gap: ${({ gap }) => gap || "1rem"};
	flex-wrap: ${({ wrap }) => wrap || "wrap"};
  ${({ width }) => width && `width: ${width};`}
`;
