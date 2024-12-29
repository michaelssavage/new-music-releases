import type { ReactNode } from "react";
import { Group } from "./Group.tsx";

interface Props {
	title?: string;
	children: ReactNode;
	show: boolean;
}

export const Panel = ({ show, title, children }: Props) => {
	if (!show) return `No ${title} found`;

	return (
		<Group direction="column" align="flex-start" width="100%">
			{title && <h1>{title}</h1>}
			<Group align="flex-start" justify="flex-start">
				{children}
			</Group>
		</Group>
	);
};
