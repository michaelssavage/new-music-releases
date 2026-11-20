import { usePlaylistUpdates } from "@client/hooks/use-playlist-updates.hook";
import { useSession } from "@client/hooks/use-session.hook";
import { useAppStore } from "@client/store/appStore";
import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { Anchor } from "./Anchor";
import { SpotifyIcon } from "./Icons/Spotify";
import { SearchBox } from "./SearchBox";

const NavbarContainer = styled.header`
  padding: 1rem 2rem;
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
    border-radius: 12px;
    padding: 0.5rem 1rem;
    color: #ffffff;
    height: auto;
  }
  @media screen and (min-width: 601px) {
    justify-self: end;
  }
`;

export const Navbar = () => {
  const { userId } = useAppStore();
  const { data: session } = useSession();
  const { data: playlist } = usePlaylistUpdates(
    userId,
    !!userId && !!session?.verified,
  );

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
            icon={<SpotifyIcon size={24} strokeWidth={1.5} />}
            isExternal
          />
        </PlaylistLink>
      )}
    </NavbarContainer>
  );
};
