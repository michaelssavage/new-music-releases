interface Props {
	direction: "asc" | "desc" | false;
	size?: number;
}

export const SortIcon = ({ direction, size = 20 }: Props) => {
	if (direction === "desc") {
		return (
			<svg
				role="img"
				aria-label="desc sort icon"
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M4 6l9 0" />
				<path d="M4 12l7 0" />
				<path d="M4 18l7 0" />
				<path d="M15 15l3 3l3 -3" />
				<path d="M18 6l0 12" />
			</svg>
		);
	}
	if (direction === "asc") {
		return (
			<svg
				role="img"
				aria-label="asc sort icon"
				xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M4 6l7 0" />
				<path d="M4 12l7 0" />
				<path d="M4 18l9 0" />
				<path d="M15 9l3 -3l3 3" />
				<path d="M18 6l0 12" />
			</svg>
		);
	}
	return null;
};
