import { Anchor } from "@client/components/Anchor";
import { Button, Content } from "@client/components/Button";
import { YouTube } from "@client/components/YouTube";
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

	h1, button {
		font-size: 1.2rem;
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

const LoginPage = styled.div`
	margin-bottom: 2rem;
`;

const Header = styled.h2`
	margin-top: ${({ mt }: { mt?: string }) => mt || "4rem"};
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
		<LoginPage>
			<NavBox>New Music Releases</NavBox>

			<Page>
				<Header mt="0">About</Header>
				<p>
					Get new music releases from Spotify right in your playlist. Add artist
					to your favourites for tracking. View project on Github:{" "}
					<Anchor
						link="https://github.com/michaelssavage/new-music-releases"
						variant="link"
						isExternal
					/>
				</p>
				<Button
					onClick={handleSignIn}
					text="Log in with Spotify"
					styles={customLoginStyles}
				/>

				<Header>Demo</Header>
				<YouTube videoId="ZRKtVVj2P0s" />
			</Page>
		</LoginPage>
	);
}
