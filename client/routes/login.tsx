import { Anchor } from "@client/components/Anchor";
import { Button } from "@client/components/Button";
import { DemoGuide } from "@client/components/demo-guide";
import { Group } from "@client/components/Group";
import { SpotifyIcon } from "@client/components/Icons/Spotify";
import { forPhoneOnly } from "@client/styles/abstracts/mixins.styled";
import { requireUnauth } from "@client/utils/auth";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { createFileRoute } from "@tanstack/react-router";

const NavBox = styled.div`
  padding: 3rem 2rem;
  background-color: #8090c0;
  text-align: center;
  color: #f9f5f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  button {
    border-radius: 12px;
    padding: 0.5rem 1rem;
    color: #ffffff;
    height: auto;
    white-space: nowrap;
    font-size: 1.2rem;
  }

  ${forPhoneOnly(css`
    padding: 2rem 1rem;

    img {
      width: 64px;
    }

    h1 {
      font-size: 1.75rem;
    }

    button {
      font-size: 1rem;
    }
  `)}
`;

const Page = styled.div`
  margin: 2rem auto 1rem;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  p:first-child {
    margin: 2rem 0;
  }

  p,
  a {
    font-size: 1.2rem;

    ${forPhoneOnly("font-size: 1rem;")}
  }
`;

const LoginPage = styled.div`
  margin-bottom: 2rem;
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
        <Group align="center" width="100%" gap="0">
          <img src="/cookie-jar.png" alt="Cookie jar" width="100px" />
          <h1>Cookie Jar</h1>
        </Group>

        <Button
          onClick={handleSignIn}
          text="Log in with Spotify"
          icon={<SpotifyIcon size={24} />}
        />
      </NavBox>

      <Page>
        <p>
          New music releases from Spotify updated daily into the Cookie Jar.
          Track artists and see a genre breakdown of the artists you've seen.
          View the project on{" "}
          <Anchor
            link="https://github.com/michaelssavage/new-music-releases"
            text="Github"
            variant="link"
            isExternal
          />
          .
        </p>

        <DemoGuide />
      </Page>
    </LoginPage>
  );
}
