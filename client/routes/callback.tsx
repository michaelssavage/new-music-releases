import { Loader } from "@client/components/Loader";
import { useAuthStore } from "@client/store/authStore";
import styled from "@emotion/styled";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useEffect } from "react";

interface AuthSearchParams {
	access_token: string;
	refresh_token: string;
}

export const Page = styled.div`
	margin-top: 2rem;
`;

export const Route = createFileRoute("/callback")({
	component: Callback,
});

function Callback() {
	const navigate = useNavigate();
	const searchParams = useSearch({
		from: Route.fullPath,
		select: (search) => search as AuthSearchParams,
	});
	const { login } = useAuthStore();

	useEffect(() => {
		const accessToken = searchParams.access_token;
		const refreshToken = searchParams.refresh_token;

		if (accessToken && refreshToken) {
			login(accessToken, refreshToken);
			navigate({ to: "/" });
		}
	}, [navigate, login, searchParams]);

	return (
		<Page>
			<Loader />
			<h1>Processing authentication...</h1>
		</Page>
	);
}
