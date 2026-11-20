import { usePlaylistUpdates } from "@client/hooks/use-playlist-updates.hook";
import { useSession } from "@client/hooks/use-session.hook";
import { useAppStore } from "@client/store/appStore";
import {
  forPhoneOnly,
  forTabletOnly,
} from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link } from "@tanstack/react-router";
import { Anchor } from "./Anchor";
import { MenuIcon } from "./Icons/Menu";
import { SpotifyIcon } from "./Icons/Spotify";
import { SearchBox } from "./SearchBox";

const NavbarContainer = styled.header`
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  ${forTabletOnly(css`
    padding: 0.75rem 1rem;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    gap: 0.5rem;
  `)}

  ${forPhoneOnly(css`
    padding: 0.5rem 0.75rem;
  `)}
`;

const MenuButton = styled.button`
  display: none;
  color: #1e1e1e;
  background-color: transparent;

  ${forTabletOnly("display: flex;")}
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  justify-self: start;

  h1 {
    ${forPhoneOnly(css`
      font-size: 1.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `)}
  }

  img {
    ${forPhoneOnly("width: 28px;")}
  }
`;

const PlaylistLink = styled.div`
  justify-self: end;

  a {
    border-radius: 12px;
    padding: 0.5rem 1rem;
    color: #ffffff;
    height: auto;

    ${forPhoneOnly(css`
      span {
        display: none;
      }
      padding: 0.5rem;
      height: 34px;
      width: 34px;
      border-radius: 50%;
    `)}
  }
`;

export const Navbar = () => {
  const { userId, setSidebarOpen } = useAppStore();
  const { data: session } = useSession();
  const { data: playlist } = usePlaylistUpdates(
    userId,
    !!userId && !!session?.verified,
  );

  return (
    <NavbarContainer>
      <MenuButton
        type="button"
        aria-label="Open menu"
        onClick={() => setSidebarOpen(true)}
      >
        <MenuIcon />
      </MenuButton>

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
