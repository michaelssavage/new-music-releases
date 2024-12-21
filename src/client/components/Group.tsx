import styled from "@emotion/styled";

interface GroupI {
	direction?: string;
	justify?: string;
	align?: string;
	gap?: string;
	width?: string;
}

export const Group = styled.div<GroupI>`
	display: flex;
	flex-direction: ${({ direction }) => direction || "row"};
	justify-content: ${({ justify }) => justify || "center"};
	align-items: ${({ align }) => align || "center"};
	gap: ${({ gap }) => gap || "1rem"};
	flex-wrap: wrap;
  ${({ width }) => width && `width: ${width};`}
`;
