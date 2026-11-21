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
import { useAppStore } from "@client/store/appStore";
import {
  forDesktopOnly,
  forTabletOnly,
} from "@client/styles/abstracts/mixins.styled";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Link, type LinkProps, useNavigate } from "@tanstack/react-router";
import { Fragment, type ReactNode, useEffect, useState } from "react";

interface SidebarItem {
  to: LinkProps["to"];
  label: string;
  icon: ReactNode;
}

const EXPANDED_WIDTH = "14rem";
const COLLAPSED_WIDTH = "4.5rem";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  align-self: flex-start;
  flex-shrink: 0;
  width: ${EXPANDED_WIDTH};
  height: 100dvh;
  overflow: hidden auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0.75rem;
  background-color: #eaecf1;
  transition: width 0.2s ease;

  ${forDesktopOnly(css`
    &[data-collapsed="true"] {
      width: ${COLLAPSED_WIDTH};
    }
  `)}

  ${forTabletOnly(css`
    position: fixed;
    left: 0;
    z-index: 50;
    width: min(${EXPANDED_WIDTH}, 85vw);
    visibility: hidden;
    transform: translateX(-100%);
    transition:
      transform 0.2s ease,
      visibility 0s linear 0.2s;

    &[data-open="true"] {
      visibility: visible;
      transform: none;
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s ease;
    }
  `)}
`;

const Backdrop = styled.button`
  display: none;

  ${forTabletOnly(css`
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    border: none;
    background-color: rgba(0, 0, 0, 0.5);
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.2s ease,
      visibility 0s linear 0.2s;

    &[data-open="true"] {
      visibility: visible;
      opacity: 1;
      transition: opacity 0.2s ease;
    }
  `)}
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

  ${forDesktopOnly(css`
    nav[data-collapsed="true"] & {
      justify-content: center;
      padding: 0.6rem 0;

      > span {
        display: none;
      }
    }
  `)}

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
`;

const Item = styled.button`
  ${itemStyles}
`;

const NavLink = styled(Link)`
  ${itemStyles}
`;

const CollapseItem = styled(Item)`
  ${forTabletOnly("display: none;")}
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, isSidebarOpen, setSidebarOpen } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleShortcuts = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);

      if (!event.metaKey || event.key !== "b") return;
      event.preventDefault();
      setCollapsed((isCollapsed) => !isCollapsed);
    };

    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [setSidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const items: ReadonlyArray<SidebarItem> = [
    { to: "/updates", label: "Updates", icon: <PlaylistIcon /> },
    {
      to: "/tracked",
      label: "Tracked",
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
    closeSidebar();
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Fragment>
      <Backdrop
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        data-open={isSidebarOpen}
        onClick={closeSidebar}
      />
      <Nav
        aria-label="Sections"
        data-collapsed={collapsed}
        data-open={isSidebarOpen}
      >
        <NavLink
          to="/"
          activeOptions={{ exact: true }}
          title="Home"
          aria-label="Home"
          onClick={closeSidebar}
        >
          <HomeIcon size={20} />
          <span>Home</span>
        </NavLink>

        {items.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            aria-label={label}
            onClick={closeSidebar}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}

        <Footer>
          <CollapseItem
            type="button"
            title={`${collapsed ? "Expand" : "Collapse"} sidebar (⌘B)`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            <SidebarToggleIcon />
            <span>Collapse</span>
          </CollapseItem>
          <Item
            type="button"
            title="Logout"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span>Logout</span>
          </Item>
        </Footer>
      </Nav>
    </Fragment>
  );
};
