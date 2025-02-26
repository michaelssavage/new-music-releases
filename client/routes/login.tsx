import { Button, Content } from "@client/components/Button";
import { requireUnauth } from "@client/utils/auth";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";

const NavBox = styled.h1`
  padding: 3rem 2rem;
  background-color: #8090c0;
	text-align: center;
	color: #f9f5f4;
`;

const Page = styled.div`
  margin: 5rem auto 1rem;
	max-width: 500px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: flex-start;
	gap: 1rem;

	li {
		font-size: 1.6rem;
	}

	h1, button {
		font-size: 1.4rem;
	}

	button {
		white-space: nowrap;
	}
`;

const customLoginStyles = css`
	width: 100%;
	${Content} {
		justify-content: center;
	}
`;

export const Route = createFileRoute("/login")({
	beforeLoad: async () => await requireUnauth(),
	component: Login,
});

function Login() {
	const handleSignIn = () => {
		window.location.href = "/api/login";
	};

	return (
		<div>
			<NavBox>New Music Releases</NavBox>

			<Page>
				<ul>
					<li>Get new music releases from Spotify right in your playlist.</li>
					<li>Add artist to your favourites for tracking.</li>
				</ul>
				<Button
					onClick={handleSignIn}
					text="Sign in"
					styles={customLoginStyles}
				/>
			</Page>
		</div>
	);
}
