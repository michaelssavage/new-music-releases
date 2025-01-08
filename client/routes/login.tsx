import { Button } from "@client/components/Button";
import { requireUnauth } from "@client/utils/auth";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";

const NavBox = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;
`;

const Page = styled.div`
  margin: 5rem auto 1rem;
	max-width: 500px;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 1rem;

	h1, button {
		font-size: 1.4rem;
	}

	button {
		white-space: nowrap;
	}
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

			<Page>
				<h1>
					Add new music releases to a spotify playlist based on your saved
					favourite artists.
				</h1>
				<div>
					<Button onClick={handleSignIn} text="Sign in" />
				</div>
			</Page>
		</div>
	);
}
