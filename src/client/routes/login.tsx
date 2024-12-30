import { Button } from "@client/components/Button.tsx";
import { requireUnauth } from "@client/utils/isAuthenticated.ts";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";

const NavBox = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;
`;

const Wrapper = styled.div`
  padding: 3rem 2rem;
`;

export const Route = createFileRoute("/login")({
	beforeLoad: async () => await requireUnauth(),
	component: Login,
});

function Login() {
	const handleSignIn = () => {
		window.location.href = "http://localhost:5000/api/login";
	};

	return (
		<div>
			<NavBox />

			<Wrapper>
				<h1>Sign in to Spotify</h1>
				<Button onClick={handleSignIn} text="Sign in" />
			</Wrapper>
		</div>
	);
}
