import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { Group } from "@client/components/Group";
import { requireUnauth } from "@client/utils/auth";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";

const NavBox = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;
  text-align: center;
  color: #f9f5f4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Page = styled.div`
  margin: 2rem auto 1rem;
  max-width: 500px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;

  button,
  a {
    font-size: 1rem;
  }

  p {
    font-size: 1.2rem;
  }

  button {
    white-space: nowrap;
  }
`;

const LoginPage = styled.div`
  margin-bottom: 2rem;
`;

const Header = styled.h2`
  margin-top: 2rem;
`;

const Demo = styled.video`
  width: 100%;
  background: #000;
`;

export const Route = createFileRoute("/login")({
  beforeLoad: async () => await requireUnauth(),
  component: Login,
});

const handleSignIn = () => {
  window.location.href = "/api/login";
};

function Login() {
  return (
    <LoginPage>
      <NavBox>
        <img src="/cookie-jar.png" alt="Cookie jar" width="100px" />
        <h1>New Music Releases</h1>
      </NavBox>

      <Page>
        <Group align="center" width="100%">
          <Button onClick={handleSignIn} text="Log in with Spotify" />
          <Anchor
            link="https://github.com/michaelssavage/new-music-releases"
            text="Github"
            variant="button"
            isExternal
          />

          <p>
            New music releases from Spotify updated daily into a playlist.
            Artists can be added to favourites for tracking. View the project on
            Github below.
          </p>
        </Group>

        <Header>Demo</Header>
        <Demo
          src="/demo-video.mov"
          autoPlay
          muted
          playsInline
          controls
          preload="metadata"
        >
          Your browser does not support the demo video.
        </Demo>
      </Page>
    </LoginPage>
  );
}
