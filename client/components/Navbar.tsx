import { usePlaylistUpdates } from "@client/hooks/use-playlist-updates.hook";
import { useAppStore } from "@client/store/appStore";
import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { Anchor } from "./Anchor";
import { SpotifyIcon } from "./Icons/Spotify";
import { SearchBox } from "./SearchBox";

const NavbarContainer = styled.header`
  padding: 1rem 2rem;
  background-color: #eaecf1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.5rem;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;

  @media screen and (min-width: 601px) {
    justify-self: start;
  }
`;

const PlaylistLink = styled.div`
  a {
    background-color: #1ed760;
    color: #191414;

    &:hover {
      background-color: #1db954;
      color: #ffffff;
    }
  }
  @media screen and (min-width: 601px) {
    justify-self: end;
  }
`;

export const Navbar = () => {
  const { userId } = useAppStore();
  const { data: playlist } = usePlaylistUpdates(userId, !!userId);

  return (
    <NavbarContainer>
      <Brand>
        <Link to="/">
          <img src="/cookie-jar.png" alt="Cookie Jar" width="36px" />
        </Link>

        <h1>Cookie Jar</h1>
      </Brand>

      <SearchBox />

      {playlist && (
        <PlaylistLink>
          <Anchor
            link={playlist.playlist.external_urls.spotify}
            text="Open"
            variant="secondary"
            icon={<SpotifyIcon size={24} strokeWidth={1.5} />}
            isExternal
          />
        </PlaylistLink>
      )}
    </NavbarContainer>
  );
};
