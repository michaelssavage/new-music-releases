import type { ReactNode } from "react";
import { Group } from "./Group";

interface Props {
	title?: string;
	show?: boolean;
	direction?: "row" | "column";
	children: ReactNode;
}

export const Panel = ({
	show = true,
	title,
	children,
	direction = "row",
}: Props) => {
	if (!show) return `No ${title} found`;

	return (
		<Group direction="column" align="center" width="100%">
			{title && <h1>{title}</h1>}
			<Group align="flex-start" justify="center" direction={direction}>
				{children}
			</Group>
		</Group>
	);
};
