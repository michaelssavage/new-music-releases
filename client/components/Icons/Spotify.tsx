export const SpotifyIcon = ({ size = 24 }) => {
	return (
		<svg
			role="img"
			aria-label="spotify icon"
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
			<path d="M8 11.973c2.5 -1.473 5.5 -.973 7.5 .527" />
			<path d="M9 15c1.5 -1 4 -1 5 .5" />
			<path d="M7 9c2 -1 6 -2 10 .5" />
		</svg>
	);
};
