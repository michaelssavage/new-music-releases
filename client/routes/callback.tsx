import { Loader } from "@client/components/Loader";
import { useAppStore } from "@client/store/appStore";
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
	user_id: number;
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
	const { login } = useAppStore();

	useEffect(() => {
		const { access_token, refresh_token, user_id } = searchParams;

		if (access_token && refresh_token && user_id) {
			login(access_token, refresh_token, user_id.toString());
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
