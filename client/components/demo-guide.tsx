import styled from "@emotion/styled";

const Container = styled.div`
  max-width: 700px;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2``;

const SubHeader = styled.p`
  font-size: 1.1rem;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const Demo = styled.video`
  width: 100%;
  background: #000;
`;

export const DemoGuide = () => {
  return (
    <>
      <Container>
        <Header>App Demo</Header>
        <SubHeader>
          Track artists via the search bar, your liked songs, or your followed
          artists.
        </SubHeader>
        <Demo
          src="/demo-video.mp4"
          muted
          playsInline
          controls
          preload="metadata"
        >
          Your browser does not support the demo video.
        </Demo>
      </Container>

      <Container>
        <Header>Spotify Demo</Header>
        <SubHeader>
          Track artists via Spotify, and get updates in the Cookie Jar. You
          don't need to use the app after settting it up.
        </SubHeader>
        <Demo
          src="/spotify-only.mp4"
          muted
          playsInline
          controls
          preload="metadata"
        >
          Your browser does not support the demo video.
        </Demo>
      </Container>
    </>
  );
};
