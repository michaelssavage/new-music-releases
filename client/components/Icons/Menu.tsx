interface MenuProps {
	onClick?: () => void;
	size?: number;
	color?: string;
}

export const MenuIcon = (props: MenuProps) => {
	return (
		<svg
			role="img"
			aria-label="menu icon"
			xmlns="http://www.w3.org/2000/svg"
			width={props.size || 24}
			height={props.size || 24}
			viewBox="0 0 24 24"
			fill="none"
			stroke={props.color || "currentColor"}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M4 6h16" />
			<path d="M7 12h13" />
			<path d="M10 18h10" />
		</svg>
	);
};
