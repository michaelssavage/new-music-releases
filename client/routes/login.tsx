import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { YouTube } from "@client/components/YouTube";
import { requireUnauth } from "@client/utils/auth";
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

  h1,
  button,
  a {
    font-size: 1rem;
  }

  button {
    white-space: nowrap;
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
        <p>
          New music releases from Spotify updated daily into a playlist. Artists
          can be added to favourites for tracking. View the project on Github
          below.
        </p>

        <Group align="center" width="100%">
          <Button onClick={handleSignIn} text="Log in with Spotify" />
          <Anchor
            link="https://github.com/michaelssavage/new-music-releases"
            text="Github"
            variant="button"
            isExternal
          />
        </Group>

        <Header>Demo</Header>
        <YouTube videoId="ZRKtVVj2P0s" />
      </Page>
    </LoginPage>
  );
}
