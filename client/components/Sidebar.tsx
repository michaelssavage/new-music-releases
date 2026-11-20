import { HeartIcon } from "@client/components/Icons/Heart";
import { HomeIcon } from "@client/components/Icons/Home";
import {
  ArtistsIcon,
  LogoutIcon,
  PlaylistIcon,
  SidebarToggleIcon,
  SlidersIcon,
  TicketIcon,
} from "@client/components/Icons/NavIcons";
import { useSession } from "@client/hooks/use-session.hook";
import { useAppStore } from "@client/store/appStore";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, type LinkProps, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";

interface SidebarItem {
  to: LinkProps["to"];
  label: string;
  icon: ReactNode;
}

const EXPANDED_WIDTH = "14rem";
const COLLAPSED_WIDTH = "4.5rem";

const startsCollapsed = () => window.matchMedia("(max-width: 768px)").matches;

const Nav = styled.nav`
  position: sticky;
  top: 0;
  align-self: flex-start;
  flex-shrink: 0;
  width: ${EXPANDED_WIDTH};
  height: 100vh;
  overflow: hidden auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0.75rem;
  background-color: #eaecf1;
  transition: width 0.2s ease;

  &[data-collapsed="true"] {
    width: ${COLLAPSED_WIDTH};
  }
`;

const itemStyles = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1rem;
  text-align: left;
  white-space: nowrap;
  font-size: 1rem;
  text-decoration: none;
  color: #171717;
  background-color: transparent;
  cursor: pointer;

  nav[data-collapsed="true"] & {
    justify-content: center;
    padding: 0.6rem 0;
  }

  &:hover {
    background-color: rgba(78, 109, 176, 0.15);
  }

  &:focus-visible {
    outline: 1px solid #1e1e1e;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.75);
  }

  &[aria-current="page"] {
    cursor: auto;
    font-weight: bold;
    color: #eff3f2;
    background-color: #4e6db0;
  }

  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: transparent;
  }
`;

const Item = styled.button`
  ${itemStyles}
`;

const NavLink = styled(Link)`
  ${itemStyles}
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAppStore();
  const { data: session } = useSession();
  const locked = session?.verified === false;
  const [collapsed, setCollapsed] = useState(startsCollapsed);

  useEffect(() => {
    const toggleOnCommandB = (event: KeyboardEvent) => {
      if (!event.metaKey || event.key !== "b") return;
      event.preventDefault();
      setCollapsed((isCollapsed) => !isCollapsed);
    };

    window.addEventListener("keydown", toggleOnCommandB);
    return () => window.removeEventListener("keydown", toggleOnCommandB);
  }, []);

  const items: ReadonlyArray<SidebarItem> = [
    { to: "/updates", label: "Updates", icon: <PlaylistIcon /> },
    {
      to: "/saved-artists",
      label: "Saved Artists",
      icon: <ArtistsIcon />,
    },
    {
      to: "/liked-songs",
      label: "Liked Songs",
      icon: <HeartIcon size="20" />,
    },
    { to: "/seen-live", label: "Seen Live", icon: <TicketIcon /> },
    { to: "/configuration", label: "Configuration", icon: <SlidersIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Nav aria-label="Sections" data-collapsed={collapsed}>
      <NavLink
        to="/"
        activeOptions={{ exact: true }}
        title="Home"
        aria-label="Home"
      >
        <HomeIcon size={20} />
        {!collapsed && "Home"}
      </NavLink>

      {items.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          disabled={locked}
          title={locked ? `${label} (verify your account first)` : label}
          aria-label={label}
        >
          {icon}
          {!collapsed && label}
        </NavLink>
      ))}

      <Footer>
        <Item
          type="button"
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (⌘B)`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          <SidebarToggleIcon />
          {!collapsed && "Collapse"}
        </Item>
        <Item
          type="button"
          title="Logout"
          aria-label="Logout"
          onClick={handleLogout}
        >
          <LogoutIcon />
          {!collapsed && "Logout"}
        </Item>
      </Footer>
    </Nav>
  );
};
