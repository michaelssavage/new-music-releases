import { Loader } from "@client/components/Loader.tsx";
import styled from "@emotion/styled";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import Cookies from "js-cookie";
import { useEffect } from "react";

export const Wrapper = styled.div`
	margin-top: 2rem;
	padding: 2rem;
`;

export const Route = createFileRoute("/callback")({
	component: Callback,
});

function Callback() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: Route.fullPath });

	useEffect(() => {
		const accessToken = searchParams.access_token;
		const refreshToken = searchParams.refresh_token;

		if (accessToken && refreshToken) {
			Cookies.set("spotify_access_token", accessToken, {
				secure: true,
				sameSite: "Strict",
			});
			Cookies.set("spotify_refresh_token", refreshToken, {
				secure: true,
				sameSite: "Strict",
			});

			navigate({ to: "/" });
		}
	}, [navigate, searchParams]);

	return (
		<Wrapper>
			<Loader />
			<h1>Processing authentication...</h1>
		</Wrapper>
	);
}
